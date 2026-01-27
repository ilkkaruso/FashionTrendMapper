'use client';

import { useMemo } from 'react';
import * as d3 from 'd3';
import { useForceSimulation } from '@/lib/hooks/useForceSimulation';
import type { TrendWithHistory } from '@/lib/fetchers/types';
import type { BubbleNode } from '@/lib/visualization/types';
import { Bubble } from './Bubble';

interface BubbleChartProps {
  trends: TrendWithHistory[];
  width: number;
  height: number;
  onBubbleClick?: (trend: TrendWithHistory) => void;
}

export function BubbleChart({ trends, width, height, onBubbleClick }: BubbleChartProps) {
  // Convert trends to bubble nodes with radius scaling
  const nodes = useMemo(() => {
    const radiusScale = d3.scaleSqrt()
      .domain([0, 100])
      .range([20, 80]); // Min 20px, max 80px radius

    return trends.map(trend => ({
      id: trend.title,
      title: trend.title,
      score: trend.score,
      changePercent: trend.changePercent,
      radius: radiusScale(trend.score),
    }));
  }, [trends]);

  // Run force simulation
  const animatedNodes = useForceSimulation(nodes, width, height);

  // Map nodes back to trends for click handler
  const nodeToTrend = useMemo(() => {
    const map = new Map<string, TrendWithHistory>();
    trends.forEach(t => map.set(t.title, t));
    return map;
  }, [trends]);

  return (
    <svg width={width} height={height} className="bg-white">
      {animatedNodes.map(node => (
        <Bubble
          key={node.id}
          x={node.x ?? 0}
          y={node.y ?? 0}
          radius={node.radius}
          title={node.title}
          score={node.score}
          changePercent={node.changePercent}
          onClick={() => {
            const trend = nodeToTrend.get(node.id);
            if (trend && onBubbleClick) {
              onBubbleClick(trend);
            }
          }}
        />
      ))}
    </svg>
  );
}
