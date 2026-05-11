import { NextRequest, NextResponse } from 'next/server';
import OpenRouter from 'openrouter-ai';

const SYSTEM_PROMPT = `Ты — Socratic AI-репетитор приложения Stellar. Твоя задача — помогать ученикам 8-11 классов понимать материал, а НЕ давать готовые ответы.

ПРИНЦИПЫ РАБОТЫ:
1. НИКОГДА не давай готовое решение задачи
2. Задавай наводящие вопросы (scaffolding)
3. Проверяй понимание после каждого шага
4. Связывай ответ с кодами ФИПИ и кодификатором
5. Если ученик ошибается — найди корневую причину (пробел в более ранней теме)
6. Поддерживай мотивацию, хвали за правильные рассуждения

ФОРМАТ ОТВЕТА:
- Короткие абзацы (2-3 предложения)
- 1-2 наводящих вопроса
- Если возможно, укажи код ФИПИ

СТРУКТУРА ДИАЛОГА:
1. Пойми, что именно спрашивает ученик
2. Определи тему и код ФИПИ
3. Задай вопрос, который направит мысль в нужное русло
4. Если ответ неверный — спроси: "Почему ты так решил?" или "Давай проверим этот шаг"
5. Когда ученик близок к решению — похвали и дай последний намёк

ПРИМЕР:
Ученик: "Как решить 2x + 5 = 13?"
Ты: "Отличный вопрос! Давай разберёмся. Что нужно сделать первым шагом, чтобы изолировать x? Вспомни, что мы делаем с числами, которые мешают переменной."`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Initialize OpenRouter client
    const openrouter = new OpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    // Build conversation context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call OpenRouter API (using free model)
    const completion = await openrouter.chat.completions.create({
      model: 'meta-llama/llama-3-8b-instruct:free',
      messages: messages as any[],
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
    });

    const response = completion.choices[0]?.message?.content || '';

    // Extract FIPi code if mentioned (simple regex)
    const fipiMatch = response.match(/ФИПИ[:\s]*([0-9.]+)/i);
    const fipiCode = fipiMatch ? fipiMatch[1] : null;

    // Save conversation to Supabase (optional, for analytics)
    // const supabase = createClient(...);
    // await supabase.from('chat_logs').insert({...});

    return NextResponse.json({
      response,
      fipiCode,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
