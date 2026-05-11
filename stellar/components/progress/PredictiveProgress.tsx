'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PredictiveProgressProps {
  userId: string;
}

export default function PredictiveProgress({ userId }: PredictiveProgressProps) {
  const [predictedScore, setPredictedScore] = useState<number>(0);
  const [confidence, setConfidence] = useState<number>(0);
  const [weakTopics, setWeakTopics] = useState<Array<{ name: string; impact: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Простая модель прогноза на основе моковых данных
    // В реальности здесь будет ML-модель или регрессия
    const mockData = {
      baseScore: 52, // Базовый балл из текущих результатов
      topicBonuses: [
        { name: 'Тригонометрия', current: 0.30, target: 0.70, impact: 12 },
        { name: 'Начала анализа', current: 0, target: 0.60, impact: 10 },
        { name: 'Функции и графики', current: 0.45, target: 0.75, impact: 8 },
      ],
      trend: 0.85, // Тренд улучшения (0-1)
    };

    // Расчёт прогнозируемого балла
    const maxPotential = mockData.baseScore + mockData.topicBonuses.reduce((sum, t) => sum + t.impact, 0);
    const weightedScore = mockData.baseScore + 
      mockData.topicBonuses.reduce((sum, t) => sum + (t.current * t.impact), 0);
    
    // Прогноз с учётом тренда
    const predicted = Math.round(weightedScore + (maxPotential - weightedScore) * mockData.trend * 0.6);
    const confidenceLevel = Math.min(95, 60 + mockData.topicBonuses.length * 10);

    setPredictedScore(predicted);
    setConfidence(confidenceLevel);
    setWeakTopics(mockData.topicBonuses.filter(t => t.current < t.target * 0.6));
    setLoading(false);
  }, [userId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Отличный результат!';
    if (score >= 60) return 'Хороший уровень';
    if (score >= 40) return 'Есть куда расти';
    return 'Нужно серьёзно заняться';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Прогноз результата ЕГЭ</h2>

      {/* Основной прогноз */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 text-center"
        >
          <p className="text-sm text-gray-600 mb-2">Прогнозируемый балл</p>
          <p className={`text-5xl font-bold ${getScoreColor(predictedScore)}`}>{predictedScore}</p>
          <p className="text-sm text-gray-500 mt-2">из 100</p>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 text-center"
        >
          <p className="text-sm text-gray-600 mb-2">Уверенность прогноза</p>
          <p className="text-5xl font-bold text-purple-600">{confidence}%</p>
          <p className="text-sm text-gray-500 mt-2">на основе текущих данных</p>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 text-center"
        >
          <p className="text-sm text-gray-600 mb-2">Потенциал роста</p>
          <p className="text-5xl font-bold text-green-600">+{100 - predictedScore}</p>
          <p className="text-sm text-gray-500 mt-2">баллов возможно набрать</p>
        </motion.div>
      </div>

      {/* Рекомендации */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Что подтянуть для улучшения результата</h3>
        <div className="space-y-3">
          {weakTopics.map((topic, idx) => (
            <motion.div
              key={topic.name}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-gray-800">{topic.name}</p>
                  <p className="text-sm text-gray-600">
                    Текущий уровень: {Math.round(topic.current * 100)}% → Цель: {Math.round(topic.target * 100)}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Прирост баллов</p>
                <p className="text-xl font-bold text-green-600">+{topic.impact}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* График прогресса (упрощённый) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Динамика подготовки</h3>
        <div className="relative h-32 bg-gray-50 rounded-xl overflow-hidden">
          {/* Сетка */}
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            {[100, 75, 50, 25, 0].map(val => (
              <div key={val} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-8">{val}</span>
                <div className="flex-1 border-t border-dashed border-gray-200" />
              </div>
            ))}
          </div>
          
          {/* Линия прогресса (SVG) */}
          <svg className="absolute inset-0 w-full h-full p-4 pt-8 pb-4" viewBox="0 0 300 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0,80 L 50,75 L 100,65 L 150,55 L 200,45 L 250,40 L 300,35 L 300,100 L 0,100 Z"
              fill="url(#lineGradient)"
            />
            <polyline
              points="0,80 50,75 100,65 150,55 200,45 250,40 300,35"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Точки */}
            <circle cx="0" cy="80" r="4" fill="#3B82F6" />
            <circle cx="50" cy="75" r="4" fill="#3B82F6" />
            <circle cx="100" cy="65" r="4" fill="#3B82F6" />
            <circle cx="150" cy="55" r="4" fill="#3B82F6" />
            <circle cx="200" cy="45" r="4" fill="#3B82F6" />
            <circle cx="250" cy="40" r="4" fill="#3B82F6" />
            <circle cx="300" cy="35" r="4" fill="#3B82F6" />
          </svg>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          График показывает динамику среднего процента освоения тем за последние 6 недель
        </p>
      </div>

      {/* Итоговая рекомендация */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200"
      >
        <p className="text-sm text-gray-700">
          <span className="font-semibold">💡 Совет:</span> Сосредоточьтесь на теме &laquo;{weakTopics[0]?.name}&raquo;. 
          Улучшение результата по этой теме даст максимальный прирост баллов ({weakTopics[0]?.impact}). 
          Начните с практики базовых задач и обратитесь к AI-репетитору за разъяснениями.
        </p>
      </motion.div>
    </div>
  );
}
