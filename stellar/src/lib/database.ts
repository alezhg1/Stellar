// Простая SQL-база данных на основе JSON-файла для MVP
// В production замени на PostgreSQL/Supabase

import { promises as fs } from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'stellar-db.json');

export interface Topic {
  id: string;
  name: string;
  parent_id: string | null;
  weight: number;
  fipi_code?: string;
}

export interface DiagnosticResult {
  id: string;
  user_id: string;
  topic_id: string;
  is_correct: boolean;
  created_at: string;
}

export interface UserProgress {
  user_id: string;
  predicted_score: number;
  topics_mastery: Record<string, number>;
  last_updated: string;
}

export interface Database {
  topics: Topic[];
  diagnostics: DiagnosticResult[];
  user_progress: UserProgress[];
}

async function ensureDbExists(): Promise<void> {
  const dir = path.dirname(DB_PATH);
  await fs.mkdir(dir, { recursive: true });
  
  try {
    await fs.access(DB_PATH);
  } catch {
    const initialDb: Database = {
      topics: [
        { id: '1', name: 'Алгебра', parent_id: null, weight: 10, fipi_code: 'ALG' },
        { id: '2', name: 'Геометрия', parent_id: null, weight: 10, fipi_code: 'GEO' },
        { id: '3', name: 'Тригонометрия', parent_id: '2', weight: 5, fipi_code: 'TRIG' },
        { id: '4', name: 'Уравнения', parent_id: '1', weight: 8, fipi_code: 'EQ' },
        { id: '5', name: 'Функции', parent_id: '1', weight: 7, fipi_code: 'FUNC' },
      ],
      diagnostics: [],
      user_progress: [],
    };
    await fs.writeFile(DB_PATH, JSON.stringify(initialDb, null, 2));
  }
}

async function readDb(): Promise<Database> {
  await ensureDbExists();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data) as Database;
}

async function writeDb(db: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

export async function saveDiagnosticResult(
  userId: string,
  topicId: string,
  isCorrect: boolean
): Promise<void> {
  const db = await readDb();
  const newDiagnostic: DiagnosticResult = {
    id: crypto.randomUUID(),
    user_id: userId,
    topic_id: topicId,
    is_correct: isCorrect,
    created_at: new Date().toISOString(),
  };
  db.diagnostics.push(newDiagnostic);
  await writeDb(db);
}

export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  const db = await readDb();
  return db.user_progress.find(p => p.user_id === userId) || null;
}

export async function updatePredictedScore(
  userId: string,
  score: number,
  topicsMastery: Record<string, number>
): Promise<void> {
  const db = await readDb();
  const existingIndex = db.user_progress.findIndex(p => p.user_id === userId);
  
  const progress: UserProgress = {
    user_id: userId,
    predicted_score: score,
    topics_mastery: topicsMastery,
    last_updated: new Date().toISOString(),
  };
  
  if (existingIndex >= 0) {
    db.user_progress[existingIndex] = progress;
  } else {
    db.user_progress.push(progress);
  }
  
  await writeDb(db);
}

export async function getTopics(): Promise<Topic[]> {
  const db = await readDb();
  return db.topics;
}

export async function getUserDiagnostics(userId: string): Promise<DiagnosticResult[]> {
  const db = await readDb();
  return db.diagnostics.filter(d => d.user_id === userId);
}
