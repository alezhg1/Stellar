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
      
      let bgColor = 'bg-slate-100';
      let borderColor = 'border-slate-300';
      let textColor = 'text-slate-600';
      
      if (mastery >= 0.8) {
        bgColor = 'bg-green-100';
        borderColor = 'border-green-400';
        textColor = 'text-green-700';
      } else if (mastery >= 0.5) {
        bgColor = 'bg-yellow-100';
        borderColor = 'border-yellow-400';
        textColor = 'text-yellow-700';
      } else if (mastery > 0) {
        bgColor = 'bg-orange-100';
        borderColor = 'border-orange-400';
        textColor = 'text-orange-700';
      } else {
        bgColor = 'bg-slate-50';
        borderColor = 'border-slate-200';
        textColor = 'text-slate-400';
      }

      return {
        id: topic.id,
        position: {
          x: (index % 4) * 200 + 50,
          y: Math.floor(index / 4) * 120 + 80,
        },
        data: {
          label: (
            <div className={cn('p-3 rounded-xl border-2', bgColor, borderColor)}>
              <p className={cn('font-medium text-sm', textColor)}>
                {topic.label}
              </p>
              {mastery > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', 
                        mastery >= 0.8 ? 'bg-green-500' :
                        mastery >= 0.5 ? 'bg-yellow-500' : 'bg-orange-500'
                      )}
                      style={{ width: `${mastery * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
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
        style: { stroke: '#cbd5e1', strokeWidth: 2 },
      }));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[500px] w-full bg-white rounded-2xl shadow-lg border border-slate-100"
    >
      <div className="p-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">Карта знаний</h3>
        <p className="text-xs text-slate-500">
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
          <Background color="#e2e8f0" gap={20} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-slate-100 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-400" />
          <span className="text-xs text-slate-600">Усвоено (80%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-400" />
          <span className="text-xs text-slate-600">В процессе (50-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-100 border border-orange-400" />
          <span className="text-xs text-slate-600">Требует внимания (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-50 border border-slate-200" />
          <span className="text-xs text-slate-600">Не начато</span>
        </div>
      </div>
    </motion.div>
  );
}
