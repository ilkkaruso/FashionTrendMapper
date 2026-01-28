---
path: /home/lesh/source/FashionTrendMapper/lib/utils/rate-limiter.ts
type: util
updated: 2026-01-25
status: active
---

# rate-limiter.ts

## Purpose

Provides rate limiting utilities for external API calls using Upstash Redis. Implements a sliding window rate limiter to prevent exceeding API quotas, particularly for Google Trends API requests.

## Exports

- `ratelimit` - Pre-configured Ratelimit instance with 10 requests per 10 seconds sliding window
- `checkRateLimit(limiter, identifier)` - Async function to check and enforce rate limits, throws error if exceeded

## Dependencies

- `@upstash/ratelimit` (external)
- `@upstash/redis` (external)

## Used By

TBD

## Notes

- Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables
- Uses sliding window algorithm for smoother rate limiting
- Analytics enabled for tracking rate limit usage
- Throws descriptive error with reset time when limit exceeded