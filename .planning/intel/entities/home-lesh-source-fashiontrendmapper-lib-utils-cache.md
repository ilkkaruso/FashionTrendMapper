---
path: /home/lesh/source/FashionTrendMapper/lib/utils/cache.ts
type: util
updated: 2026-01-25
status: active
---

# cache.ts

## Purpose

Redis-based caching utilities for trend data using Upstash Redis. Implements a stale-while-revalidate pattern with primary cache and 24-hour fallback stale cache.

## Exports

- `getCached<T>(key: string): Promise<T | null>` - Retrieves cached value by key, returns null if not found or on error
- `setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void>` - Sets cached value with TTL, also stores stale copy with 24-hour TTL
- `getStaleCached<T>(key: string): Promise<T | null>` - Retrieves stale cached value as fallback when primary cache expired

## Dependencies

- `@upstash/redis` - Redis client for serverless environments

## Used By

TBD

## Notes

- Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables
- Cache failures are logged but don't throw - designed to be non-blocking
- Stale cache uses `stale:` prefix and 24-hour TTL as fallback mechanism
- Values are JSON stringified before storage in stale cache