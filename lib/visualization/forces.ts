import * as d3 from 'd3';
import type { BubbleNode } from './types';

/**
 * Create D3 force simulation for bubble chart
 *
 * Configures collision, center, and charge forces for Crypto Bubbles-style layout.
 * Larger bubbles naturally drift to center due to collision dynamics.
 *
 * @param nodes - Array of bubble nodes
 * @param width - Container width
 * @param height - Container height
 * @returns Configured D3 force simulation
 */
export function createBubbleSimulation(
  nodes: BubbleNode[],
  width: number,
  height: number
) {
  return d3.forceSimulation(nodes)
    // Many-body charge for repulsion (prevents overlap)
    .force('charge', d3.forceManyBody()
      .strength(d => -Math.pow((d as BubbleNode).radius, 2) * 0.05)
    )
    // Center force pulls to middle (weak, let collisions dominate)
    .force('center', d3.forceCenter(width / 2, height / 2)
      .strength(0.05)
    )
    // Collision force prevents bubble overlap
    .force('collision', d3.forceCollide<BubbleNode>()
      .radius(d => d.radius + 5) // 5px padding
      .strength(0.8)
      .iterations(2)
    )
    // Slower cooling for smoother animation
    .alpha(1)
    .alphaDecay(0.02)
    .velocityDecay(0.4)
    .alphaMin(0.001);
}
