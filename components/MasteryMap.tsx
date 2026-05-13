'use client';

import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';

export default function MasteryMap() {
  const { topicsMastery, addMessage } = useAppStore();

  // Calculate average mastery and predicted score
  const avgMastery = Math.round(
    topicsMastery.reduce((sum, topic) => sum + topic.mastery, 0) / topicsMastery.length
  );
  
  const predictedScore = Math.round(50 + avgMastery * 0.5);
  
  // Find weakest topic
  const weakestTopic = [...topicsMastery].sort((a, b) => a.mastery - b.mastery)[0];

  const getMasteryColor = (mastery: number) => {
    if (mastery < 30) return 'mastery-low';
    if (mastery < 70) return 'mastery-medium';
    return 'mastery-high';
  };

  const getMasteryLabel = (mastery: number) => {
    if (mastery < 30) return 'Нужно повторить';
    if (mastery < 70) return 'Хорошо';
    return 'Отлично';
  };

  const handleTopicClick = (topicName: string) => {
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: `Давай повторим ${topicName}`,
      timestamp: Date.now(),
    };
    addMessage(userMessage);
  };

  return (
    <div className="space-y-6">
      {/* Score Prediction */}
      <motion.div 
        className="glass-card p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-sm font-medium text-gray-500 mb-2">Прогноз баллов ЕГЭ</h3>
        <div className="score-display mb-2">{predictedScore}</div>
        <p className="text-xs text-gray-400 mb-4">из 100 возможных</p>
        
        {weakestTopic && weakestTopic.mastery < 70 && (
          <div className="bg-white/50 rounded-xl p-3">
            <p className="text-xs text-gray-600">
              💡 Чтобы получить 90+, подтяни{' '}
              <span className="font-semibold text-indigo-600">{weakestTopic.name}</span>
            </p>
          </div>
        )}
      </motion.div>

      {/* Topics */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Твои темы</h3>
        
        {topicsMastery.map((topic, index) => (
          <motion.div
            key={topic.id}
            className="glass-card p-4 topic-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => handleTopicClick(topic.name)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-800">{topic.name}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                topic.mastery < 30 ? 'bg-red-100 text-red-700' :
                topic.mastery < 70 ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {getMasteryLabel(topic.mastery)}
              </span>
            </div>
            
            <div className="progress-bar-container">
              <div 
                className={`progress-bar-fill ${getMasteryColor(topic.mastery)}`}
                style={{ width: `${topic.mastery}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Прогресс</span>
              <span className="text-xs font-semibold text-gray-700">{topic.mastery}%</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info */}
      <motion.div 
        className="glass-card p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-gray-600 leading-relaxed">
          💡 <strong>Совет:</strong> Нажми на тему, чтобы начать её изучение в чате. 
          Чем больше задач решаешь, тем выше прогресс!
        </p>
      </motion.div>
    </div>
  );
}
