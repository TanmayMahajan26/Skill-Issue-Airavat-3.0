'use client';
import { useState } from 'react';

interface GraphNode {
  id: string;
  label: string;
  value: string;
  confidence: number;
  type: 'input' | 'process' | 'data' | 'compute' | 'result';
}

interface GraphEdge {
  from?: string;
  to?: string;
  source?: string;
  target?: string;
}

interface ReasoningGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const NODE_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  input: { bg: '#1E293B', border: '#3B82F6', text: '#93C5FD', glow: 'rgba(59,130,246,0.3)' },
  process: { bg: '#1E293B', border: '#8B5CF6', text: '#C4B5FD', glow: 'rgba(139,92,246,0.3)' },
  data: { bg: '#1E293B', border: '#94A3B8', text: '#CBD5E1', glow: 'rgba(148,163,184,0.2)' },
  compute: { bg: '#1E293B', border: '#F59E0B', text: '#FCD34D', glow: 'rgba(245,158,11,0.3)' },
  result: { bg: '#064E3B', border: '#10B981', text: '#6EE7B7', glow: 'rgba(16,185,129,0.4)' },
};

export function ReasoningGraph({ nodes, edges }: ReasoningGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Layout nodes in a flowing vertical arrangement
  const nodePositions: Record<string, { x: number; y: number }> = {};
  const COLS = 3;
  const COL_WIDTH = 260;
  const ROW_HEIGHT = 100;
  const PADDING_X = 40;
  const PADDING_Y = 30;

  // Custom layout based on the reasoning flow
  const layout: Record<string, [number, number]> = {
    fir: [0, 0],
    ocr: [1, 0],
    charges: [2, 0],
    bnss: [2, 1],
    sentence: [1, 1],
    offender: [0, 1],
    threshold: [1, 2],
    detention: [2, 2],
    delay: [2, 3],
    multiple: [0, 2],
    result: [1, 3],
  };

  nodes.forEach((node) => {
    const pos = layout[node.id] || [0, 0];
    nodePositions[node.id] = {
      x: PADDING_X + pos[0] * COL_WIDTH,
      y: PADDING_Y + pos[1] * ROW_HEIGHT,
    };
  });

  const svgWidth = PADDING_X * 2 + COLS * COL_WIDTH;
  const svgHeight = PADDING_Y * 2 + 4 * ROW_HEIGHT;
  const NODE_W = 220;
  const NODE_H = 60;

  return (
    <div className="glass-card p-4 overflow-x-auto">
      <h3 className="text-sm font-semibold text-jg-text mb-3 flex items-center gap-2">
        🧠 Legal Reasoning Graph
        <span className="text-[10px] font-normal text-jg-text-secondary bg-jg-surface-hover px-2 py-0.5 rounded-full">
          Differentiator 2 — Explainable AI
        </span>
      </h3>

      <svg
        width={svgWidth}
        height={svgHeight}
        className="mx-auto"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      >
        {/* Edges */}
        {edges.map((edge, idx) => {
          const fromId = edge.from || edge.source || '';
          const toId = edge.to || edge.target || '';
          const from = nodePositions[fromId];
          const to = nodePositions[toId];
          if (!from || !to) return null;

          const x1 = from.x + NODE_W / 2;
          const y1 = from.y + NODE_H;
          const x2 = to.x + NODE_W / 2;
          const y2 = to.y;

          return (
            <g key={idx}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#475569"
                strokeWidth={2}
                strokeDasharray="4 3"
                opacity={0.6}
              />
              {/* Arrow head */}
              <polygon
                points={`${x2},${y2} ${x2 - 5},${y2 - 8} ${x2 + 5},${y2 - 8}`}
                fill="#475569"
                opacity={0.6}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = nodePositions[node.id];
          if (!pos) return null;
          const colors = NODE_COLORS[node.type] || NODE_COLORS.data;
          const isSelected = selectedNode === node.id;
          const confPct = Math.round(node.confidence * 100);

          return (
            <g
              key={node.id}
              onClick={() => setSelectedNode(isSelected ? null : node.id)}
              className="cursor-pointer"
            >
              {/* Glow */}
              {isSelected && (
                <rect
                  x={pos.x - 4}
                  y={pos.y - 4}
                  width={NODE_W + 8}
                  height={NODE_H + 8}
                  rx={14}
                  fill="none"
                  stroke={colors.border}
                  strokeWidth={2}
                  opacity={0.5}
                />
              )}
              {/* Node rect */}
              <rect
                x={pos.x}
                y={pos.y}
                width={NODE_W}
                height={NODE_H}
                rx={10}
                fill={colors.bg}
                stroke={colors.border}
                strokeWidth={isSelected ? 2 : 1}
                opacity={0.9}
              />
              {/* Label */}
              <text
                x={pos.x + 10}
                y={pos.y + 18}
                fill={colors.text}
                fontSize={11}
                fontWeight={600}
                fontFamily="Inter, sans-serif"
              >
                {node.label}
              </text>
              {/* Value */}
              <text
                x={pos.x + 10}
                y={pos.y + 35}
                fill="#CBD5E1"
                fontSize={9}
                fontFamily="Inter, sans-serif"
              >
                {node.value.length > 35 ? node.value.slice(0, 35) + '…' : node.value}
              </text>
              {/* Confidence bar bg */}
              <rect
                x={pos.x + 10}
                y={pos.y + 44}
                width={NODE_W - 50}
                height={4}
                rx={2}
                fill="#334155"
              />
              {/* Confidence bar fill */}
              <rect
                x={pos.x + 10}
                y={pos.y + 44}
                width={((NODE_W - 50) * node.confidence)}
                height={4}
                rx={2}
                fill={colors.border}
              />
              {/* Confidence text */}
              <text
                x={pos.x + NODE_W - 30}
                y={pos.y + 50}
                fill={colors.text}
                fontSize={9}
                fontFamily="Inter, sans-serif"
              >
                {confPct}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selected node detail */}
      {selectedNode && (() => {
        const node = nodes.find((n) => n.id === selectedNode);
        if (!node) return null;
        const colors = NODE_COLORS[node.type] || NODE_COLORS.data;
        return (
          <div
            className="mt-4 p-3 rounded-lg border"
            style={{ borderColor: colors.border, backgroundColor: `${colors.bg}CC` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-bold uppercase px-2 py-0.5 rounded"
                style={{ color: colors.text, backgroundColor: `${colors.border}20` }}
              >
                {node.type}
              </span>
              <span className="text-sm font-semibold" style={{ color: colors.text }}>
                {node.label}
              </span>
            </div>
            <p className="text-xs text-jg-text-secondary">{node.value}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="text-[11px] text-jg-text-secondary">Confidence:</div>
              <div className="flex-1 bg-jg-surface-hover rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${node.confidence * 100}%`, backgroundColor: colors.border }}
                />
              </div>
              <span className="text-xs font-medium" style={{ color: colors.text }}>
                {Math.round(node.confidence * 100)}%
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
