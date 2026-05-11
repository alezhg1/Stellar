'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const DIAGNOSTIC_QUESTIONS = [
  {
    id: 1,
    topic: 'algebra_basics',
    question: 'Решите уравнение: 2x + 5 = 13',
    options: ['x = 4', 'x = 9', 'x = 3', 'x = 6'],
    correct: 0,
    fipiCode: '1.1.1',
  },
  {
    id: 2,
    topic: 'trigonometry',
    question: 'Чему равен sin(30°)?',
    options: ['1/2', '√3/2', '√2/2', '1'],
    correct: 0,
    fipiCode: '2.3.1',
  },
  {
    id: 3,
    topic: 'geometry',
    question: 'Найдите площадь круга радиусом 5',
    options: ['25π', '10π', '5π', '50π'],
    correct: 0,
    fipiCode: '3.1.2',
  },
  // ... ещё 12 вопросов для полноценной диагностики
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitDiagnostic(newAnswers);
    }
  };

  const submitDiagnostic = async (finalAnswers: number[]) => {
    setIsSubmitting(true);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Redirect to auth if not logged in
      router.push('/auth/signin');
      return;
    }

    // Calculate topic mastery
    const topicResults: Record<string, { correct: number; total: number }> = {};
    
    finalAnswers.forEach((answer, idx) => {
      const q = DIAGNOSTIC_QUESTIONS[idx];
      if (!topicResults[q.topic]) {
        topicResults[q.topic] = { correct: 0, total: 0 };
      }
      topicResults[q.topic].total++;
      if (answer === q.correct) {
        topicResults[q.topic].correct++;
      }
    });

    // Save to Supabase
    const masteryData = Object.entries(topicResults).map(([topic, result]) => ({
      user_id: user.id,
      topic_id: topic, // В реальности здесь будет UUID из таблицы topics
      accuracy: result.correct / result.total,
      attempts: result.total,
    }));

    await supabase.from('user_topic_mastery').upsert(masteryData);

    // Generate personalized plan
    const weakTopics = Object.entries(topicResults)
      .filter(([_, result]) => result.correct / result.total < 0.6)
      .map(([topic]) => topic);

    // Save study plan
    await supabase.from('study_plans').insert({
      user_id: user.id,
      week_start: new Date().toISOString(),
      focus_topics: weakTopics,
      recommended_daily_minutes: 30,
    });

    setIsSubmitting(false);
    router.push('/dashboard');
  };

  const question = DIAGNOSTIC_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / DIAGNOSTIC_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Вопрос {currentQuestion + 1} из {DIAGNOSTIC_QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {question.question}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Код ФИПИ: {question.fipiCode}
          </p>
          
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isSubmitting}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-medium text-gray-900">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {isSubmitting && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            <p className="mt-2 text-gray-600">Анализируем ваши ответы...</p>
          </div>
        )}
      </div>
    </div>
  );
}
