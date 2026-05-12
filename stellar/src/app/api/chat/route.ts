import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SOCRATIC_SYSTEM_PROMPT = `Ты — Stellar, сократический тьютор по математике для подготовки к ОГЭ/ЕГЭ.
Твоя цель — научить ученика решать задачи, а не дать готовый ответ.

СТРОГИЕ ПРАВИЛА (Socratic Orchestrator):
1. НИКОГДА не пиши финальный ответ или полное решение сразу.
2. Если ученик просит решение: дай только первый шаг или наводящий вопрос.
3. Используй метод "лесов" (scaffolding): разбивай сложную задачу на микро-шаги.
4. Задавай проверочные вопросы: "Что ты уже пробовал?", "Какая формула здесь применима?"
5. Если ученик ошибся, укажи на тип ошибки, но не давай правильный путь сразу.
6. Опирайся на кодификатор ФИПИ. Если тема известна, привяжи ответ к коду темы.
7. Тон: поддерживающий, как у старшего товарища. Избегай сухого академического языка.
8. После каждого шага спрашивай: "Понятно ли это? Хочешь подсказку или попробуешь сам?"
9. Пиши кратко и по делу, максимум 3-4 предложения за раз.
10. Язык ответа: Русский.

LangGraph-style оркестрация:
- Step 1 (Analyze): Определи тему задачи по кодификатору ФИПИ
- Step 2 (Assess): Оцени уровень понимания ученика по его вопросу
- Step 3 (Scaffold): Выбери стратегию подсказки (наводящий вопрос / микро-шаг / проверка понятия)
- Step 4 (Respond): Дай ответ строго по выбранной стратегии
- Step 5 (Check): Спроси, нужно ли ещё помочь

Контекст из базы знаний ФИПИ: {context}
Код темы (если определён): {fipiCode}
История диалога: {history}

Текущий запрос ученика: {message}`;

async function detectTopicFromMessage(message: string): Promise<string | null> {
  const topicKeywords: Record<string, string[]> = {
    '1.4.1': ['тригонометри', 'sin', 'cos', 'tg', 'ctg', 'угол', 'градус'],
    '1.2.1': ['уравнени', 'корень', 'x =', 'решите уравнение'],
    '1.2.2': ['неравенств', 'больше', 'меньше', '≥', '≤', 'промежуток'],
    '1.3.2': ['логарифм', 'log', 'основани', 'потенцирова'],
    '2.3.1': ['производн', 'дифференцирова', "f'(x)", 'касательн'],
    '2.1.1': ['треугольн', 'окружност', 'площад', 'радиус', 'планиметр'],
    '2.2.1': ['вероятност', 'комбинатор', 'скольк способов'],
  };
  
  const lowerMessage = message.toLowerCase();
  
  for (const [fipiCode, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      return fipiCode;
    }
  }
  
  return null;
}

export async function POST(req: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'API ключ OpenRouter не настроен. Проверьте .env.local' },
        { status: 500 }
      );
    }

    const { message, history, userId } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const fipiCode = await detectTopicFromMessage(message);
    
    let context = '';
    if (fipiCode) {
      const topic = await db.getTopicByFipiCode(fipiCode);
      if (topic) {
        context = `Тема: ${topic.name}. ${topic.description || ''}`;
      }
    }

    const formattedHistory = history
      ? history.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')
      : '';

    const systemPrompt = SOCRATIC_SYSTEM_PROMPT
      .replace('{context}', context || 'Нет дополнительного контекста')
      .replace('{fipiCode}', fipiCode || 'Не определён')
      .replace('{history}', formattedHistory || 'Диалог начинается')
      .replace('{message}', message);

    const stream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Stellar AI Tutor - Socratic Orchestrator',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!stream.ok) {
      const errText = await stream.text();
      console.error('OpenRouter Error:', errText);
      throw new Error(`API Error: ${stream.status}`);
    }

    const customStream = new ReadableStream({
      async start(controller) {
        try {
          const reader = stream.body?.getReader();
          const decoder = new TextDecoder();
          
          if (!reader) {
            controller.close();
            return;
          }

          let fullResponse = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.slice(6));
                  const content = data.choices?.[0]?.delta?.content || '';
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(new TextEncoder().encode(content));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
          
          if (userId && fullResponse) {
            db.saveChatLog({
              user_id: userId,
              message,
              response: fullResponse,
              fipi_code_reference: fipiCode || null,
            }).catch(console.error);
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
      { error: (error as Error).message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
