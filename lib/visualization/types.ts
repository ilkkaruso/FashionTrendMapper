import type { SimulationNodeDatum } from 'd3';

/**
 * Node data for bubble visualization
 * Extends D3's SimulationNodeDatum with fashion trend properties
 */
export interface BubbleNode extends SimulationNodeDatum {
  /** Unique identifier (trend title) */
  id: string;
  /** Trend title to display */
  title: string;
  /** Normalized popularity score (0-100) */
  score: number;
  /** Daily change percentage */
  changePercent: number;
  /** Bubble radius (calculated from score) */
  radius: number;
}
