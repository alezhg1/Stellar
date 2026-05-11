# ⚡ БЫСТРЫЙ СТАРТ — STELLAR

## 1️⃣ УСТАНОВКА ЗАВИСИМОСТЕЙ (2-5 минут)

```bash
cd /workspace/stellar
npm install
```

**Команда установит все зависимости из package.json:**
- next@^14.2.0
- react@^18.3.0
- @supabase/supabase-js@^2.42.0
- @langchain/core@^0.2.0
- openai@^4.40.0
- framer-motion@^11.0.0
- reactflow@^11.11.0
- lucide-react@^0.378.0
- zustand@^4.5.0
- tailwindcss@^3.4.0
- typescript@^5.4.0
- И другие

---

## 2️⃣ НАСТРОЙКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ (5 минут)

```bash
cp .env.example .env.local
```

**Откройте `.env.local` и заполните:**

### Supabase credentials:
1. https://supabase.com → Create Project → EU Region
2. Settings → API → Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### OpenRouter API key:
1. https://openrouter.ai/keys → Create Key
2. Copy → `OPENROUTER_API_KEY`

**Пример готового `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENROUTER_API_KEY=sk-or-v1-abc123def456
```

---

## 3️⃣ НАСТРОЙКА БАЗЫ ДАННЫХ (5 минут)

**В Supabase Dashboard → SQL Editor выполните:**

```sql
-- Таблица пользователей
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  grade_level INTEGER CHECK (grade_level BETWEEN 8 AND 11),
  target_exam TEXT CHECK (target_exam IN ('OGE', 'EGE')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Справочник тем ФИПИ
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  fipi_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  prerequisites UUID[],
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mastery пользователя
CREATE TABLE user_topic_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id),
  accuracy DECIMAL(5,4) CHECK (accuracy BETWEEN 0 AND 1),
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- Начальные данные
INSERT INTO topics (subject, fipi_code, name, difficulty_level) VALUES
('mathematics', '1.1.1', 'Числа и вычисления', 1),
('mathematics', '1.2.1', 'Алгебраические выражения', 2),
('mathematics', '2.3.1', 'Тригонометрия', 3),
('mathematics', '3.1.1', 'Планиметрия', 3),
('mathematics', '4.2.1', 'Начала анализа', 4);

-- RLS политики
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users view own mastery" ON user_topic_mastery FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own mastery" ON user_topic_mastery FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 4️⃣ ЗАПУСК ЛОКАЛЬНОГО СЕРВЕРА (30 секунд)

```bash
npm run dev
```

**Откройте браузер:** http://localhost:3000

**Проверьте работу:**
1. `/onboarding` — диагностика (15 вопросов)
2. `/dashboard` — чат с AI + Mastery Map
3. `/progress` — прогноз балла ЕГЭ

---

## 5️⃣ ДЕПЛОЙ НА VERCEL (5 минут)

### Вариант A: Через GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stellar.git
git push -u origin main
```

Затем:
1. https://vercel.com/new → Import GitHub repo
2. Add environment variables из `.env.local`
3. Deploy

### Вариант B: Через Vercel CLI
```bash
npm install -g vercel
vercel login
vercel deploy
```

**Готово!** Приложение доступно по адресу:
`https://stellar-YOUR_TEAM.vercel.app`

---

## ✅ ЧЕКЛИСТ ГОТОВНОСТИ

- [ ] `npm install` выполнен без ошибок
- [ ] `.env.local` создан и заполнен
- [ ] Supabase проект создан, таблицы созданы
- [ ] `npm run dev` запускается без ошибок
- [ ] Онбординг работает (вопросы отображаются)
- [ ] Чат с AI отвечает (проверьте OpenRouter ключ)
- [ ] Деплой на Vercel успешен

---

## 🐛 ТИПИЧНЫЕ ОШИБКИ

| Ошибка | Решение |
|--------|---------|
| `Module not found` | `npm install` заново |
| `Invalid API key` | Проверить ключ OpenRouter |
| `relation does not exist` | Выполнить SQL в Supabase |
| CORS error | Запросы только через `/api/*` routes |

---

## 📞 КОНТАКТЫ ДЛЯ ПОДДЕРЖКИ

- Документация: `/README.md`
- Полная инструкция: `/SETUP_INSTRUCTIONS.md`
- Схема БД: `/lib/database-schema.ts`

**Удачи на Артек! 🌟**
