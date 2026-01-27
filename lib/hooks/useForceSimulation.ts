'use client';

import { useEffect, useState, useRef } from 'react';
import type { Simulation } from 'd3';
import { createBubbleSimulation } from '@/lib/visualization/forces';
import type { BubbleNode } from '@/lib/visualization/types';

export function useForceSimulation(
  nodes: BubbleNode[],
  width: number,
  height: number
) {
  const [animatedNodes, setAnimatedNodes] = useState<BubbleNode[]>(nodes);
  const simulationRef = useRef<Simulation<BubbleNode, undefined> | null>(null);

  useEffect(() => {
    if (nodes.length === 0 || width === 0 || height === 0) return;

    // Create simulation
    const simulation = createBubbleSimulation(nodes, width, height);
    simulationRef.current = simulation;

    // Update React state on each tick
    simulation.on('tick', () => {
      setAnimatedNodes([...simulation.nodes()]);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes.length, width, height]);

  // Update node data when input changes
  useEffect(() => {
    if (simulationRef.current && nodes.length > 0) {
      simulationRef.current.nodes(nodes);
      simulationRef.current.alpha(0.3).restart();
    }
  }, [nodes]);

  return animatedNodes;
}
