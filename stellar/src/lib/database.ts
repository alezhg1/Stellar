// src/lib/database.ts
import fs from 'fs';
import path from 'path';

// Интерфейсы данных
export interface Topic {
  id: string;
  name: string;
  category: string;
  mastery: number; // 0-100
}

export interface DiagnosticResult {
  userId: string;
  score: number;
  weakTopics: string[];
  strongTopics: string[];
  timestamp: string;
}

export interface UserProgress {
  userId: string;
  predictedScore: number;
  topics: Record<string, number>; // topicId -> mastery %
  history: DiagnosticResult[];
}

// Путь к файлу БД (эмуляция SQL хранения в файле)
const DB_PATH = path.join(process.cwd(), 'data', 'stellar-db.json');

// Инициализация БД если нет
function initDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initialData: Record<string, UserProgress> = {};
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
  }
}

// Чтение БД
function readDb(): Record<string, UserProgress> {
  initDb();
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// Запись БД
function writeDb(data: Record<string, UserProgress>) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// --- Функции API ---

export async function saveDiagnosticResult(result: DiagnosticResult): Promise<void> {
  const db = readDb();
  if (!db[result.userId]) {
    db[result.userId] = {
      userId: result.userId,
      predictedScore: 50, // Стартовый прогноз
      topics: {},
      history: []
    };
  }
  
  // Обновляем историю
  db[result.userId].history.push(result);
  
  // Простая логика обновления тем (в реальности тут будет сложная логика)
  result.weakTopics.forEach(topic => {
    db[result.userId].topics[topic] = Math.min(100, (db[result.userId].topics[topic] || 0) + 10);
  });
  
  writeDb(db);
}

export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  const db = readDb();
  return db[userId] || null;
}

export async function updatePredictedScore(userId: string, score: number): Promise<void> {
  const db = readDb();
  if (db[userId]) {
    db[userId].predictedScore = score;
    writeDb(db);
  }
}

export async function getTopics(): Promise<Topic[]> {
  // Статический список тем для MVP (можно вынести в отдельный JSON)
  return [
    { id: 'alg-1', name: 'Линейные уравнения', category: 'Алгебра', mastery: 0 },
    { id: 'alg-2', name: 'Квадратные корни', category: 'Алгебра', mastery: 0 },
    { id: 'geo-1', name: 'Треугольники', category: 'Геометрия', mastery: 0 },
    { id: 'geo-2', name: 'Окружность', category: 'Геометрия', mastery: 0 },
    { id: 'trig-1', name: 'Синус и Косинус', category: 'Тригонометрия', mastery: 0 },
  ];
}