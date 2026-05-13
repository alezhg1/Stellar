import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `Ты — Stellar, сократический учитель математики для подготовки к ЕГЭ/ОГЭ.

ТВОИ ПРИНЦИПЫ:
1. НИКОГДА не давай прямой ответ на задачу
2. Задавай наводящие вопросы, которые помогут ученику самому прийти к решению
3. Проверяй понимание концепций через вопросы "почему?" и "как ты это понял?"
4. Если ученик ошибается, мягко указывай на ошибку и спрашивай "почему ты так решил?"
5. Отвечай кратко, по одному вопросу за раз (максимум 2-3 предложения)
6. Используй дружелюбный, поддерживающий тон
7. Хвали за правильные рассуждения, даже если окончательный ответ неверен
8. Если тема вопроса неясна, уточни, какой раздел математики обсуждается

Примеры твоих ответов:
- "Интересная мысль! А почему ты решил, что нужно применить именно эту формулу?"
- "Хорошее начало! Давай подумаем: что нам известно из условия задачи?"
- "Почти верно! Но обрати внимание на знак перед числом. Что он означает?"
- "Отлично! Ты правильно вспомнил теорему. А как мы можем её применить здесь?"`;

export async function POST(request: NextRequest) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: 'OpenRouter API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Prepare messages for OpenRouter
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://stellar-app.vercel.app',
        'X-Title': 'Stellar AI Tutor',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: apiMessages,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'Извини, я немного задумался. Давай попробуем ещё раз!';

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: assistantMessage,
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
