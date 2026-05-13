import os
import requests
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def get_socratic_response(history: List[Dict[str, str]], user_input: str, subject: str = "общий") -> str:
    """
    Get a Socratic response from AI using OpenRouter API.
    The AI will never give direct answers, only guiding questions.
    """
    api_key = os.environ.get('OPENROUTER_KEY', '')
    
    # Subject-specific system prompts
    subject_prompts = {
        "mathematics": "математике",
        "physics": "физике", 
        "russian": "русскому языку",
        "informatics": "информатике"
    }
    
    subject_name = subject_prompts.get(subject, "подготовке к экзаменам")
    
    system_prompt = f"""Ты Stellar - персональный AI-репетитор для подготовки к ЕГЭ/ОГЭ по {subject_name}.
Твоя задача: помогать ученикам понимать материал через наводящие вопросы (сократический метод).

ПРАВИЛА:
1. НИКОГДА не давай прямой ответ или готовое решение
2. Задавай ОДИН краткий наводящий вопрос (максимум 2)
3. Будь дружелюбным, поддерживающим и ободряющим
4. Используй метод сократического диалога (scaffolding)
5. Ответ должен быть не длиннее 2-3 предложений
6. Если ученик ошибся - мягко укажи на ошибку вопросом
7. Хвали за правильные рассуждения

Примеры:
Ученик: "Как решить это уравнение?"
Ты: "Какие шаги ты уже пробовал сделать? Что происходит, если перенести все слагаемые в одну сторону?"

Ученик: "Я не понимаю эту тему"
Ты: "Что именно вызывает трудности? Давай начнем с того, что ты уже понимаешь хорошо."

Ученик: "Проверь мое решение"
Ты: "Давай проверим вместе! Какой первый шаг ты сделал и почему выбрал именно его?"
"""

    # Build conversation history for API
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    # Add recent history (last 8 messages to keep context manageable)
    for msg in history[-8:]:
        messages.append({
            "role": msg['role'],
            "content": msg['content']
        })
    
    # Add current user input
    messages.append({"role": "user", "content": user_input})
    
    # If no API key, return a fallback response
    if not api_key or api_key == 'your_openrouter_api_key_here':
        print("⚠️ No valid API key found, using fallback responses")
        return _get_fallback_response(user_input, history, subject)
    
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "Stellar Tutor",
                "OpenRouter-Intent": "education"
            },
            json={
                "model": "meta-llama/llama-3.1-8b-instruct",
                "messages": messages,
                "max_tokens": 200,
                "temperature": 0.75,
                "top_p": 0.9,
                "frequency_penalty": 0.3,
                "presence_penalty": 0.3
            },
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'choices' in data and len(data['choices']) > 0:
                ai_response = data['choices'][0]['message']['content'].strip()
                print(f"✅ AI Response received: {ai_response[:50]}...")
                return ai_response
            else:
                print(f"⚠️ Invalid response format: {data}")
                return _get_fallback_response(user_input, history, subject)
        else:
            print(f"⚠️ API Error {response.status_code}: {response.text[:200]}")
            return _get_fallback_response(user_input, history, subject)
            
    except requests.exceptions.Timeout:
        print("⚠️ API Timeout")
        return "Извини, я немного задумался... Давай продолжим! Какой следующий шаг ты видишь?"
    except Exception as e:
        print(f"⚠️ AI Service error: {e}")
        return _get_fallback_response(user_input, history, subject)


def _get_fallback_response(user_input: str, history: List[Dict[str, str]], subject: str = "общий") -> str:
    """Fallback responses when AI is unavailable"""
    
    # Subject-specific fallbacks
    subject_fallbacks = {
        "mathematics": [
            "Давай разберемся! Какое математическое правило может здесь применяться?",
            "Хороший вопрос! Попробуй представить задачу в более простой форме. Что изменится?",
            "Верное направление! Какую формулу или теорему можно использовать здесь?",
        ],
        "physics": [
            "Интересно! Какой физический закон описывает это явление?",
            "Давай подумаем! Какие величины тебе известны и как они связаны?",
            "Молодец! Вспомни, как мы анализировали похожие ситуации раньше.",
        ],
        "russian": [
            "Отличный вопрос! Какое правило русского языка здесь применимо?",
            "Давай разберем! На какую грамматическую тему это похоже?",
            "Хорошо! Попробуй подобрать аналогичный пример из известной литературы.",
        ],
        "informatics": [
            "Интересная задача! Какой алгоритм или структура данных подойдут здесь?",
            "Давай подумаем! Как бы ты решил эту задачу пошагово?",
            "Верно! Вспомни принципы работы с данными, которые мы изучали.",
        ]
    }
    
    general_fallbacks = [
        "Интересный вопрос! Давай подумаем вместе: какой первый шаг ты бы сделал?",
        "Хорошая мысль! А что будет, если попробовать применить это правило здесь?",
        "Верное направление! Какой закон или формулу можно использовать в этом случае?",
        "Молодец, что задаешь вопросы! Попробуй разбить задачу на более простые части. С чего начнешь?",
        "Отличный вопрос! Вспомни, как мы решали похожие задачи раньше. Что было общим?",
    ]
    
    fallbacks = subject_fallbacks.get(subject, general_fallbacks)
    
    # Simple keyword-based fallback selection
    user_lower = user_input.lower()
    
    if any(word in user_lower for word in ['как', 'способ', 'метод']):
        return "Какие подходы ты уже рассматривал? Какой из них кажется наиболее перспективным?"
    elif any(word in user_lower for word in ['почему', 'зачем']):
        return "Как ты думаешь, какая причина может стоять за этим явлением?"
    elif any(word in user_lower for word in ['что', 'какой']):
        return "Что ты уже знаешь об этой теме? Какие ассоциации она у тебя вызывает?"
    elif any(word in user_lower for word in ['не понимаю', 'трудно', 'сложно']):
        return "Понимаю, что сложно! Давай начнем с самого простого. Что из этого ты точно понимаешь?"
    else:
        return fallbacks[len(history) % len(fallbacks)]
