/**
 * Rate limiting utilities for external API calls
 *
 * Requires environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = Redis.fromEnv();

/**
 * Rate limiter for Google Trends API
 * Limit: 10 requests per 10 seconds (sliding window)
 */
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

/**
 * Check rate limit for a given identifier
 *
 * @param limiter The Ratelimit instance to use
 * @param identifier Unique identifier for rate limiting (e.g., 'google-trends')
 * @returns Rate limit result with success status, remaining requests, and reset time
 * @throws Error if rate limit exceeded
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const result = await limiter.limit(identifier);

  if (!result.success) {
    const resetDate = new Date(result.reset);
    throw new Error(
      `Rate limit exceeded for "${identifier}". Resets at ${resetDate.toISOString()}. Limit: ${result.limit}, Reset: ${result.reset}`
    );
  }

  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}
