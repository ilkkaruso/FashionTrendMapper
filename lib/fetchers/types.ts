/**
 * Shared type definitions for trend data fetching and normalization
 */

/**
 * Supported trend data sources
 */
export type SourceType = 'google';

/**
 * Raw trend data as returned from external sources
 */
export interface RawTrend {
  /** Trend title/query */
  title: string;
  /** Raw score from the source (scale varies by source) */
  score: number;
  /** Data source identifier */
  source: SourceType;
  /** Optional URL to source page */
  sourceUrl?: string;
  /** Optional metadata from the source */
  metadata?: Record<string, unknown>;
}

/**
 * Normalized trend data with consistent 0-100 scoring
 */
export interface NormalizedTrend {
  /** Trend title/query */
  title: string;
  /** Normalized score (0-100) */
  score: number;
  /** All sources for this trend */
  sources: SourceType[];
  /** Score breakdown by source */
  sourceBreakdown: {
    source: SourceType;
    score: number;
    url?: string;
  }[];
}

/**
 * Trend with historical comparison
 */
export interface TrendWithHistory extends NormalizedTrend {
  /** Percentage change from yesterday (-100 to +infinity) */
  changePercent: number;
}

/**
 * Generic fetch result wrapper
 */
export interface FetchResult<T> {
  /** Whether the fetch succeeded */
  success: boolean;
  /** The fetched data (if successful) */
  data?: T;
  /** Error message (if failed) */
  error?: string;
  /** Whether data came from cache */
  cached?: boolean;
}
