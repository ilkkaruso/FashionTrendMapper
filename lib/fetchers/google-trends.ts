/**
 * Google Trends fetcher using SerpApi with fashion filtering and caching
 *
 * Fetches fashion trends using two strategies:
 * 1. Filter trending searches for fashion-related content
 * 2. Fetch related/rising queries for fashion-specific search terms
 */

import type { RawTrend, FetchResult } from '@/lib/fetchers/types';
import { getCached, setCache, getStaleCached } from '@/lib/utils/cache';
import { ratelimit, checkRateLimit } from '@/lib/utils/rate-limiter';

/**
 * Fashion-related keywords for filtering trends
 */
const FASHION_KEYWORDS = [
  // General fashion terms
  'fashion', 'style', 'clothing', 'wear', 'outfit', 'apparel', 'wardrobe',
  'streetwear', 'designer', 'luxury', 'vintage', 'aesthetic', 'trend',
  // Clothing items
  'dress', 'jacket', 'jeans', 'pants', 'shirt', 'blouse', 'skirt', 'shorts',
  'sweater', 'hoodie', 'coat', 'blazer', 'suit', 'top', 'leggings', 'cardigan',
  // Footwear
  'sneaker', 'shoe', 'boot', 'heel', 'sandal', 'loafer', 'trainer',
  // Accessories
  'accessory', 'bag', 'handbag', 'purse', 'watch', 'jewelry', 'sunglasses',
  'hat', 'cap', 'scarf', 'belt', 'wallet',
  // Major fashion brands
  'nike', 'adidas', 'gucci', 'prada', 'louis vuitton', 'chanel', 'dior',
  'balenciaga', 'versace', 'burberry', 'fendi', 'hermès', 'hermes',
  'yeezy', 'supreme', 'off-white', 'zara', 'h&m', 'uniqlo', 'shein',
  'lululemon', 'jordan', 'new balance', 'converse', 'vans',
  'ralph lauren', 'calvin klein', 'tommy hilfiger', 'levis', 'gap',
  'north face', 'patagonia', 'carhartt', 'dickies', 'stussy',
  // Athletic/sportswear
  'athleisure', 'activewear', 'sportswear', 'gym wear', 'yoga',
  // Style descriptors
  'boho', 'minimalist', 'preppy', 'grunge', 'cottagecore', 'y2k',
  'quiet luxury', 'old money', 'clean girl', 'mob wife',
];

/**
 * Fashion search queries to fetch rising/related trends for
 */
const FASHION_QUERIES = [
  'fashion trends 2026',
  'streetwear',
  'sneakers',
  'designer bags',
  'outfit ideas',
];

/**
 * SerpApi response types for Trending Now
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

interface SerpApiTrendingResponse {
  search_metadata?: { status: string };
  trending_searches?: SerpApiTrendingSearch[];
  error?: string;
}

/**
 * SerpApi response types for Related Queries
 */
interface SerpApiRelatedQuery {
  query: string;
  value?: number | string;
  extracted_value?: number;
  link?: string;
  serpapi_link?: string;
}

interface SerpApiRelatedResponse {
  search_metadata?: { status: string };
  related_queries?: {
    rising?: SerpApiRelatedQuery[];
    top?: SerpApiRelatedQuery[];
  };
  interest_over_time?: {
    timeline_data?: { values?: { value: number }[] }[];
  };
  error?: string;
}

/**
 * Check if trend title matches fashion keywords
 */
function isFashionRelated(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return FASHION_KEYWORDS.some((keyword) => lowerTitle.includes(keyword));
}

/**
 * Fetch trending searches and filter for fashion
 */
async function fetchTrendingNow(apiKey: string): Promise<RawTrend[]> {
  const params = new URLSearchParams({
    engine: 'google_trends_trending_now',
    geo: 'US',
    hours: '24',
    api_key: apiKey,
  });

  const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`SerpApi trending request failed: ${response.status}`);
  }

  const data: SerpApiTrendingResponse = await response.json();
  if (data.error) throw new Error(`SerpApi error: ${data.error}`);

  const trendingSearches = data.trending_searches || [];
  const fashionTrends = trendingSearches.filter((trend) =>
    isFashionRelated(trend.query || '')
  );

  console.log(`Trending Now: ${fashionTrends.length} fashion trends from ${trendingSearches.length} total`);

  return fashionTrends.map((trend) => ({
    title: trend.query,
    score: trend.search_volume || 50000,
    source: 'google' as const,
    sourceUrl: `https://trends.google.com/trends/explore?q=${encodeURIComponent(trend.query)}`,
    metadata: {
      increasePercentage: trend.increase_percentage,
      active: trend.active,
      categories: trend.categories?.map((c) => c.name) || [],
      relatedQueries: trend.trend_breakdown || [],
    },
  }));
}

/**
 * Fetch rising/related queries for a fashion search term
 */
async function fetchRelatedQueries(apiKey: string, query: string): Promise<RawTrend[]> {
  const params = new URLSearchParams({
    engine: 'google_trends',
    q: query,
    geo: 'US',
    data_type: 'RELATED_QUERIES',
    api_key: apiKey,
  });

  const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
  if (!response.ok) {
    console.warn(`Related queries request failed for "${query}": ${response.status}`);
    return [];
  }

  const data: SerpApiRelatedResponse = await response.json();
  if (data.error) {
    console.warn(`SerpApi error for "${query}": ${data.error}`);
    return [];
  }

  const rising = data.related_queries?.rising || [];
  const top = data.related_queries?.top || [];

  // Combine rising (prioritized) and top queries
  const allQueries = [...rising, ...top.slice(0, 5)];

  console.log(`Related queries for "${query}": ${rising.length} rising, ${top.length} top`);

  return allQueries.map((item, index) => {
    // Rising queries have "Breakout" or percentage, top have search volume
    let score = 50000;
    if (item.extracted_value) {
      score = item.extracted_value * 1000;
    } else if (typeof item.value === 'number') {
      score = item.value * 1000;
    } else if (item.value === 'Breakout') {
      score = 100000; // High score for breakout trends
    }

    // Decay score based on position to maintain ranking
    score = Math.max(1000, score - index * 5000);

    return {
      title: item.query,
      score,
      source: 'google' as const,
      sourceUrl: item.link || `https://trends.google.com/trends/explore?q=${encodeURIComponent(item.query)}`,
      metadata: {
        relatedTo: query,
        type: rising.includes(item) ? 'rising' : 'top',
      },
    };
  });
}

/**
 * Fetch fashion trends from Google Trends via SerpApi
 *
 * Combines:
 * 1. Trending Now filtered for fashion keywords
 * 2. Rising/related queries for fashion-specific searches
 */
export async function fetchGoogleTrends(): Promise<FetchResult<RawTrend[]>> {
  const cacheKey = 'google-trends-daily';
  const cacheTTL = 60 * 60; // 1 hour

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error('SERPAPI_KEY environment variable not set');
    const cached = await getCached<RawTrend[]>(cacheKey);
    if (cached) return { success: true, data: cached, cached: true };
    const stale = await getStaleCached<RawTrend[]>(cacheKey);
    if (stale) return { success: true, data: stale, cached: true };
    return { success: false, error: 'SERPAPI_KEY not configured' };
  }

  try {
    // Check rate limit
    try {
      await checkRateLimit(ratelimit, 'google-trends');
    } catch {
      console.warn('Rate limit exceeded, checking cache...');
      const cached = await getCached<RawTrend[]>(cacheKey);
      if (cached) return { success: true, data: cached, cached: true };
      const stale = await getStaleCached<RawTrend[]>(cacheKey);
      if (stale) return { success: true, data: stale, cached: true };
      return { success: false, error: 'Rate limit exceeded and no cached data available' };
    }

    // Check cache
    const cached = await getCached<RawTrend[]>(cacheKey);
    if (cached) {
      console.log('Returning cached Google Trends data');
      return { success: true, data: cached, cached: true };
    }

    console.log('Fetching fresh Google Trends data...');

    // Fetch from multiple sources in parallel
    const [trendingTrends, ...relatedResults] = await Promise.all([
      fetchTrendingNow(apiKey).catch((err) => {
        console.warn('Trending Now fetch failed:', err.message);
        return [] as RawTrend[];
      }),
      ...FASHION_QUERIES.map((query) =>
        fetchRelatedQueries(apiKey, query).catch((err) => {
          console.warn(`Related queries fetch failed for "${query}":`, err.message);
          return [] as RawTrend[];
        })
      ),
    ]);

    // Combine all trends
    const allTrends = [
      ...trendingTrends,
      ...relatedResults.flat(),
    ];

    // Deduplicate by title (case-insensitive), keeping highest score
    const trendMap = new Map<string, RawTrend>();
    for (const trend of allTrends) {
      const key = trend.title.toLowerCase();
      const existing = trendMap.get(key);
      if (!existing || trend.score > existing.score) {
        trendMap.set(key, trend);
      }
    }

    const trends = Array.from(trendMap.values());
    console.log(`Total unique fashion trends: ${trends.length}`);

    if (trends.length === 0) {
      throw new Error('No fashion trends found from any source');
    }

    // Cache the result
    await setCache(cacheKey, trends, cacheTTL);

    return { success: true, data: trends };
  } catch (error) {
    console.error('Google Trends fetch error:', error);
    const stale = await getStaleCached<RawTrend[]>(cacheKey);
    if (stale) {
      console.warn('Returning stale cache due to error');
      return { success: true, data: stale, cached: true };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
