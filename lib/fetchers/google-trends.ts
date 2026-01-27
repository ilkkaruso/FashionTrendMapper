/**
 * Google Trends fetcher using SerpApi with fashion filtering and caching
 *
 * Fetches daily trending searches from SerpApi's Google Trends Trending Now API
 * and filters for fashion-related content. Implements defensive caching with
 * stale fallback for API resilience.
 */

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
 * SerpApi response types
 */
interface SerpApiTrendingSearch {
  query: string;
  search_volume?: number;
  increase_percentage?: number;
  active?: boolean;
  categories?: { id: number; name: string }[];
  trend_breakdown?: string[];
  serpapi_google_trends_link?: string;
}

interface SerpApiResponse {
  search_metadata?: {
    status: string;
  };
  trending_searches?: SerpApiTrendingSearch[];
  error?: string;
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
 * Fetch daily trending searches from SerpApi Google Trends
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

  // Check for API key
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error('SERPAPI_KEY environment variable not set');

    // Try to return cached data
    const cached = await getCached<RawTrend[]>(cacheKey);
    if (cached) {
      return { success: true, data: cached, cached: true };
    }

    const staleCached = await getStaleCached<RawTrend[]>(cacheKey);
    if (staleCached) {
      return { success: true, data: staleCached, cached: true };
    }

    return {
      success: false,
      error: 'SERPAPI_KEY not configured and no cached data available',
    };
  }

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

    // 3. Fetch from SerpApi Google Trends Trending Now
    console.log('Fetching fresh Google Trends data from SerpApi...');

    const params = new URLSearchParams({
      engine: 'google_trends_trending_now',
      geo: 'US',
      hours: '24',
      api_key: apiKey,
    });

    const response = await fetch(`https://serpapi.com/search?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`SerpApi request failed: ${response.status} ${response.statusText}`);
    }

    const data: SerpApiResponse = await response.json();

    if (data.error) {
      throw new Error(`SerpApi error: ${data.error}`);
    }

    const trendingSearches = data.trending_searches || [];

    if (!Array.isArray(trendingSearches) || trendingSearches.length === 0) {
      throw new Error('No trending searches found in SerpApi response');
    }

    // 4. Filter for fashion-related trends
    const fashionTrends = trendingSearches.filter((trend) =>
      isFashionRelated(trend.query || '')
    );

    console.log(
      `Filtered ${fashionTrends.length} fashion trends from ${trendingSearches.length} total trends`
    );

    // 5. Map to RawTrend[]
    const trends: RawTrend[] = fashionTrends.map((trend) => ({
      title: trend.query,
      score: trend.search_volume || 0,
      source: 'google' as const,
      sourceUrl: trend.serpapi_google_trends_link ||
        `https://trends.google.com/trends/explore?q=${encodeURIComponent(trend.query)}`,
      metadata: {
        increasePercentage: trend.increase_percentage,
        active: trend.active,
        categories: trend.categories?.map((c) => c.name) || [],
        relatedQueries: trend.trend_breakdown || [],
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
