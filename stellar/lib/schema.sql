-- Stellar Database Schema (PostgreSQL)
-- Для использования с обычным SQL вместо Supabase

-- Включаем расширение для векторного поиска (если доступно)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- ТАБЛИЦЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ И АУТЕНТИФИКАЦИИ
-- ============================================

-- Профили пользователей
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  grade_level INTEGER CHECK (grade_level BETWEEN 8 AND 11),
  target_exam TEXT CHECK (target_exam IN ('OGE', 'EGE')),
  target_subjects TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Справочник тем по кодификатору ФИПИ
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL DEFAULT 'mathematics',
  fipi_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES topics(id),
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_hours INTEGER,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для тем
CREATE INDEX IF NOT EXISTS idx_topics_fipi_code ON topics(fipi_code);
CREATE INDEX IF NOT EXISTS idx_topics_parent ON topics(parent_id);
CREATE INDEX IF NOT EXISTS idx_topics_embedding ON topics USING ivfflat (embedding vector_cosine_ops);

-- ============================================
-- ТАБЛИЦЫ ДЛЯ ПРОГРЕССА И ДИАГНОСТИКИ
-- ============================================

-- Уровень освоения тем пользователем
CREATE TABLE IF NOT EXISTS user_topic_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id),
  accuracy DECIMAL(5,4) CHECK (accuracy BETWEEN 0 AND 1) DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_user_topic_mastery_user ON user_topic_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_mastery_topic ON user_topic_mastery(topic_id);

-- Вопросы для диагностики (привязаны к темам ФИПИ)
CREATE TABLE IF NOT EXISTS diagnostic_questions (
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
CREATE TABLE IF NOT EXISTS diagnostic_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES diagnostic_questions(id),
  selected_option INTEGER NOT NULL,
  is_correct BOOLEAN,
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_responses_user ON diagnostic_responses(user_id);

-- ============================================
-- ТАБЛИЦЫ ДЛЯ ЧАТА С AI
-- ============================================

-- Логи чатов с AI (для аналитики и улучшения модели)
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  fipi_code_reference TEXT,
  topic_context UUID REFERENCES topics(id),
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_user ON chat_logs(user_id, created_at DESC);

-- ============================================
-- ТАБЛИЦЫ ДЛЯ УЧЕБНЫХ СЕССИЙ
-- ============================================

-- Учебные сессии
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  duration_minutes INTEGER,
  topics_covered UUID[] REFERENCES topics(id),
  problems_solved INTEGER DEFAULT 0,
  accuracy DECIMAL(5,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id, created_at DESC);

-- Персональные учебные планы
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  focus_topics UUID[] REFERENCES topics(id),
  recommended_daily_minutes INTEGER DEFAULT 30,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- ============================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автообновления updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_topic_mastery_updated_at ON user_topic_mastery;
CREATE TRIGGER update_user_topic_mastery_updated_at BEFORE UPDATE ON user_topic_mastery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- НАЧАЛЬНЫЕ ДАННЫЕ: ТЕМЫ ПО МАТЕМАТИКЕ (ФИПИ)
-- ============================================

INSERT INTO topics (subject, fipi_code, name, description, difficulty_level, estimated_hours) VALUES
('mathematics', '1.1.1', 'Числа и вычисления', 'Основные арифметические операции, дроби, проценты', 1, 5),
('mathematics', '1.1.2', 'Алгебраические выражения', 'Преобразование алгебраических выражений', 2, 8),
('mathematics', '1.2.1', 'Уравнения', 'Линейные, квадратные, рациональные уравнения', 2, 10),
('mathematics', '1.2.2', 'Неравенства', 'Линейные и квадратные неравенства', 2, 10),
('mathematics', '1.3.1', 'Функции', 'Свойства функций, графики', 3, 12),
('mathematics', '1.3.2', 'Логарифмы', 'Логарифмические функции и уравнения', 3, 10),
('mathematics', '1.4.1', 'Тригонометрия', 'Тригонометрические функции и тождества', 3, 15),
('mathematics', '2.1.1', 'Планиметрия', 'Треугольники, четырёхугольники, окружности', 3, 12),
('mathematics', '2.1.2', 'Стереометрия', 'Объёмные фигуры, площади поверхностей', 4, 15),
('mathematics', '2.2.1', 'Теория вероятностей', 'Вероятность событий, комбинаторика', 2, 8),
('mathematics', '2.3.1', 'Начала анализа', 'Производные, первообразные', 4, 20);

-- ============================================
-- ПРИМЕРЫ ВОПРОСОВ ДЛЯ ДИАГНОСТИКИ
-- ============================================

INSERT INTO diagnostic_questions (topic_id, question_text, options, correct_option, explanation, difficulty) 
SELECT 
  t.id,
  q.question_text,
  q.options,
  q.correct_option,
  q.explanation,
  q.difficulty
FROM (
  VALUES
    ('1.1.1', 'Найдите корень уравнения: 2x + 5 = 15', ARRAY['5', '10', '7.5', '2.5'], 1, 'Перенесите 5 в правую часть и разделите на 2', 1),
    ('1.4.1', 'Вычислите: sin(30°) * cos(60°)', ARRAY['0.25', '0.5', '1', '0.75'], 1, 'sin(30°)=0.5, cos(60°)=0.5, произведение = 0.25', 2),
    ('1.2.2', 'Решите неравенство: x² - 4 > 0', ARRAY['(-∞; -2) ∪ (2; +∞)', '(-2; 2)', '[−2; 2]', '∅'], 1, 'Разложите на множители: (x-2)(x+2) > 0', 3),
    ('2.3.1', 'Найдите производную функции: f(x) = x³ + 2x', ARRAY['3x² + 2', 'x² + 2', '3x²', 'x³ + 2'], 1, 'Производная суммы равна сумме производных', 3),
    ('1.3.2', 'Чему равен log₂(8)?', ARRAY['3', '2', '4', '1'], 1, '2³ = 8, значит log₂(8) = 3', 2),
    ('2.1.1', 'Найдите площадь круга радиусом 5', ARRAY['25π', '10π', '5π', '50π'], 1, 'S = πr² = π * 25', 2),
    ('1.1.1', 'Решите уравнение: 2^x = 16', ARRAY['4', '8', '2', '16'], 1, '16 = 2⁴, значит x = 4', 1),
    ('1.1.2', 'Найдите значение выражения: (a-b)(a+b) при a=5, b=3', ARRAY['16', '8', '2', '32'], 1, '(a-b)(a+b) = a² - b² = 25 - 9 = 16', 1),
    ('2.2.1', 'Какова вероятность выпадения четного числа на кубике?', ARRAY['0.5', '0.25', '0.33', '0.67'], 1, 'Чётные числа: 2, 4, 6 — всего 3 из 6', 1),
    ('2.1.1', 'Найдите угол между касательной и радиусом в точке касания', ARRAY['90°', '45°', '60°', '30°'], 1, 'Касательная перпендикулярна радиусу', 2)
) AS q(fipi_code, question_text, options, correct_option, explanation, difficulty)
JOIN topics t ON t.fipi_code = q.fipi_code;
