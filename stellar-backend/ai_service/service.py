import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "sk-or-placeholder")
API_URL = "https://openrouter.ai/api/v1/chat/completions"

SYSTEM_PROMPT = """
Ты — Stellar, сократический ИИ-учитель для подготовки к ЕГЭ.
Твоя цель: не давать готовые ответы, а направлять ученика вопросами.
Если ученик прав — хвали и усложняй задачу. Если ошибся — дай наводящую подсказку.
Отвечай кратко, дружелюбно, но строго по теме.
Формат ответа: Чистый текст.
"""

def get_ai_response(user_message, history=None):
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "sk-or-placeholder":
        return "Это отличный вопрос! Давай подумаем вместе. Как ты думаешь, какая формула здесь может примениться? (Режим демо: настрой OPENROUTER_API_KEY в .env)"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000", 
    }

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history:
        messages.extend(history[-5:])
    messages.append({"role": "user", "content": user_message})

    payload = {
        "model": "meta-llama/llama-3-8b-instruct:free",
        "messages": messages,
        "max_tokens": 150
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data['choices'][0]['message']['content']
    except Exception as e:
        return f"Ошибка связи с мозговым центром: {str(e)}"
