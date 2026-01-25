/**
 * Score normalization utilities for trend data
 *
 * Normalizes Google Trends traffic strings (e.g., "50K+", "1M+") to a
 * consistent 0-100 scale using min-max normalization.
 */

import type { RawTrend, NormalizedTrend } from '@/lib/fetchers/types';

/**
 * Parse traffic strings to numeric values
 *
 * @param traffic - Traffic string (e.g., "50K+", "1M+") or number
 * @returns Numeric value
 *
 * @example
 * parseTraffic("50K+") // 50000
 * parseTraffic("1M+") // 1000000
 * parseTraffic("500") // 500
 * parseTraffic(1000) // 1000
 */
function parseTraffic(traffic: string | number): number {
  if (typeof traffic === 'number') return traffic;

  const str = traffic.replace('+', '').trim().toUpperCase();

  if (str.endsWith('M')) {
    return parseFloat(str) * 1_000_000;
  }

  if (str.endsWith('K')) {
    return parseFloat(str) * 1_000;
  }

  return parseFloat(str) || 0;
}

/**
 * Apply min-max normalization to scale values to 0-100
 *
 * Formula: ((value - min) / (max - min)) * 100
 *
 * @param values - Array of numeric values
 * @returns Array of normalized values (0-100 scale)
 *
 * @example
 * minMaxNormalize([100, 200, 300]) // [0, 50, 100]
 * minMaxNormalize([50, 50, 50]) // [50, 50, 50] (all equal)
 * minMaxNormalize([]) // []
 */
function minMaxNormalize(values: number[]): number[] {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);

  // If all values are equal, assign middle score (50)
  if (max === min) {
    return values.map(() => 50);
  }

  return values.map(v => ((v - min) / (max - min)) * 100);
}

/**
 * Normalize trend scores to 0-100 scale
 *
 * Converts raw trend data with varying score formats to normalized trends
 * with consistent 0-100 scoring using min-max normalization.
 *
 * @param trends - Array of raw trends from various sources
 * @returns Array of normalized trends with 0-100 scores
 *
 * @example
 * const raw = [
 *   { title: "Trend A", score: 50000, source: "google" },
 *   { title: "Trend B", score: 100000, source: "google" }
 * ];
 * const normalized = normalizeScores(raw);
 * // [
 * //   { title: "Trend A", score: 0, sources: ["google"], sourceBreakdown: [...] },
 * //   { title: "Trend B", score: 100, sources: ["google"], sourceBreakdown: [...] }
 * // ]
 */
export function normalizeScores(trends: RawTrend[]): NormalizedTrend[] {
  if (trends.length === 0) return [];

  // Parse all traffic values to numbers
  const parsedValues = trends.map(trend => parseTraffic(trend.score));

  // Apply min-max normalization
  const normalizedScores = minMaxNormalize(parsedValues);

  // Map to NormalizedTrend format
  return trends.map((trend, index) => {
    const normalizedScore = Math.round(normalizedScores[index] * 100) / 100; // Round to 2 decimals

    return {
      title: trend.title,
      score: normalizedScore,
      sources: [trend.source],
      sourceBreakdown: [
        {
          source: trend.source,
          score: normalizedScore,
          url: trend.sourceUrl,
        }
      ],
    };
  });
}
