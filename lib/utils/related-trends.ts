import type { TrendWithHistory } from '@/lib/fetchers/types';

/**
 * Find related trends via text similarity
 *
 * Uses simple word overlap to find trends with similar titles.
 * Per research: start with simple similarity, enhance later.
 *
 * @param targetTrend - The trend to find relatives for
 * @param allTrends - All available trends
 * @param limit - Max number of related trends to return
 * @returns Array of related trends sorted by similarity
 */
export function findRelatedTrends(
  targetTrend: TrendWithHistory,
  allTrends: TrendWithHistory[],
  limit: number = 3
): TrendWithHistory[] {
  // Tokenize title to words
  const tokenize = (text: string): Set<string> => {
    const words = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2); // Ignore short words
    return new Set(words);
  };

  const targetWords = tokenize(targetTrend.title);

  // Calculate similarity scores
  const scored = allTrends
    .filter(t => t.title !== targetTrend.title) // Exclude self
    .map(trend => {
      const trendWords = tokenize(trend.title);

      // Count shared words
      let sharedCount = 0;
      for (const word of targetWords) {
        if (trendWords.has(word)) {
          sharedCount++;
        }
      }

      // Jaccard similarity: intersection / union
      const union = new Set([...targetWords, ...trendWords]);
      const similarity = sharedCount / union.size;

      return { trend, similarity };
    })
    .filter(item => item.similarity > 0) // Must have at least 1 shared word
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return scored.map(item => item.trend);
}
