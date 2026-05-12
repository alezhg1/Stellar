'use client';

import { useMemo } from 'react';
import ReactFlow, { Node, Edge, Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { MASTERY_MAP_STRUCTURE } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function MasteryMap() {
  const { topicsMastery } = useAppStore();

  const nodes: Node[] = useMemo(() => {
    return MASTERY_MAP_STRUCTURE.map((topic, index) => {
      const mastery = topicsMastery[topic.id] || 0;
      
      let bgColor = 'glass-dark';
      let borderColor = 'border-gray-400';
      let textColor = 'text-gray-600';
      let progressColor = 'bg-gray-500';
      
      if (mastery >= 0.8) {
        bgColor = 'glass-card';
        borderColor = 'border-gray-500';
        textColor = 'text-gray-700';
        progressColor = 'bg-gradient-to-r from-gray-400 to-gray-500';
      } else if (mastery >= 0.5) {
        bgColor = 'glass-card';
        borderColor = 'border-gray-400';
        textColor = 'text-gray-700';
        progressColor = 'bg-gradient-to-r from-gray-300 to-gray-400';
      } else if (mastery > 0) {
        bgColor = 'glass-dark';
        borderColor = 'border-gray-500';
        textColor = 'text-gray-600';
        progressColor = 'bg-gradient-to-r from-gray-400 to-gray-600';
      }

      return {
        id: topic.id,
        position: {
          x: (index % 4) * 200 + 50,
          y: Math.floor(index / 4) * 120 + 80,
        },
        data: {
          label: (
            <div className={cn('p-3 rounded-xl border-2 backdrop-blur-sm', bgColor, borderColor)}>
              <p className={cn('font-medium text-sm', textColor)}>
                {topic.label}
              </p>
              {mastery > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-white/40 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', progressColor)}
                      style={{ width: `${mastery * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(mastery * 100)}%
                  </p>
                </div>
              )}
            </div>
          ),
        },
        style: { width: 180 },
      };
    });
  }, [topicsMastery]);

  const edges: Edge[] = useMemo(() => {
    return MASTERY_MAP_STRUCTURE
      .filter((topic) => topic.parentId)
      .map((topic) => ({
        id: `${topic.parentId}-${topic.id}`,
        source: topic.parentId!,
        target: topic.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#9ca3af', strokeWidth: 2, strokeDasharray: '5,5' },
      }));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[500px] w-full glass-card rounded-2xl shadow-lg"
    >
      <div className="p-4 border-b border-gray-300/50">
        <h3 className="font-semibold text-gray-800">Карта знаний</h3>
        <p className="text-xs text-gray-500">
          Визуализация твоих сильных сторон и зон роста
        </p>
      </div>
      
      <div className="h-[calc(500px-80px)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          attributionPosition="bottom-right"
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          panOnDrag={true}
        >
          <Background color="#d1d5db" gap={20} />
          <Controls showInteractive={false} className="glass-card border-gray-300/50" />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-300/50 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded glass-card border border-gray-500" />
          <span className="text-xs text-gray-600">Усвоено (80%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded glass-card border border-gray-400" />
          <span className="text-xs text-gray-600">В процессе (50-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded glass-dark border border-gray-500" />
          <span className="text-xs text-gray-600">Требует внимания (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded glass-dark border border-gray-300" />
          <span className="text-xs text-gray-600">Не начато</span>
        </div>
      </div>
    </motion.div>
  );
}
