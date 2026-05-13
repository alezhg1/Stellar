'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, OnboardingAnswer } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

const questions = [
  {
    id: 1,
    topic: 'algebra',
    question: 'Решите уравнение: 2x² - 8 = 0',
    options: ['x = 2', 'x = ±2', 'x = 4', 'x = ±4'],
    correct: 1,
  },
  {
    id: 2,
    topic: 'geometry',
    question: 'Чему равна площадь круга радиусом R?',
    options: ['πR', '2πR', 'πR²', 'πR²/2'],
    correct: 2,
  },
  {
    id: 3,
    topic: 'trigonometry',
    question: 'Чему равен sin(30°)?',
    options: ['1/2', '√3/2', '√2/2', '1'],
    correct: 0,
  },
  {
    id: 4,
    topic: 'calculus',
    question: 'Найдите производную функции f(x) = x³',
    options: ['3x', '3x²', 'x²', '3x³'],
    correct: 1,
  },
  {
    id: 5,
    topic: 'probability',
    question: 'Какова вероятность выпадения орла при одном броске монеты?',
    options: ['1/4', '1/3', '1/2', '2/3'],
    correct: 2,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswer[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    const question = questions[currentQuestion];
    const isCorrect = optionIndex === question.correct;

    const newAnswer: OnboardingAnswer = {
      questionId: question.id,
      topic: question.topic,
      isCorrect,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      // Complete onboarding
      setIsTransitioning(true);
      setTimeout(() => {
        completeOnboarding(newAnswers);
        router.push('/dashboard');
      }, 500);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        className="glass-card w-full max-w-lg p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gradient">Диагностика</h1>
            <span className="text-sm text-gray-500">
              {currentQuestion + 1} из {questions.length}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="progress-bar-container h-2">
            <motion.div 
              className="progress-bar-fill mastery-medium"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {questions[currentQuestion].question}
              </h2>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className="w-full glass-button glass-button-secondary p-4 text-left hover:border-indigo-300 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-medium">{option}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer hint */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            💡 Отвечай честно — это поможет подобрать оптимальную программу обучения
          </p>
        </div>
      </motion.div>
    </div>
  );
}
