---
path: /home/lesh/source/FashionTrendMapper/lib/fetchers/google-trends.ts
type: service
updated: 2026-01-25
status: active
---

# google-trends.ts

## Purpose

Fetches daily trending searches from Google Trends API and filters for fashion-related content. Implements defensive caching with stale fallback and rate limiting for API resilience.

## Exports

- `fetchGoogleTrends`: Async function that fetches and filters Google Trends data, returning `FetchResult<RawTrend[]>` with rate limiting, caching (1hr fresh/24hr stale), and fashion keyword filtering

## Dependencies

- `google-trends-api` (external)
- [[lib-fetchers-types]]
- [[lib-utils-cache]]
- [[lib-utils-rate-limiter]]

## Used By

TBD

## Notes

- Rate limited to 10 requests per 10 seconds
- Gracefully degrades to cached/stale data on API failure or rate limit
- Filters trends using 17 fashion-related keywords (fashion, style, clothing, wear, outfit, brand, sneaker, shoe, dress, jacket, jeans, accessory, streetwear, designer, luxury, vintage, aesthetic)
- Traffic parsing handles K/M suffixes (e.g., "50K+" → 50000)