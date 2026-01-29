import * as d3 from 'd3';
import type { BubbleNode } from './types';

/**
 * Create D3 force simulation for bubble chart
 *
 * Configures forces for tight packing with larger bubbles in center:
 * - Strong center attraction pulls everything together
 * - Radial force pushes smaller bubbles outward
 * - Tight collision for compact grouping
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
  const centerX = width / 2;
  const centerY = height / 2;

  // Find max radius for normalization
  const maxRadius = Math.max(...nodes.map(n => n.radius), 1);

  return d3.forceSimulation(nodes)
    // Strong center force pulls all bubbles together
    .force('center', d3.forceCenter(centerX, centerY))

    // X force pulls toward center
    .force('x', d3.forceX(centerX).strength(0.15))

    // Y force pulls toward center
    .force('y', d3.forceY(centerY).strength(0.15))

    // Radial force: larger bubbles stay center, smaller pushed out
    .force('radial', d3.forceRadial<BubbleNode>(
      d => {
        // Larger bubbles (higher radius) get smaller radial distance (stay center)
        // Smaller bubbles get pushed outward
        const normalizedSize = d.radius / maxRadius;
        const maxDist = Math.min(width, height) * 0.35;
        return maxDist * (1 - normalizedSize * 0.8);
      },
      centerX,
      centerY
    ).strength(0.3))

    // Tight collision - minimal padding for compact look
    .force('collision', d3.forceCollide<BubbleNode>()
      .radius(d => d.radius + 2) // 2px padding (was 5)
      .strength(1)
      .iterations(3)
    )

    // Simulation parameters for smooth settling
    .alpha(1)
    .alphaDecay(0.015)
    .velocityDecay(0.3)
    .alphaMin(0.001);
}
