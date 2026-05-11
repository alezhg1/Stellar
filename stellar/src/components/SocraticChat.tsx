'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Message } from '@/types';
import { cn } from '@/lib/utils';

interface SocraticChatProps {
  initialMessage?: string;
}

export default function SocraticChat({ initialMessage }: SocraticChatProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage, isChatLoading, setChatLoading } = useAppStore();
  
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

    addMessage(userMessage);
    setInputValue('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          history: messages.slice(-10), // Last 10 messages for context
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      
      const aiMessageId = (Date.now() + 1).toString();
      
      // Add placeholder AI message
      addMessage({
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      });

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        aiContent += chunk;
        
        // Update the last AI message with new content
        // In real app, you'd update specific message by ID
      }

      // Final update (in real app, this would be done incrementally)
      // For now, we'll just add a complete message after streaming
      setChatLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatLoading(false);
      
      // Add error message
      addMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Извини, произошла ошибка. Попробуй еще раз.',
        timestamp: new Date(),
      });
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
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg border border-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-primary-50 to-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Stellar AI</h3>
            <p className="text-xs text-slate-500">Сократический тьютор</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center max-w-sm">
              <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <h4 className="font-medium text-slate-900 mb-2">
                Начни диалог с AI-тьютором
              </h4>
              <p className="text-sm text-slate-500 mb-4">
                Задай вопрос по теме или попроси объяснить ошибку
              </p>
              {initialMessage && (
                <button
                  onClick={handleQuickStart}
                  className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors"
                >
                  Пример: "{initialMessage}"
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 text-slate-900'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3 h-3 text-primary-500" />
                      <span className="text-xs font-medium text-primary-600">
                        Stellar
                      </span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
            
            {isChatLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Задай вопрос или опиши проблему..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            disabled={isChatLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isChatLoading}
            className="px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          AI не дает готовые ответы, а помогает разобраться
        </p>
      </form>
    </div>
  );
}
