import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Путь к файлу БД в корне проекта
const dbPath = path.join(process.cwd(), 'stellar.db');

export const db = new Database(dbPath);

// Инициализация таблиц
export function initDatabase() {
  // Таблица пользователей (упрощенная)
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      grade_level INTEGER CHECK (grade_level BETWEEN 8 AND 11),
      target_exam TEXT CHECK (target_exam IN ('OGE', 'EGE')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица тем (справочник ФИПИ)
  db.exec(`
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      fipi_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      prerequisites TEXT, -- JSON массив ID предшествующих тем
      difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица прогресса пользователя
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_topic_mastery (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      accuracy REAL CHECK (accuracy BETWEEN 0 AND 1),
      attempts INTEGER DEFAULT 0,
      last_practiced DATETIME,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES topics(id),
      UNIQUE(user_id, topic_id)
    )
  `);

  // Таблица сессий чата
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    )
  `);

  // Таблица сообщений чата
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT CHECK (role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    )
  `);

  // Проверка, есть ли уже темы, если нет — заполняем
  const count = db.prepare('SELECT COUNT(*) as count FROM topics').get() as { count: number };
  
  if (count.count === 0) {
    console.log('🌱 Заполнение базы данных темами ФИПИ...');
    
    const insertTopic = db.prepare(`
      INSERT INTO topics (id, subject, fipi_code, name, description, prerequisites, difficulty_level)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const topics = [
      ['t1', 'mathematics', '1.1.1', 'Числа и вычисления', 'Действия с натуральными числами, дробями, степенями', '[]', 1],
      ['t2', 'mathematics', '1.2.1', 'Алгебраические выражения', 'Тождественные преобразования, формулы сокращенного умножения', '["t1"]', 2],
      ['t3', 'mathematics', '1.3.1', 'Линейные уравнения', 'Решение уравнений вида ax+b=0', '["t2"]', 2],
      ['t4', 'mathematics', '2.1.1', 'Функции и графики', 'Свойства функций, область определения', '["t3"]', 3],
      ['t5', 'mathematics', '2.3.1', 'Тригонометрия', 'Синус, косинус, тангенс, основные тождества', '["t4", "t2"]', 3],
      ['t6', 'mathematics', '3.1.1', 'Планиметрия', 'Треугольники, окружности, площади фигур', '["t1", "t2"]', 3],
      ['t7', 'mathematics', '3.2.1', 'Стереометрия', 'Объемы и площади поверхностей тел', '["t6"]', 4],
      ['t8', 'mathematics', '4.1.1', 'Теория вероятностей', 'Классическое определение вероятности', '["t1"]', 2],
      ['t9', 'mathematics', '4.2.1', 'Начала анализа', 'Производная, первообразная, исследование функций', '["t4", "t5"]', 4],
      ['t10', 'mathematics', '5.1.1', 'Текстовые задачи', 'Задачи на движение, работу, проценты', '["t3", "t8"]', 3],
    ];

    const transaction = db.transaction((items: any[]) => {
      for (const item of items) {
        insertTopic.run(...item);
      }
    });

    transaction(topics);
    console.log('✅ База данных готова!');
  } else {
    console.log('✅ База данных уже инициализирована.');
  }
}

// Хелперы для работы с БД
export const queries = {
  createUser: db.prepare(`
    INSERT INTO profiles (id, full_name, grade_level, target_exam)
    VALUES (?, ?, ?, ?)
  `),
  
  getUserById: db.prepare(`
    SELECT * FROM profiles WHERE id = ?
  `),
  
  getAllTopics: db.prepare(`
    SELECT * FROM topics ORDER BY difficulty_level, fipi_code
  `),
  
  getTopicById: db.prepare(`
    SELECT * FROM topics WHERE id = ?
  `),
  
  getUserMastery: db.prepare(`
    SELECT t.*, utm.accuracy, utm.attempts, utm.last_practiced
    FROM topics t
    LEFT JOIN user_topic_mastery utm ON t.id = utm.topic_id AND utm.user_id = ?
    ORDER BY t.difficulty_level
  `),
  
  updateMastery: db.prepare(`
    INSERT INTO user_topic_mastery (id, user_id, topic_id, accuracy, attempts, last_practiced)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, topic_id) DO UPDATE SET
      accuracy = excluded.accuracy,
      attempts = excluded.attempts,
      last_practiced = CURRENT_TIMESTAMP
  `),
  
  createSession: db.prepare(`
    INSERT INTO chat_sessions (id, user_id, topic_id)
    VALUES (?, ?, ?)
  `),
  
  saveMessage: db.prepare(`
    INSERT INTO chat_messages (id, session_id, role, content)
    VALUES (?, ?, ?, ?)
  `),
  
  getSessionMessages: db.prepare(`
    SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC
  `),
  
  // Простой поиск тем по названию (замена векторам для MVP)
  searchTopics: db.prepare(`
    SELECT * FROM topics WHERE name LIKE ? OR description LIKE ? OR fipi_code LIKE ?
  `)
};
