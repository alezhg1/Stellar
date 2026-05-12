/**
 * Database client for plain PostgreSQL
 * Использует node-postgres (pg) для подключения к БД
 */

import { Pool, PoolClient } from 'pg';

// Интерфейсы данных
export interface Topic {
  id: string;
  fipi_code: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  difficulty_level: number;
  mastery?: number;
}

export interface DiagnosticQuestion {
  id: string;
  topic_id: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation: string | null;
  difficulty: number;
}

export interface DiagnosticResponse {
  id: string;
  user_id: string;
  question_id: string;
  selected_option: number;
  is_correct: boolean;
  time_spent_seconds: number | null;
  created_at: string;
}

export interface UserTopicMastery {
  id: string;
  user_id: string;
  topic_id: string;
  accuracy: number;
  attempts: number;
  last_practiced_at: string | null;
}

export interface ChatLog {
  id: string;
  user_id: string | null;
  message: string;
  response: string;
  fipi_code_reference: string | null;
  topic_context: string | null;
  tokens_used: number | null;
  created_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  duration_minutes: number | null;
  topics_covered: string[];
  problems_solved: number;
  accuracy: number | null;
  created_at: string;
}

// Пул подключений к PostgreSQL
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL не настроен. Проверьте .env.local');
    }
    
    pool = new Pool({
      connectionString,
      max: 10, // Максимум подключений в пуле
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    // Обработка ошибок пула
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  
  return pool;
}

// ============================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЯМИ
// ============================================

export async function createProfile(data: {
  email: string;
  full_name?: string;
  grade_level?: number;
  target_exam?: 'OGE' | 'EGE';
  target_subjects?: string[];
}): Promise<{ id: string }> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query(
      `INSERT INTO profiles (email, full_name, grade_level, target_exam, target_subjects)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        data.email,
        data.full_name || null,
        data.grade_level || null,
        data.target_exam || null,
        data.target_subjects || null,
      ]
    );
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getProfile(userId: string): Promise<{
  id: string;
  email: string;
  full_name: string | null;
  grade_level: number | null;
  target_exam: string | null;
} | null> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query(
      'SELECT id, email, full_name, grade_level, target_exam FROM profiles WHERE id = $1',
      [userId]
    );
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// ============================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ТЕМАМИ
// ============================================

export async function getAllTopics(): Promise<Topic[]> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM topics ORDER BY fipi_code'
    );
    
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getTopicByFipiCode(fipiCode: string): Promise<Topic | null> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM topics WHERE fipi_code = $1',
      [fipiCode]
    );
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Семантический поиск тем через векторы
export async function searchSimilarTopics(embedding: number[], limit = 5): Promise<Topic[]> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query(
      `SELECT *, embedding <-> $1::vector AS similarity
       FROM topics
       ORDER BY embedding <-> $1::vector
       LIMIT $2`,
      [embedding, limit]
    );
    
    return result.rows;
  } finally {
    client.release();
  }
}

// ============================================
// ФУНКЦИИ ДЛЯ ДИАГНОСТИКИ
// ============================================

export async function getDiagnosticQuestions(topicId?: string): Promise<DiagnosticQuestion[]> {
  const client = await getPool().connect();
  
  try {
    let query = 'SELECT * FROM diagnostic_questions';
    const params: any[] = [];
    
    if (topicId) {
      query += ' WHERE topic_id = $1';
      params.push(topicId);
    }
    
    query += ' ORDER BY difficulty, id';
    
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function saveDiagnosticResponse(data: {
  user_id: string;
  question_id: string;
  selected_option: number;
  is_correct: boolean;
  time_spent_seconds?: number;
}): Promise<{ id: string }> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query(
      `INSERT INTO diagnostic_responses 
       (user_id, question_id, selected_option, is_correct, time_spent_seconds)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        data.user_id,
        data.question_id,
        data.selected_option,
        data.is_correct,
        data.time_spent_seconds || null,
      ]
    );
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

// ============================================
// ФУНКЦИИ ДЛЯ УПРАВЛЕНИЯ ПРОГРЕССОМ
// ============================================

export async function getUserTopicMastery(userId: string): Promise<UserTopicMastery[]> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM user_topic_mastery WHERE user_id = $1',
      [userId]
    );
    
    return result.rows;
  } finally {
    client.release();
  }
}

export async function updateTopicMastery(data: {
  user_id: string;
  topic_id: string;
  accuracy: number;
  attempts?: number;
}): Promise<void> {
  const client = await getPool().connect();
  
  try {
    await client.query(
      `INSERT INTO user_topic_mastery (user_id, topic_id, accuracy, attempts, last_practiced_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, topic_id) DO UPDATE
       SET accuracy = $3, attempts = COALESCE(user_topic_mastery.attempts + $4, $4), last_practiced_at = NOW()`,
      [data.user_id, data.topic_id, data.accuracy, data.attempts || 1]
    );
  } finally {
    client.release();
  }
}

// Расчёт прогнозируемого балла ЕГЭ
export async function calculatePredictedScore(userId: string): Promise<number> {
  const client = await getPool().connect();
  
  try {
    // Получаем все темы с весами (веса можно хранить в отдельной таблице)
    const topicWeights: Record<string, number> = {
      '1.1.1': 8, '1.1.2': 8, '1.2.1': 10, '1.2.2': 9,
      '1.3.1': 11, '1.3.2': 6, '1.4.1': 8,
      '2.1.1': 7, '2.1.2': 5, '2.2.1': 3, '2.3.1': 4,
    };
    
    const result = await client.query(
      `SELECT t.fipi_code, COALESCE(m.accuracy, 0) as accuracy
       FROM topics t
       LEFT JOIN user_topic_mastery m ON t.id = m.topic_id AND m.user_id = $1`,
      [userId]
    );
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const row of result.rows) {
      const weight = topicWeights[row.fipi_code] || 5;
      totalWeight += weight;
      weightedSum += parseFloat(row.accuracy) * weight;
    }
    
    if (totalWeight === 0) return 0;
    
    const baseScore = (weightedSum / totalWeight) * 100;
    
    // Бонус за стабильность (все темы выше 50%)
    const allAboveThreshold = result.rows.every((r: any) => parseFloat(r.accuracy) >= 0.5);
    const bonus = allAboveThreshold ? 5 : 0;
    
    return Math.min(100, Math.round(baseScore + bonus));
  } finally {
    client.release();
  }
}

// ============================================
// ФУНКЦИИ ДЛЯ ЧАТА С AI
// ============================================

export async function saveChatLog(data: {
  user_id: string | null;
  message: string;
  response: string;
  fipi_code_reference?: string | null;
  topic_context?: string | null;
  tokens_used?: number | null;
}): Promise<{ id: string }> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query(
      `INSERT INTO chat_logs 
       (user_id, message, response, fipi_code_reference, topic_context, tokens_used)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        data.user_id,
        data.message,
        data.response,
        data.fipi_code_reference || null,
        data.topic_context || null,
        data.tokens_used || null,
      ]
    );
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getUserChatHistory(userId: string, limit = 20): Promise<ChatLog[]> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query(
      `SELECT * FROM chat_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    
    return result.rows;
  } finally {
    client.release();
  }
}

// ============================================
// ФУНКЦИИ ДЛЯ УЧЕБНЫХ СЕССИЙ
// ============================================

export async function createStudySession(data: {
  user_id: string;
  duration_minutes?: number;
  topics_covered?: string[];
  problems_solved?: number;
  accuracy?: number;
}): Promise<{ id: string }> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query(
      `INSERT INTO study_sessions 
       (user_id, duration_minutes, topics_covered, problems_solved, accuracy)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        data.user_id,
        data.duration_minutes || null,
        data.topics_covered || null,
        data.problems_solved || 0,
        data.accuracy || null,
      ]
    );
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getUserStudySessions(userId: string, limit = 10): Promise<StudySession[]> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query(
      `SELECT * FROM study_sessions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    
    return result.rows;
  } finally {
    client.release();
  }
}

// ============================================
// УТИЛИТЫ
// ============================================

export async function testConnection(): Promise<boolean> {
  const client = await getPool().connect();
  
  try {
    await client.query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
