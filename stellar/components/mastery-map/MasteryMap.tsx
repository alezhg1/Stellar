'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Topic {
  id: string;
  fipi_code: string;
  name: string;
  subject: string;
  difficulty_level: number;
  accuracy?: number | null;
  attempts?: number;
}

interface MasteryMapProps {
  userId: string;
}

export default function MasteryMap({ userId }: MasteryMapProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  useEffect(() => {
    // В реальной версии здесь будет fetch('/api/topics')
    // Для демо используем моковые данные
    const mockTopics: Topic[] = [
      { id: 't1', fipi_code: '1.1.1', name: 'Числа и вычисления', subject: 'mathematics', difficulty_level: 1, accuracy: 0.85, attempts: 12 },
      { id: 't2', fipi_code: '1.2.1', name: 'Алгебраические выражения', subject: 'mathematics', difficulty_level: 2, accuracy: 0.65, attempts: 8 },
      { id: 't3', fipi_code: '1.3.1', name: 'Линейные уравнения', subject: 'mathematics', difficulty_level: 2, accuracy: 0.90, attempts: 15 },
      { id: 't4', fipi_code: '2.1.1', name: 'Функции и графики', subject: 'mathematics', difficulty_level: 3, accuracy: 0.45, attempts: 5 },
      { id: 't5', fipi_code: '2.3.1', name: 'Тригонометрия', subject: 'mathematics', difficulty_level: 3, accuracy: 0.30, attempts: 3 },
      { id: 't6', fipi_code: '3.1.1', name: 'Планиметрия', subject: 'mathematics', difficulty_level: 3, accuracy: 0.60, attempts: 7 },
      { id: 't7', fipi_code: '3.2.1', name: 'Стереометрия', subject: 'mathematics', difficulty_level: 4, accuracy: null, attempts: 0 },
      { id: 't8', fipi_code: '4.1.1', name: 'Теория вероятностей', subject: 'mathematics', difficulty_level: 2, accuracy: 0.75, attempts: 10 },
      { id: 't9', fipi_code: '4.2.1', name: 'Начала анализа', subject: 'mathematics', difficulty_level: 4, accuracy: null, attempts: 0 },
      { id: 't10', fipi_code: '5.1.1', name: 'Текстовые задачи', subject: 'mathematics', difficulty_level: 3, accuracy: 0.55, attempts: 6 },
    ];
    setTopics(mockTopics);
    setLoading(false);
  }, [userId]);

  const getAccuracyColor = (accuracy: number | null) => {
    if (accuracy === null) return 'bg-gray-200 border-gray-300 text-gray-500';
    if (accuracy >= 0.8) return 'bg-green-100 border-green-300 text-green-800';
    if (accuracy >= 0.6) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    if (accuracy >= 0.4) return 'bg-orange-100 border-orange-300 text-orange-800';
    return 'bg-red-100 border-red-300 text-red-800';
  };

  const getAccuracyLabel = (accuracy: number | null) => {
    if (accuracy === null) return 'Не изучено';
    if (accuracy >= 0.8) return 'Отлично';
    if (accuracy >= 0.6) return 'Хорошо';
    if (accuracy >= 0.4) return 'Нужно повторить';
    return 'Критично';
  };

  const groupedByLevel = topics.reduce((acc, topic) => {
    const level = topic.difficulty_level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(topic);
    return acc;
  }, {} as Record<number, Topic[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка карты знаний...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Карта освоения тем</h2>
        <p className="text-gray-600 text-sm">
          Визуализация вашего прогресса по темам ФИПИ. Цвет показывает уровень освоения.
        </p>
      </div>

      {/* Легенда */}
      <div className="flex flex-wrap gap-3 mb-6 text-xs">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-100 border border-green-300" /><span>Отлично (≥80%)</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300" /><span>Хорошо (60-79%)</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-100 border border-orange-300" /><span>Повторить (40-59%)</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-100 border border-red-300" /><span>Критично (&lt;40%)</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-200 border border-gray-300" /><span>Не изучено</span></div>
      </div>

      {/* Уровни сложности */}
      <div className="space-y-6">
        {Object.entries(groupedByLevel).sort(([a], [b]) => Number(a) - Number(b)).map(([level, levelTopics]) => (
          <div key={level}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">Уровень {level}</span>
              <span className="text-gray-500 font-normal">{levelTopics.length} тем</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {levelTopics.map((topic) => (
                <motion.button
                  key={topic.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${getAccuracyColor(topic.accuracy)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono opacity-75">{topic.fipi_code}</span>
                    {topic.attempts !== undefined && topic.attempts > 0 && (
                      <span className="text-xs opacity-75">{topic.attempts} попыток</span>
                    )}
                  </div>
                  <p className="font-semibold text-sm mb-2">{topic.name}</p>
                  {topic.accuracy !== null && topic.accuracy !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{getAccuracyLabel(topic.accuracy)}</span>
                      <span className="text-xs font-bold">{Math.round(topic.accuracy * 100)}%</span>
                    </div>
                  )}
                  {topic.accuracy === null && (
                    <span className="text-xs italic">Не приступал</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно с деталями темы */}
      {selectedTopic && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTopic(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-gray-500 font-mono">{selectedTopic.fipi_code}</p>
                <h3 className="text-xl font-bold text-gray-800">{selectedTopic.name}</h3>
              </div>
              <button onClick={() => setSelectedTopic(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Уровень освоения</p>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getAccuracyColor(selectedTopic.accuracy)}`}>
                    {getAccuracyLabel(selectedTopic.accuracy)}
                  </div>
                  {selectedTopic.accuracy !== null && selectedTopic.accuracy !== undefined && (
                    <span className="text-lg font-bold text-gray-800">{Math.round(selectedTopic.accuracy * 100)}%</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Попыток решено</p>
                <p className="text-lg font-semibold text-gray-800">{selectedTopic.attempts || 0}</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  🚀 Начать практику
                </button>
                <button className="w-full py-3 mt-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                  💬 Спросить AI-репетитора
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
