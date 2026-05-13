'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const onboardingComplete = useAppStore((state) => state.onboardingComplete);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleStart = () => {
    if (onboardingComplete) {
      router.push('/dashboard');
    } else {
      router.push('/onboarding');
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        className="text-center max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-glow"
        >
          <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h1 
          className="text-5xl md:text-6xl font-bold mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span className="text-gradient">Stellar</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="text-xl text-gray-600 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Твой персональный AI-учитель для подготовки к ЕГЭ/ОГЭ
        </motion.p>

        <motion.p 
          className="text-gray-500 mb-10 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Сократический метод обучения: я не даю готовые ответы, а помогаю тебе самому найти решение через наводящие вопросы
        </motion.p>

        {/* Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="glass-card p-4">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-800 mb-1">Диагностика</h3>
            <p className="text-xs text-gray-500">Определим слабые темы</p>
          </div>
          <div className="glass-card p-4">
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-semibold text-gray-800 mb-1">AI-чат</h3>
            <p className="text-xs text-gray-500">Учимся через диалог</p>
          </div>
          <div className="glass-card p-4">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-800 mb-1">Прогресс</h3>
            <p className="text-xs text-gray-500">Отслеживаем рост</p>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          onClick={handleStart}
          className="glass-button px-10 py-4 text-lg shadow-glow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {onboardingComplete ? 'Вернуться к обучению' : 'Начать подготовку'}
          <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </motion.button>

        {/* Footer */}
        <motion.p 
          className="text-xs text-gray-400 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          Проект для отбора в Артек 2025
        </motion.p>
      </motion.div>
    </div>
  );
}
