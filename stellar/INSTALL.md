# 📦 Инструкция по установке и запуску Stellar

## ⚠️ Критическое исправление

Проблема с `better-sqlite3` решена: мы перешли на **Supabase** (PostgreSQL + Auth + pgvector) как указано в ТЗ. Это даёт:
- ✅ Работу на Node.js v24 без компиляции нативных модулей
- ✅ Векторный поиск через pgvector для семантического анализа ошибок
- ✅ Готовую аутентификацию
- ✅ Синхронизацию данных между устройствами
- ✅ EU-регион для стабильности

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd /workspace/stellar
npm install
```

**Что устанавливается:**
- `next`, `react`, `typescript` — основа приложения
- `@supabase/supabase-js` — клиент Supabase
- `openai` — клиент OpenRouter API
- `reactflow` — визуализация карты знаний
- `zustand` — состояние приложения
- `framer-motion` — анимации
- `lucide-react` — иконки
- `tailwindcss` — стилизация

### 2. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```bash
cp .env.example .env.local
```

Отредактируйте `.env.local`:

```env
# OpenRouter API ключ (бесплатно, получите на https://openrouter.ai/keys)
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here

# Supabase (создайте проект на https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# URL приложения (для OpenRouter)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Инициализация базы данных Supabase

1. Зайдите в [Supabase Dashboard](https://app.supabase.com)
2. Создайте новый проект (выберите EU-регион для стабильности)
3. Откройте **SQL Editor** и выполните следующий скрипт:

```sql
-- Включаем расширение pgvector для семантического поиска
CREATE EXTENSION IF NOT EXISTS vector;

-- Таблица тем с иерархией
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES topics(id),
  weight INTEGER DEFAULT 1,
  fipi_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица результатов диагностики
CREATE TABLE diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  topic_id UUID REFERENCES topics(id),
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Прогресс пользователя (rollup)
CREATE TABLE user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  predicted_score INTEGER DEFAULT 0,
  topics_mastery JSONB DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Векторные эмбеддинги тем для семантического поиска
CREATE TABLE topic_embeddings (
  topic_id UUID PRIMARY KEY REFERENCES topics(id),
  embedding vector(1536),
  content_text TEXT
);

-- Индекс для быстрого семантического поиска
CREATE INDEX ON topic_embeddings USING ivfflat (embedding vector_cosine_ops);

-- RLS политики (безопасность)
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Разрешаем чтение тем всем
CREATE POLICY "Topics are viewable by all" ON topics
  FOR SELECT USING (true);

-- Пользователи видят только свои данные
CREATE POLICY "Users can view own diagnostics" ON diagnostics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnostics" ON diagnostics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Начальные данные (темы ЕГЭ по математике)
INSERT INTO topics (name, fipi_code, weight) VALUES
  ('Алгебра (базовая)', 'ALG-001', 8),
  ('Уравнения', 'ALG-002', 10),
  ('Неравенства', 'ALG-003', 9),
  ('Функции', 'ALG-004', 11),
  ('Тригонометрия', 'TRIG-001', 8),
  ('Логарифмы', 'LOG-001', 6),
  ('Производные', 'CALC-001', 4),
  ('Планиметрия', 'GEO-001', 7),
  ('Стереометрия', 'GEO-002', 5),
  ('Теория вероятностей', 'PROB-001', 3);
```

### 4. Запуск приложения

```bash
# Режим разработки (http://localhost:3000)
npm run dev

# Сборка для продакшена
npm run build

# Продакшен сервер
npm start
```

---

## 🏗 Архитектура проекта

```
stellar/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/chat/route.ts   # AI чат (OpenRouter + Socratic prompt)
│   │   ├── onboarding/page.tsx # Диагностика при первом входе
│   │   ├── dashboard/page.tsx  # Главная панель
│   │   ├── layout.tsx          # Базовый лейаут
│   │   └── globals.css         # Глобальные стили
│   ├── components/             # React компоненты
│   │   ├── SocraticChat.tsx    # Чат с AI-тьютором
│   │   ├── MasteryMap.tsx      # Карта знаний (React Flow)
│   │   └── Onboarding.tsx      # Компонент диагностики
│   ├── lib/                    # Утилиты и конфигурации
│   │   ├── constants.ts        # Константы, промпты, вопросы
│   │   ├── supabase.ts         # Клиент Supabase
│   │   └── utils.ts            # Helper функции
│   ├── store/                  # Zustand store
│   │   └── useAppStore.ts      # Глобальное состояние
│   └── types/                  # TypeScript типы
│       └── index.ts
├── public/
│   ├── manifest.json           # PWA манифест
│   └── icon-*.png              # Иконки PWA
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

---

## 🔑 Ключевые фичи MVP

### 1. Socratic Orchestrator
AI никогда не даёт готовый ответ. Системный промпт в `src/lib/constants.ts`:
- Запрещает выдачу финального ответа
- Требует разбивать задачу на микро-шаги (scaffolding)
- Обязывает задавать проверочные вопросы
- Поддерживающий тон, как у старшего товарища

### 2. Semantic Knowledge Graph (Mastery Map)
- Визуализация через React Flow
- Цветовая индикация уровня усвоения (зелёный/жёлтый/оранжевый/серый)
- Иерархическая структура тем (родитель → потомки)
- Ошибка по тригонометрии подсвечивает корень проблемы

### 3. Predictive Progress
- Логистическая регрессия на основе взвешенных тем
- Веса тем из кодификатора ФИПИ
- Бонус за стабильность (все темы >50%)
- Прогноз итогового балла ЕГЭ (0-100)

### 4. Онбординг-диагностика
- 10 вопросов по всем темам
- Мгновенная карта пробелов
- Персональный план на неделю

---

## 📱 PWA вместо нативного приложения

**Почему PWA в MVP:**
1. **Кроссплатформенность** — работает на iOS, Android, Desktop
2. **Нулевая установка** — добавляется на домашний экран одним тапом
3. **Быстрый деплой** — Vercel разворачивает за секунды
4. **Работа в РФ** — Vercel не заблокирован, нет проблем с App Store/Google Play
5. **Offline-режим** — Service Worker кэширует статические ресурсы
6. **Push-уведомления** — поддерживаются на Android (iOS с ограничениями)

**Нативные версии (v2.0):** React Native или Flutter, когда будет 10k+ пользователей.

---

## 🎯 Метрики успеха MVP

| Метрика | Цель | Как измеряется |
|---------|------|----------------|
| Activation Rate | >60% | Прошли онбординг → начали чат |
| Retention D7 | >40% | Вернулись через 7 дней |
| Session Duration | >8 мин | Среднее время сессии |
| Problems Solved | >3/сессия | Решённых задач за сессию |
| Score Improvement | +15 баллов | Прогноз до/после месяца |

---

## 🐛 Troubleshooting

### Ошибка: `Module not found: Can't resolve 'reactflow'`
```bash
npm install reactflow
```

### Ошибка: `OPENROUTER_API_KEY is not defined`
Проверьте, что файл `.env.local` существует и содержит ключ:
```bash
cat .env.local
```

### Ошибка: `Supabase client is not configured`
Убедитесь, что переменные `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` заданы в `.env.local`.

### Ошибка компиляции TypeScript
```bash
npx tsc --noEmit
```

---

## 📚 Дополнительные ресурсы

- [Документация Next.js](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenRouter API](https://openrouter.ai/docs)
- [React Flow Docs](https://reactflow.dev/docs)
- [Zustand Guide](https://zustand-demo.pmnd.rs/)

---

## 👥 Команда

Проект реализуется командой из 2-3 человек за 1-2 месяца:
- **Frontend** — React/Next.js, Tailwind, Framer Motion
- **Backend/AI** — API Routes, OpenRouter, промпт-инжиниринг
- **Design** — Figma, generative UI, мобильный-first

---

## 📄 Лицензия

Проект создан для участия в ИТ-смене Артек 2025.
