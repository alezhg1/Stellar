'use client';

import { useMemo } from 'react';
import ReactFlow, { Node, Edge, Background, Controls, BackgroundVariant } from 'reactflow';
import 'reactflow/dist/style.css';

interface TopicNode {
  id: string;
  label: string;
  mastery: number;
  status: 'locked' | 'active' | 'completed';
}

const initialNodesData: TopicNode[] = [
  { id: '1', label: 'Алгебра', mastery: 85, status: 'completed' },
  { id: '2', label: 'Тригонометрия', mastery: 45, status: 'active' },
  { id: '3', label: 'Геометрия', mastery: 20, status: 'locked' },
  { id: '4', label: 'Функции', mastery: 60, status: 'active' },
];

const initialEdgesData = [
  { source: '1', target: '2' },
  { source: '1', target: '4' },
  { source: '2', target: '3' },
  { source: '4', target: '3' },
];

export default function MasteryMap() {
  const nodes: Node[] = useMemo(() => initialNodesData.map((node, index) => ({
    id: node.id,
    position: { x: (index % 2) * 250 + 50, y: Math.floor(index / 2) * 150 + 80 },
    data: { 
      label: (
        <div className={`p-3 rounded-xl border-2 backdrop-blur-sm ${
          node.status === 'completed' ? 'bg-white/80 border-gray-500' : 
          node.status === 'active' ? 'bg-white/95 border-gray-400' : 'bg-gray-200/50 border-gray-300'
        }`}>
          <p className="font-medium text-sm text-gray-700">{node.label}</p>
          {node.mastery > 0 && (
            <div className="mt-2">
              <div className="h-1.5 bg-white/40 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all"
                  style={{ width: `${node.mastery}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{node.mastery}%</p>
            </div>
          )}
        </div>
      ),
    },
    style: { width: 180 },
  })), []);

  const edges: Edge[] = useMemo(() => initialEdgesData.map((edge, i) => ({
    id: `e${i}`,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#9CA3AF', strokeWidth: 2 },
  })), []);

  return (
    <div className="h-[500px] w-full glass-card rounded-2xl shadow-lg border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-gray-300/50 bg-white/30 backdrop-blur-md">
        <h3 className="font-semibold text-gray-800">Карта знаний</h3>
        <p className="text-xs text-gray-500">Визуализация твоих сильных сторон и зон роста</p>
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
          className="bg-transparent"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#9CA3AF" />
          <Controls showInteractive={false} className="!bg-white/50 !border-none" />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-300/50 bg-white/20 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/80 border-2 border-gray-500" />
          <span className="text-xs text-gray-600">Усвоено (80%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/95 border-2 border-gray-400" />
          <span className="text-xs text-gray-600">В процессе (50-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-200/50 border-2 border-gray-300" />
          <span className="text-xs text-gray-600">Требует внимания (&lt;50%)</span>
        </div>
      </div>
    </div>
  );
}
