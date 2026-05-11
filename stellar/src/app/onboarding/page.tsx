'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { ONBOARDING_QUESTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const router = useRouter();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  const currentQuestion = ONBOARDING_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_QUESTIONS.length) * 100;

  const handleAnswer = (isCorrect: boolean) => {
    const newAnswers = { ...answers, [currentQuestion.id]: isCorrect };
    setAnswers(newAnswers);

    if (currentStep < ONBOARDING_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      completeOnboarding(newAnswers);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Диагностика знаний
          </h1>
          <p className="text-slate-600">
            Ответь на {ONBOARDING_QUESTIONS.length} вопросов, чтобы мы составили твой персональный план
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-500 mb-2">
            <span>Вопрос {currentStep + 1}</span>
            <span>{ONBOARDING_QUESTIONS.length} всего</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500"
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
            className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100"
          >
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full mb-3">
                Тема: {currentQuestion.topic.replace('_', ' ')}
              </span>
              <h2 className="text-xl font-semibold text-slate-900">
                {currentQuestion.text}
              </h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleAnswer(true)}
                className="w-full p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-colors border-2 border-green-200 hover:border-green-300"
              >
                ✓ Знаю / Верно решил
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="w-full p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-medium transition-colors border-2 border-red-200 hover:border-red-300"
              >
                ✗ Затрудняюсь / Ошибся
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Hint */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Честные ответы помогут нам лучше подобрать задания для тебя
        </p>
      </motion.div>
    </div>
  );
}
