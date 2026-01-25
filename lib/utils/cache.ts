/**
 * Redis-based caching utilities for trend data
 *
 * Requires environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client from environment variables
const redis = Redis.fromEnv();

/**
 * Get cached value by key
 *
 * @param key Cache key
 * @returns Cached value or null if not found/expired
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get<T>(key);
    return value;
  } catch (error) {
    console.error(`Cache get error for key "${key}":`, error);
    return null;
  }
}

/**
 * Set cached value with TTL
 *
 * @param key Cache key
 * @param value Value to cache
 * @param ttlSeconds Time to live in seconds
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));

    // Also set a stale cache with longer TTL (24 hours) as fallback
    const staleKey = `stale:${key}`;
    const staleTtl = 24 * 60 * 60; // 24 hours
    await redis.setex(staleKey, staleTtl, JSON.stringify(value));
  } catch (error) {
    console.error(`Cache set error for key "${key}":`, error);
    // Don't throw - cache failures shouldn't break the app
  }
}

/**
 * Get stale cached value even if primary cache expired
 *
 * Used as fallback when fresh fetch fails
 *
 * @param key Cache key (without "stale:" prefix)
 * @returns Stale cached value or null if not found
 */
export async function getStaleCached<T>(key: string): Promise<T | null> {
  try {
    const staleKey = `stale:${key}`;
    const value = await redis.get<string>(staleKey);

    if (!value) {
      return null;
    }

    // Parse JSON string back to object
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Stale cache get error for key "${key}":`, error);
    return null;
  }
}
