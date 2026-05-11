# 🚀 ПОЛНАЯ ИНСТРУКЦИЯ ПО ЗАПУСКУ STELLAR

## Шаг 1: Установка зависимостей

Откройте терминал в папке проекта `/workspace/stellar` и выполните:

```bash
cd /workspace/stellar
npm install
```

**Что установится:**
- Next.js 14 (фреймворк)
- React 18 (UI библиотека)
- TypeScript (типизация)
- @supabase/supabase-js (работа с БД)
- @langchain/core (AI оркестрация)
- openai (клиент для OpenRouter)
- framer-motion (анимации)
- reactflow (графы для Mastery Map)
- tailwindcss (стили)
- И другие зависимости из package.json

**Время установки:** ~2-5 минут (зависит от интернета)

---

## Шаг 2: Настройка переменных окружения

### 2.1. Скопируйте .env.example

```bash
cp .env.example .env.local
```

### 2.2. Получите credentials

#### Supabase:
1. Зайдите на https://supabase.com
2. Создайте новый проект (назовите "stellar")
3. Выберите регион **EU (Frankfurt)** для стабильности
4. После создания перейдите в Settings → API
5. Скопируйте:
   - `Project URL` → вставьте в `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` ключ → вставьте в `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### OpenRouter API:
1. Зайдите на https://openrouter.ai/keys
2. Создайте новый API key (бесплатно)
3. Скопируйте ключ → вставьте в `OPENROUTER_API_KEY`

### 2.3. Итоговый .env.local должен выглядеть так:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2...
OPENROUTER_API_KEY=sk-or-v1-abcdef1234567890
```

---

## Шаг 3: Настройка базы данных Supabase

### 3.1. Откройте SQL Editor в Supabase

1. В дашборде Supabase перейдите в **SQL Editor** (левое меню)
2. Нажмите **New Query**

### 3.2. Выполните SQL-скрипт

Скопируйте содержимое файла `/workspace/stellar/lib/database-schema.ts` (переменную `DB_SCHEMA`) и выполните в SQL Editor.

**Альтернативно**, выполните по частям:

```sql
-- 1. Таблица пользователей
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  grade_level INTEGER CHECK (grade_level BETWEEN 8 AND 11),
  target_exam TEXT CHECK (target_exam IN ('OGE', 'EGE')),
  target_subjects TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Справочник тем
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  fipi_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  prerequisites UUID[],
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Включите pgvector
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE topics ADD COLUMN embedding vector(768);

-- 4. Таблица mastery пользователя
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

-- 5. Индексы
CREATE INDEX idx_user_topic_mastery_user ON user_topic_mastery(user_id);
CREATE INDEX idx_topics_fipi_code ON topics(fipi_code);

-- 6. Начальные данные (темы по математике)
INSERT INTO topics (subject, fipi_code, name, description, difficulty_level, estimated_hours) VALUES
('mathematics', '1.1.1', 'Числа и вычисления', 'Основные арифметические операции', 1, 5),
('mathematics', '1.1.2', 'Дроби и проценты', 'Операции с дробями и процентами', 2, 8),
('mathematics', '1.2.1', 'Алгебраические выражения', 'Преобразование выражений', 2, 10),
('mathematics', '2.3.1', 'Тригонометрия', 'Тригонометрические функции и тождества', 3, 15),
('mathematics', '3.1.1', 'Планиметрия', 'Треугольники, четырёхугольники', 3, 12),
('mathematics', '3.1.2', 'Окружность и круг', 'Свойства окружности, длина, площадь', 3, 10),
('mathematics', '4.2.1', 'Начала анализа', 'Производные и первообразные', 4, 20);
```

### 3.3. Настройте RLS (Row Level Security)

```sql
-- Включить RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_mastery ENABLE ROW LEVEL SECURITY;

-- Политики доступа
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
```

### 3.4. Настройте Authentication

1. Перейдите в **Authentication** → **Providers**
2. Включите **Email** (для начала достаточно)
3. Опционально: настройте **Google** или **VK** OAuth

---

## Шаг 4: Запуск локального сервера разработки

```bash
npm run dev
```

**Что произойдёт:**
- Запустится Next.js dev server на порту 3000
- Откроется http://localhost:3000

**Проверка:**
1. Откройте браузер: http://localhost:3000
2. Должна загрузиться главная страница
3. Попробуйте перейти на `/onboarding` — должна работать диагностика

---

## Шаг 5: Тестирование функционала

### 5.1. Онбординг

1. Перейдите на http://localhost:3000/onboarding
2. Пройдите диагностику (3-5 вопросов)
3. Проверьте, что данные сохранились в Supabase (Table Editor → user_topic_mastery)

### 5.2. Чат с AI

1. Перейдите на http://localhost:3000/chat (если есть страница)
2. Задайте вопрос: "Как решить уравнение 2x + 5 = 13?"
3. AI должен ответить наводящим вопросом, а не готовым решением

### 5.3. Mastery Map

1. Перейдите на http://localhost:3000/dashboard (если есть страница)
2. Должен отобразиться граф тем с цветами освоения

---

## Шаг 6: Деплой на Vercel

### 6.1. Установите Vercel CLI (опционально)

```bash
npm install -g vercel
```

### 6.2. Задеплойте через CLI

```bash
vercel login
vercel deploy
```

Следуйте инструкциям в терминале.

### 6.3. Или через GitHub:

1. Создайте репозиторий на GitHub
2. Запушьте код:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/stellar.git
   git push -u origin main
   ```
3. Зайдите на https://vercel.com/new
4. Импортируйте репозиторий GitHub
5. В настройках проекта добавьте environment variables (из .env.local)
6. Нажмите **Deploy**

### 6.4. После деплоя

- Приложение будет доступно по адресу: `https://stellar-YOUR_TEAM.vercel.app`
- PWA будет работать на мобильных устройствах без установки

---

## 🔧 Решение проблем

### Ошибка: "Module not found: Can't resolve '@supabase/supabase-js'"

**Решение:**
```bash
npm install @supabase/supabase-js
```

### Ошибка: "Invalid API key" для OpenRouter

**Проверьте:**
1. Ключ скопирован полностью (начинается с `sk-or-v1-`)
2. Ключ активен (проверьте на https://openrouter.ai/keys)
3. В .env.local нет лишних пробелов

### Ошибка: "relation 'topics' does not exist"

**Решение:**
1. Зайдите в Supabase SQL Editor
2. Выполните CREATE TABLE scripts из Шага 3
3. Проверьте в Table Editor, что таблицы созданы

### Ошибка CORS при запросах к API

**Решение:**
- Убедитесь, что запросы идут на `/api/chat` (Vercel API routes), а не напрямую к OpenRouter
- API routes автоматически проксируют запросы без CORS

---

## 📊 Метрики успеха MVP

После запуска отслеживайте:

1. **Activation Rate:** % пользователей, прошедших онбординг
   - Цель: >60%

2. **D7 Retention:** % вернувшихся через 7 дней
   - Цель: >40%

3. **AI Conversations per User:** Среднее число диалогов
   - Цель: >5 в неделю

4. **Score Improvement:** Разница баллов до/после 4 недель
   - Цель: +15-20 баллов

---

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте логи в терминале (`npm run dev`)
2. Проверьте консоль браузера (F12)
3. Посмотрите логи в Supabase (Logs → Query Logs)
4. Проверьте Vercel Functions logs (если задеплоено)

---

## ✅ Чеклист готовности к презентации

- [ ] Код установлен и работает локально
- [ ] Supabase настроен, таблицы созданы
- [ ] Онбординг проходит за <3 минуты
- [ ] AI отвечает наводящими вопросами (не даёт готовые ответы)
- [ ] Mastery Map отображает темы с цветами
- [ ] Predictive Progress показывает прогноз балла
- [ ] Презентация (6 слайдов) готова в Figma/PowerPoint
- [ ] Видеозапись (6 минут) сделана и проверена
- [ ] README.md заполнен контактами команды
- [ ] Демо доступно на Vercel для жюри

---

**Удачи на финале ИТ-смены Артек! 🌟**
