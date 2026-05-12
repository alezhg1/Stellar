'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

// Встроенные вопросы для диагностики
const ONBOARDING_QUESTIONS = [
  { id: 1, text: "Найдите корень уравнения: 2x + 5 = 15", topic: "algebra_basics" },
  { id: 2, text: "Вычислите: sin(30°) * cos(60°)", topic: "trigonometry" },
  { id: 3, text: "Решите неравенство: x² - 4 > 0", topic: "inequalities" },
  { id: 4, text: "Найдите производную функции: f(x) = x³ + 2x", topic: "derivatives" },
  { id: 5, text: "Чему равен log₂(8)?", topic: "logarithms" },
  { id: 6, text: "Найдите площадь круга радиусом 5", topic: "geometry_planar" },
  { id: 7, text: "Решите уравнение: 2^x = 16", topic: "algebra_basics" },
  { id: 8, text: "Найдите значение выражения: (a-b)(a+b) при a=5, b=3", topic: "algebra_basics" },
  { id: 9, text: "Какова вероятность выпадения четного числа на кубике?", topic: "probability" },
  { id: 10, text: "Найдите угол между касательной и радиусом в точке касания", topic: "geometry_planar" },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const router = useRouter();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const setUserId = useAppStore((state) => state.setUserId);

  const currentQuestion = ONBOARDING_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_QUESTIONS.length) * 100;

  const handleAnswer = (isCorrect: boolean) => {
    const newAnswers = { ...answers, [currentQuestion.id]: isCorrect };
    setAnswers(newAnswers);

    if (currentStep < ONBOARDING_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Generate a simple user ID for session
      const userId = `user_${Date.now()}`;
      setUserId(userId);
      
      // Complete onboarding
      completeOnboarding(newAnswers);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-200 via-gray-150 to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Диагностика знаний
          </h1>
          <p className="text-gray-600">
            Ответь на {ONBOARDING_QUESTIONS.length} вопросов, чтобы мы составили твой персональный план
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Вопрос {currentStep + 1}</span>
            <span>{ONBOARDING_QUESTIONS.length} всего</span>
          </div>
          <div className="h-2 glass-dark rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-gray-400 to-gray-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="glass-card rounded-2xl shadow-lg p-6"
          >
            <div className="mb-6">
              <span className="inline-block px-3 py-1 glass-dark text-gray-700 text-xs font-medium rounded-full mb-3">
                Тема: {currentQuestion.topic.replace('_', ' ')}
              </span>
              <h2 className="text-xl font-semibold text-gray-800">
                {currentQuestion.text}
              </h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleAnswer(true)}
                className="w-full p-4 glass-button hover:bg-white/80 text-gray-700 rounded-xl font-medium transition-all border-2 border-gray-300 hover:border-gray-400"
              >
                ✓ Знаю / Верно решил
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="w-full p-4 glass-dark hover:bg-gray-400/60 text-gray-700 rounded-xl font-medium transition-all border-2 border-gray-400 hover:border-gray-500"
              >
                ✗ Затрудняюсь / Ошибся
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Hint */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Честные ответы помогут нам лучше подобрать задания для тебя
        </p>
      </motion.div>
    </div>
  );
}
