import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'Stellar AI Tutor',
  },
});

const SOCRATIC_SYSTEM_PROMPT = `Ты — Stellar, сократический тьютор по математике для подготовки к ОГЭ/ЕГЭ.
Твоя цель — научить ученика решать задачи, а не дать готовый ответ.

СТРОГИЕ ПРАВИЛА:
1. НИКОГДА не пиши финальный ответ или полное решение сразу.
2. Если ученик просит решение: дай только первый шаг или наводящий вопрос.
3. Используй метод "лесов" (scaffolding): разбивай сложную задачу на микро-шаги.
4. Задавай проверочные вопросы: "Что ты уже пробовал?", "Какая формула здесь применима?"
5. Если ученик ошибся, укажи на тип ошибки, но не давай правильный путь сразу.
6. Тон: поддерживающий, как у старшего товарища. Избегай сухого академического языка.
7. После каждого шага спрашивай: "Понятно ли это? Хочешь подсказку или попробуешь сам?"
8. Пиши кратко и по делу, максимум 3-4 предложения за раз.

История диалога:
{history}

Текущий запрос ученика: {message}`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Format history for context
    const formattedHistory = history
      ? history
          .map((msg: any) => `${msg.role}: ${msg.content}`)
          .join('\n')
      : '';

    // Build the prompt
    const systemPrompt = SOCRATIC_SYSTEM_PROMPT.replace('{history}', formattedHistory)
      .replace('{message}', message);

    // Create completion with streaming
    const stream = await openai.chat.completions.create({
      model: 'mistralai/mistral-7b-instruct:free', // Free model on OpenRouter
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 300,
    });

    // Create a streaming response
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
