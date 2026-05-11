'use client';

import { useMemo } from 'react';

interface TopicNode {
  id: string;
  label: string;
  mastery: number; // 0-100%
  fipiCode: string;
  prerequisites?: string[];
  x: number;
  y: number;
}

interface MasteryMapProps {
  topics: TopicNode[];
  onTopicClick?: (topicId: string) => void;
}

export default function MasteryMap({ topics, onTopicClick }: MasteryMapProps) {
  // Calculate color based on mastery
  const getNodeColor = (mastery: number) => {
    if (mastery >= 80) return '#22c55e'; // green
    if (mastery >= 60) return '#eab308'; // yellow
    if (mastery >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  // Generate SVG paths for connections
  const connections = useMemo(() => {
    const paths: JSX.Element[] = [];
    
    topics.forEach((topic, idx) => {
      topic.prerequisites?.forEach((prereqId) => {
        const prereq = topics.find(t => t.id === prereqId);
        if (prereq) {
          const pathKey = `${prereq.id}-${topic.id}`;
          paths.push(
            <line
              key={pathKey}
              x1={prereq.x}
              y1={prereq.y}
              x2={topic.x}
              y2={topic.y}
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          );
        }
      });
    });

    return paths;
  }, [topics]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Карта знаний (Mastery Map)
      </h3>
      
      <div className="relative w-full h-[500px] bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 800 500">
          {/* Connection lines */}
          {connections}

          {/* Topic nodes */}
          {topics.map((topic) => (
            <g
              key={topic.id}
              onClick={() => onTopicClick?.(topic.id)}
              className="cursor-pointer transition-transform hover:scale-110"
            >
              {/* Node circle */}
              <circle
                cx={topic.x}
                cy={topic.y}
                r="40"
                fill={getNodeColor(topic.mastery)}
                opacity="0.9"
                stroke="#fff"
                strokeWidth="3"
              />

              {/* Mastery percentage ring */}
              <circle
                cx={topic.x}
                cy={topic.y}
                r="35"
                fill="none"
                stroke="#fff"
                strokeWidth="4"
                strokeDasharray={`${(topic.mastery / 100) * 220} 220`}
                transform={`rotate(-90 ${topic.x} ${topic.y})`}
                strokeLinecap="round"
              />

              {/* Label */}
              <text
                x={topic.x}
                y={topic.y + 5}
                textAnchor="middle"
                fill="#fff"
                fontSize="12"
                fontWeight="bold"
              >
                {topic.label}
              </text>

              {/* FIPi code */}
              <text
                x={topic.x}
                y={topic.y + 55}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
              >
                {topic.fipiCode}
              </text>

              {/* Mastery percentage */}
              <text
                x={topic.x}
                y={topic.y - 45}
                textAnchor="middle"
                fill="#1e293b"
                fontSize="11"
                fontWeight="600"
              >
                {topic.mastery}%
              </text>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Уровень освоения</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-600">80%+ Отлично</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs text-gray-600">60-79% Хорошо</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-xs text-gray-600">40-59% Нужно повторить</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-600">&lt;40% Критично</span>
            </div>
          </div>
        </div>
      </div>

      {/* Topic details panel */}
      <div className="mt-4 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-800">
          💡 <strong>Совет:</strong> Нажмите на тему, чтобы увидеть детальный план изучения и связанные концепции.
          Красные узлы — это пробелы, которые могут влиять на понимание более сложных тем.
        </p>
      </div>
    </div>
  );
}

// Example usage with sample data
export function MasteryMapDemo() {
  const sampleTopics: TopicNode[] = [
    { id: 'algebra_basics', label: 'Алгебра', mastery: 75, fipiCode: '1.1', x: 200, y: 250 },
    { id: 'trigonometry', label: 'Тригонометрия', mastery: 45, fipiCode: '2.3', x: 400, y: 150, prerequisites: ['algebra_basics'] },
    { id: 'geometry', label: 'Геометрия', mastery: 60, fipiCode: '3.1', x: 400, y: 350, prerequisites: ['algebra_basics'] },
    { id: 'calculus', label: 'Начала анализа', mastery: 30, fipiCode: '4.2', x: 600, y: 250, prerequisites: ['trigonometry', 'algebra_basics'] },
  ];

  return <MasteryMap topics={sampleTopics} />;
}
