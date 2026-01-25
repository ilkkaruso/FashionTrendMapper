/**
 * Google Trends fetcher with fashion filtering and caching
 *
 * Fetches daily trending searches from Google Trends API and filters
 * for fashion-related content. Implements defensive caching with stale
 * fallback for API resilience.
 */

import googleTrends from 'google-trends-api';
import type { RawTrend, FetchResult } from '@/lib/fetchers/types';
import { getCached, setCache, getStaleCached } from '@/lib/utils/cache';
import { ratelimit, checkRateLimit } from '@/lib/utils/rate-limiter';

/**
 * Fashion-related keywords for filtering trends
 */
const FASHION_KEYWORDS = [
  'fashion',
  'style',
  'clothing',
  'wear',
  'outfit',
  'brand',
  'sneaker',
  'shoe',
  'dress',
  'jacket',
  'jeans',
  'accessory',
  'streetwear',
  'designer',
  'luxury',
  'vintage',
  'aesthetic',
];

/**
 * Parse formatted traffic string to number
 *
 * Converts Google Trends traffic format to integers:
 * - "50K+" -> 50000
 * - "1M+" -> 1000000
 * - "500+" -> 500
 *
 * @param formatted Traffic string from Google Trends
 * @returns Numeric traffic value
 */
function parseTraffic(formatted: string | undefined): number {
  if (!formatted) return 0;

  const cleaned = formatted.replace(/[+,]/g, '').trim();

  if (cleaned.endsWith('M')) {
    return parseFloat(cleaned) * 1000000;
  } else if (cleaned.endsWith('K')) {
    return parseFloat(cleaned) * 1000;
  }

  return parseInt(cleaned, 10) || 0;
}

/**
 * Check if trend title matches fashion keywords
 *
 * @param title Trend title to check
 * @returns True if title contains any fashion keyword
 */
function isFashionRelated(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return FASHION_KEYWORDS.some((keyword) => lowerTitle.includes(keyword));
}

/**
 * Fetch daily trending searches from Google Trends
 *
 * Implements:
 * - Rate limiting (10 req/10s)
 * - Caching (1 hour fresh, 24 hour stale fallback)
 * - Fashion keyword filtering
 * - Graceful degradation on API failure
 *
 * @returns FetchResult containing RawTrend[] or error
 */
export async function fetchGoogleTrends(): Promise<FetchResult<RawTrend[]>> {
  const cacheKey = 'google-trends-daily';
  const cacheTTL = 60 * 60; // 1 hour in seconds

  try {
    // 1. Check rate limit first
    try {
      await checkRateLimit(ratelimit, 'google-trends');
    } catch (rateLimitError) {
      console.warn('Rate limit exceeded, returning cached data:', rateLimitError);

      // Try to return cached data
      const cached = await getCached<RawTrend[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached, cached: true };
      }

      // No cache available, try stale cache
      const staleCached = await getStaleCached<RawTrend[]>(cacheKey);
      if (staleCached) {
        return { success: true, data: staleCached, cached: true };
      }

      return {
        success: false,
        error: 'Rate limit exceeded and no cached data available',
      };
    }

    // 2. Check cache
    const cached = await getCached<RawTrend[]>(cacheKey);
    if (cached) {
      console.log('Returning cached Google Trends data');
      return { success: true, data: cached, cached: true };
    }

    // 3. Fetch from Google Trends API
    console.log('Fetching fresh Google Trends data...');
    const response = await googleTrends.dailyTrends({ geo: 'US' });

    // Parse JSON response (API returns stringified JSON)
    const parsed = JSON.parse(response);
    const trendingSearches =
      parsed?.default?.trendingSearchesDays?.[0]?.trendingSearches || [];

    if (!Array.isArray(trendingSearches) || trendingSearches.length === 0) {
      throw new Error('No trending searches found in API response');
    }

    // 4. Filter for fashion-related trends
    const fashionTrends = trendingSearches.filter((trend: any) =>
      isFashionRelated(trend.title?.query || '')
    );

    console.log(
      `Filtered ${fashionTrends.length} fashion trends from ${trendingSearches.length} total trends`
    );

    // 5. Map to RawTrend[]
    const trends: RawTrend[] = fashionTrends.map((trend: any) => ({
      title: trend.title.query,
      score: parseTraffic(trend.formattedTraffic),
      source: 'google' as const,
      sourceUrl: `https://trends.google.com/trends/explore?q=${encodeURIComponent(
        trend.title.query
      )}`,
      metadata: {
        relatedQueries: trend.relatedQueries?.map((q: any) => q.query) || [],
        image: trend.image?.imageUrl || null,
      },
    }));

    // 6. Cache the result
    await setCache(cacheKey, trends, cacheTTL);

    // 7. Return success
    return { success: true, data: trends };
  } catch (error) {
    console.error('Google Trends fetch error:', error);

    // Try to return stale cache as fallback
    const staleCached = await getStaleCached<RawTrend[]>(cacheKey);
    if (staleCached) {
      console.warn('Returning stale cache due to fetch error');
      return { success: true, data: staleCached, cached: true };
    }

    // No fallback available
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
