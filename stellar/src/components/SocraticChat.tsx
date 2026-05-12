'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import { Message } from '@/types';

interface SocraticChatProps {
  initialMessage?: string;
}

export default function SocraticChat({ initialMessage }: SocraticChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          history: messages.slice(-10),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';

      const aiMessageId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        aiContent += chunk;
        
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: aiContent }
            : msg
        ));
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Извини, произошла ошибка. Проверь API ключ в .env.local и попробуй еще раз.',
        timestamp: new Date(),
      }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickStart = () => {
    if (initialMessage && messages.length === 0) {
      sendMessage(initialMessage);
    }
  };

  return (
    <div className="flex flex-col h-[500px] glass-card rounded-2xl shadow-lg border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-300/50 bg-white/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full glass-dark flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Stellar AI</h3>
            <p className="text-xs text-gray-500">Сократический тьютор</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/20">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="font-medium text-gray-700 mb-2">
                Начни диалог с AI-тьютором
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Задай вопрос по теме или попроси объяснить ошибку
              </p>
              {initialMessage && (
                <button
                  onClick={handleQuickStart}
                  className="px-4 py-2 glass-button text-gray-700 rounded-lg text-sm font-medium hover:bg-white/80 transition-all"
                >
                  Пример: "{initialMessage}"
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gray-800 text-white rounded-br-none'
                      : 'bg-white/60 text-gray-800 border border-white/20 rounded-bl-none shadow-sm'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3 h-3 text-gray-500" />
                      <span className="text-xs font-medium text-gray-600">
                        Stellar
                      </span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/40 p-3 rounded-2xl rounded-bl-none border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-white/30 backdrop-blur-md border-t border-gray-300/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Задай вопрос или опиши проблему..."
            className="flex-1 px-4 py-3 glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm text-gray-800 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          AI не дает готовые ответы, а помогает разобраться
        </p>
      </form>
    </div>
  );
}
