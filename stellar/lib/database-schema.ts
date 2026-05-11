export const DB_SCHEMA = `
-- Таблица пользователей (расширяет Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  grade_level INTEGER CHECK (grade_level BETWEEN 8 AND 11),
  target_exam TEXT CHECK (target_exam IN ('OGE', 'EGE')),
  target_subjects TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Справочник тем по кодификатору ФИПИ
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  fipi_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  prerequisites UUID[] REFERENCES topics(id),
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Векторные эмбеддинги тем для семантического поиска
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE topics ADD COLUMN embedding vector(768);

-- Уровень освоения тем пользователем
CREATE TABLE user_topic_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id),
  accuracy DECIMAL(5,4) CHECK (accuracy BETWEEN 0 AND 1),
  attempts INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_user_topic_mastery_user ON user_topic_mastery(user_id);
CREATE INDEX idx_user_topic_mastery_topic ON user_topic_mastery(topic_id);
CREATE INDEX idx_topics_fipi_code ON topics(fipi_code);

-- Поиск по векторам (семантический поиск похожих тем)
CREATE INDEX idx_topics_embedding ON topics USING ivfflat (embedding vector_cosine_ops);

-- Учебные сессии
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  duration_minutes INTEGER,
  topics_covered UUID[] REFERENCES topics(id),
  problems_solved INTEGER DEFAULT 0,
  accuracy DECIMAL(5,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_study_sessions_user ON study_sessions(user_id, created_at DESC);

-- Персональные учебные планы
CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  focus_topics UUID[] REFERENCES topics(id),
  recommended_daily_minutes INTEGER DEFAULT 30,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Логи чатов с AI (для аналитики и улучшения модели)
CREATE TABLE chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  fipi_code_reference TEXT,
  topic_context UUID REFERENCES topics(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_logs_user ON chat_logs(user_id, created_at DESC);

-- Вопросы для диагностики (привязаны к темам ФИПИ)
CREATE TABLE diagnostic_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id),
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_option INTEGER NOT NULL,
  explanation TEXT,
  fipi_code TEXT REFERENCES topics(fipi_code),
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ответы пользователя на диагностические вопросы
CREATE TABLE diagnostic_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES diagnostic_questions(id),
  selected_option INTEGER NOT NULL,
  is_correct BOOLEAN,
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автообновления updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_topic_mastery_updated_at BEFORE UPDATE ON user_topic_mastery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) политики
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Политики доступа (пользователь видит только свои данные)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own mastery" ON user_topic_mastery
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mastery" ON user_topic_mastery
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mastery" ON user_topic_mastery
  FOR UPDATE USING (auth.uid() = user_id);

-- Аналогично для остальных таблиц...

-- Начальные данные: темы по математике (пример)
INSERT INTO topics (subject, fipi_code, name, description, difficulty_level, estimated_hours) VALUES
('mathematics', '1.1.1', 'Числа и вычисления', 'Основные арифметические операции', 1, 5),
('mathematics', '1.1.2', 'Дроби и проценты', 'Операции с дробями и процентами', 2, 8),
('mathematics', '1.2.1', 'Алгебраические выражения', 'Преобразование выражений', 2, 10),
('mathematics', '2.3.1', 'Тригонометрия', 'Тригонометрические функции и тождества', 3, 15),
('mathematics', '3.1.1', 'Планиметрия', 'Треугольники, четырёхугольники', 3, 12),
('mathematics', '3.1.2', 'Окружность и круг', 'Свойства окружности, длина, площадь', 3, 10),
('mathematics', '4.2.1', 'Начала анализа', 'Производные и первообразные', 4, 20);
`;

export const SUPABASE_SETUP_INSTRUCTIONS = `
# Настройка Supabase

1. Создайте проект на https://supabase.com
2. Выберите EU регион (Frankfurt) для стабильности
3. В SQL Editor выполните скрипт DB_SCHEMA выше
4. Получите credentials:
   - Project URL: https://xxx.supabase.co
   - Anon Key: eyJhbG...
   - Service Role Key: eyJhbG... (только для сервера!)

5. Включите Auth providers:
   - Email/Password
   - Google OAuth (опционально)
   - VK OAuth (для РФ)

6. Настройте pgvector:
   - В Database → Extensions включите 'vector'
   - Убедитесь, что размерность 768 (для OpenAI embeddings)

7. Для семантического поиска тем потребуется заполнить embedding:
   - Используйте OpenRouter API для генерации эмбеддингов
   - Или предзаполните офлайн через Python скрипт
`;
