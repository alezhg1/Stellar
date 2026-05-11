import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db, queries, initDatabase } from '@/lib/init-db';

// Инициализируем БД при первом запросе (если еще не создана)
initDatabase();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Системный промпт для Сократического метода
const SOCRATIC_SYSTEM_PROMPT = `Ты — AI-репетитор Stellar. Твоя задача — НЕ давать готовые ответы, а учить мыслить.
ПРАВИЛА:
1. Никогда не решай задачу полностью за ученика.
2. Задавай наводящие вопросы (scaffolding).
3. Если ученик ошибся — объясни, в чём ошибка, и дай подсказку.
4. Хвали за правильные шаги.
5. Используй аналогии из жизни.
6. Ссылайся на кодификатор ФИПИ, если тема известна.

Контекст темы: {topic_name} ({fipi_code})
Уровень освоения учеником: {accuracy}%

Начни диалог с вопроса: "Что ты уже знаешь по этой теме?" или "Давай разберёмся вместе. С чего начнём?"`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, topicId, sessionId } = body;

    if (!message || !userId) {
      return NextResponse.json({ error: 'message и userId обязательны' }, { status: 400 });
    }

    // Получаем тему
    let topic = null;
    if (topicId) {
      topic = queries.getTopicById.get(topicId) as any;
    }

    // Создаём новую сессию, если нет ID
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = uuidv4();
      queries.createSession.run(currentSessionId, userId, topicId || null);
    }

    // Сохраняем сообщение пользователя
    queries.saveMessage.run(uuidv4(), currentSessionId, 'user', message);

    // Получаем историю диалога (последние 10 сообщений для контекста)
    const messages = queries.getSessionMessages.all(currentSessionId) as any[];
    const recentMessages = messages.slice(-10);

    // Формируем промпт
    const systemPrompt = SOCRATIC_SYSTEM_PROMPT
      .replace('{topic_name}', topic?.name || 'общая подготовка')
      .replace('{fipi_code}', topic?.fipi_code || 'N/A')
      .replace('{accuracy}', topic ? 'unknown' : 'new');

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map(m => ({ role: m.role, content: m.content })),
    ];

    // Вызов OpenRouter API
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://stellar-edu.vercel.app',
        'X-Title': 'Stellar AI Tutor'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-8b-instruct:free', // Бесплатная модель
        messages: apiMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', errorText);
      
      // Fallback ответ при ошибке API
      const fallbackResponse = "Извини, сейчас я немного устал. Давай попробуем так: какая часть задачи вызывает затруднение?";
      
      queries.saveMessage.run(uuidv4(), currentSessionId, 'assistant', fallbackResponse);
      
      return NextResponse.json({
        response: fallbackResponse,
        sessionId: currentSessionId,
        isFallback: true
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Не удалось получить ответ.';

    // Сохраняем ответ AI
    queries.saveMessage.run(uuidv4(), currentSessionId, 'assistant', aiResponse);

    return NextResponse.json({
      response: aiResponse,
      sessionId: currentSessionId,
      topic: topic ? { id: topic.id, name: topic.name, fipi_code: topic.fipi_code } : null
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
