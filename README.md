# Stellar - AI-ассистент для подготовки к ЕГЭ/ОГЭ

MVP проекта Stellar — сократический AI-тьютор для подготовки к экзаменам.

## 🚀 Функционал

1. **Socratic Chat** — чат с AI, который не дает ответы, а задает наводящие вопросы
2. **Mastery Map** — карта тем с индикаторами прогресса (зеленый/красный)
3. **Predictive Progress** — расчет прогноза балла на основе % решенных задач
4. **Onboarding** — выбор предмета и начальная диагностика

## 🛠 Стек

- **Backend**: Django 5 + DRF
- **Database**: SQLite
- **Frontend**: HTML + CSS + Vanilla JS
- **Design**: Dark Glassmorphism (#121212)
- **AI**: OpenRouter API (meta-llama/llama-3-8b-instruct)

## 📦 Установка

```bash
# 1. Создать виртуальное окружение
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows

# 2. Установить зависимости
pip install django djangorestframework django-cors-headers python-dotenv requests

# 3. Настроить .env файл
cp .env.example .env
# Открыть .env и добавить OPENROUTER_KEY (опционально)

# 4. Выполнить миграции
python manage.py migrate

# 5. Создать демо-данные (темы)
python manage.py setup_demo_data

# 6. Запустить сервер
python manage.py runserver
```

## 🌐 Доступ

- Приложение: http://127.0.0.1:8000
- Admin панель: http://127.0.0.1:8000/admin

## 📁 Структура проекта

```
/workspace/
├── config/              # Django проект настройки
│   ├── settings.py      # Настройки проекта
│   └── urls.py          # Корневой URLconf
├── core/                # Основное приложение
│   ├── models.py        # Модели (Topic, UserProgress, ChatMessage)
│   ├── views.py         # Views (страницы + API)
│   ├── serializers.py   # DRF сериализаторы
│   ├── urls.py          # Маршруты
│   └── management/      # Management commands
├── ai_service/          # AI сервис
│   └── service.py       # Логика взаимодействия с OpenRouter
├── templates/core/      # HTML шаблоны
│   ├── landing.html     # Лендинг страница
│   ├── onboarding.html  # Выбор предмета
│   └── dashboard.html   # Дашборд с чатом и картой тем
├── static/css/          # Статические файлы
│   └── style.css        # Dark Glassmorphism стили
├── .env                 # Переменные окружения
└── manage.py            # Django manage script
```

## 🔑 API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/topics/` | Список тем (опционально ?subject=math) |
| POST | `/api/chat/` | Отправить сообщение в чат |
| GET | `/api/chat/history/` | История сообщений |
| GET | `/api/progress/` | Прогресс пользователя и прогноз балла |
| POST | `/api/progress/update/` | Обновить прогресс по теме |

## 🎨 Дизайн

- Фон: `#121212`
- Glass панели: `rgba(255, 255, 255, 0.05)` + `backdrop-blur`
- Границы: `rgba(255, 255, 255, 0.1)`
- Текст: белый
- Успех: зеленый `#22c55e`
- Ошибка: красный `#ef4444`

## ⚙️ Настройка AI

Для работы AI-чата добавьте ключ OpenRouter в `.env`:

```
OPENROUTER_KEY=sk-or-...
```

Без ключа будет работать fallback режим с заготовленными ответами.

## 📝 Коммиты

Стиль коммитов: `feat: add chat endpoint`, `fix: progress calculation`, etc.
