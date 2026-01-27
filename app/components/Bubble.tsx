'use client';

import { useEffect, useRef } from 'react';
import { TextBox } from 'd3plus-text';

interface BubbleProps {
  x: number;
  y: number;
  radius: number;
  title: string;
  score: number;
  changePercent: number;
  onClick?: () => void;
}

export function Bubble({ x, y, radius, title, score, changePercent, onClick }: BubbleProps) {
  const textRef = useRef<SVGGElement>(null);

  // Render wrapped text with d3plus-text
  useEffect(() => {
    if (!textRef.current) return;

    new TextBox()
      .select(textRef.current)
      .data([{
        text: title,
        x: x,
        y: y - radius * 0.3, // Position above score
      }])
      .fontSize(12)
      .fontMin(8)
      .fontMax(16)
      .width(radius * 1.6)
      .height(radius * 0.8) // Upper portion for title
      .textAnchor('middle')
      .verticalAlign('top')
      .fontColor('#ffffff')
      .fontWeight(600)
      .render();
  }, [x, y, radius, title]);

  // Color: green for positive change, red for negative
  const color = changePercent >= 0 ? '#22c55e' : '#ef4444';

  return (
    <g
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      className="bubble"
    >
      {/* Bubble circle */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={color}
        fillOpacity={0.7}
        stroke="#ffffff"
        strokeWidth={2}
        className="transition-colors hover:opacity-90"
      />

      {/* Wrapped title text */}
      <g ref={textRef} />

      {/* Score (bold, center) */}
      <text
        x={x}
        y={y + radius * 0.2}
        textAnchor="middle"
        fontSize={14}
        fontWeight="bold"
        fill="#ffffff"
      >
        {score.toFixed(0)}
      </text>

      {/* Change percentage (below score) */}
      <text
        x={x}
        y={y + radius * 0.4}
        textAnchor="middle"
        fontSize={10}
        fill="#ffffff"
      >
        {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
      </text>
    </g>
  );
}
