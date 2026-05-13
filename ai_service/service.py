import os
import requests
from typing import List, Dict


def get_socratic_response(history: List[Dict[str, str]], user_input: str) -> str:
    """
    Get a Socratic response from AI.
    The AI will never give direct answers, only guiding questions.
    """
    api_key = os.environ.get('OPENROUTER_KEY', '')
    
    system_prompt = """Ты Stellar - AI-учитель для подготовки к ЕГЭ/ОГЭ.
Твоя задача: помогать ученикам понимать материал через наводящие вопросы.

ПРАВИЛА:
1. НИКОГДА не давай прямой ответ на вопрос
2. Задавай ОДИН краткий наводящий вопрос
3. Будь дружелюбным и поддерживающим
4. Используй метод сократического диалога
5. Ответ должен быть не длиннее 2-3 предложений

Пример:
Ученик: "Как решить это уравнение?"
Ты: "Какие шаги ты уже пробовал сделать? Что происходит, если перенести все слагаемые в одну сторону?"
"""

    # Build conversation history for API
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    # Add recent history (last 6 messages to keep context manageable)
    for msg in history[-6:]:
        messages.append({
            "role": msg['role'],
            "content": msg['content']
        })
    
    # Add current user input
    messages.append({"role": "user", "content": user_input})
    
    # If no API key, return a fallback response
    if not api_key:
        return _get_fallback_response(user_input, history)
    
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "Stellar Tutor"
            },
            json={
                "model": "meta-llama/llama-3-8b-instruct",
                "messages": messages,
                "max_tokens": 150,
                "temperature": 0.7
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            return data['choices'][0]['message']['content'].strip()
        else:
            return _get_fallback_response(user_input, history)
            
    except Exception as e:
        print(f"AI Service error: {e}")
        return _get_fallback_response(user_input, history)


def _get_fallback_response(user_input: str, history: List[Dict[str, str]]) -> str:
    """Fallback responses when AI is unavailable"""
    fallbacks = [
        "Интересный вопрос! Давай подумаем вместе: какой первый шаг ты бы сделал?",
        "Хорошая мысль! А что будет, если попробовать применить это правило здесь?",
        "Верное направление! Какой закон или формулу можно использовать в этом случае?",
        "Молодец, что задаешь вопросы! Попробуй разбить задачу на более простые части. С чего начнешь?",
        "Отличный вопрос! Вспомни, как мы решали похожие задачи раньше. Что было общим?",
    ]
    
    # Simple keyword-based fallback selection
    user_lower = user_input.lower()
    
    if any(word in user_lower for word in ['как', 'способ', 'метод']):
        return "Какие подходы ты уже рассматривал? Какой из них кажется наиболее перспективным?"
    elif any(word in user_lower for word in ['почему', 'зачем']):
        return "Как ты думаешь, какая причина может стоять за этим явлением?"
    elif any(word in user_lower for word in ['что', 'какой']):
        return "Что ты уже знаешь об этой теме? Какие ассоциации она у тебя вызывает?"
    else:
        return fallbacks[len(history) % len(fallbacks)]
