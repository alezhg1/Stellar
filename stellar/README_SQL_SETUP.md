# Stellar: Настройка PostgreSQL вместо Supabase

## 📋 Обзор изменений

Проект переведён с Supabase на чистый PostgreSQL. Это даёт:
- Полный контроль над БД
- Отсутствие vendor lock-in
- Возможность хостить где угодно (VPS, облако, локально)
- Экономию на тарифах Supabase

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install pg @types/pg
```

### 2. Настройка переменных окружения

Создайте `.env.local`:

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/stellar
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Создание БД и таблиц

```bash
# Создайте базу данных
createdb stellar

# Или через psql
psql -U postgres
CREATE DATABASE stellar;
\c stellar

# Выполните схему
psql -U postgres -d stellar -f lib/schema.sql
```

### 4. Запуск проекта

```bash
npm run dev
```

## 📊 Схема базы данных

### Основные таблицы:

| Таблица | Описание |
|---------|----------|
| `profiles` | Профили пользователей |
| `topics` | Темы по кодификатору ФИПИ с векторами |
| `user_topic_mastery` | Прогресс освоения тем |
| `diagnostic_questions` | Вопросы для диагностики |
| `diagnostic_responses` | Ответы пользователей |
| `chat_logs` | Логи чатов с AI |
| `study_sessions` | Учебные сессии |
| `study_plans` | Персональные планы |

### Векторный поиск

Для работы семантического поиска требуется расширение `vector`:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Если используете обычный PostgreSQL без pgvector, закомментируйте строки с `embedding` в `lib/schema.sql`.

## 🔧 API Endpoints

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/chat` | POST | Чат с Socratic AI |
| `/api/diagnostic` | POST/GET | Диагностика знаний |

## 📁 Структура файлов

```
stellar/
├── lib/
│   ├── schema.sql          # SQL схема БД
│   └── database-schema.ts  # TypeScript типы (для справки)
├── src/
│   └── lib/
│       └── db.ts           # Клиент для PostgreSQL
├── src/app/api/
│   ├── chat/route.ts       # Chat endpoint
│   └── diagnostic/route.ts # Diagnostic endpoint
└── .env.example            # Шаблон переменных
```

## 🎯 Ключевые функции db.ts

- `createProfile()` — создание пользователя
- `getTopicByFipiCode()` — поиск темы по коду ФИПИ
- `searchSimilarTopics()` — семантический поиск (векторы)
- `saveDiagnosticResponse()` — сохранение ответа
- `updateTopicMastery()` — обновление прогресса
- `calculatePredictedScore()` — прогноз балла ЕГЭ
- `saveChatLog()` — логирование чата

## ⚠️ Важные замечания

1. **Векторный поиск**: Требует расширения `pgvector`. Если недоступно — отключите в схеме.

2. **Безопасность**: В продакшене используйте SSL и ограничьте доступ к БД.

3. **Миграции**: Для управления миграциями рассмотрите `node-pg-migrate` или `dbmate`.

4. **Пул подключений**: `db.ts` использует пул из 10 подключений. Настройте под нагрузку.

## 🔗 Полезные ссылки

- [node-postgres документация](https://node-postgres.com/)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Кодификатор ФИПИ по математике](https://fipi.ru/ege/demoversii-specifikacije-kodifikatory)
