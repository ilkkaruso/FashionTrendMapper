---
phase: 02-data-collection
plan: 01
subsystem: infra
tags: [upstash, redis, rate-limiting, caching, google-trends-api, vercel-cron]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Next.js app structure, package.json, TypeScript configuration
provides:
  - Shared type definitions for trend data (RawTrend, NormalizedTrend, TrendWithHistory, FetchResult)
  - Redis-based caching utilities with stale cache fallback
  - Rate limiting utilities for external API calls (10 req/10s sliding window)
  - Vercel cron job configuration for daily trend fetching
affects: [02-02-google-trends, 02-03-normalizer, cron-jobs]

# Tech tracking
tech-stack:
  added: [google-trends-api, @upstash/ratelimit, @upstash/redis]
  patterns: [stale-cache-fallback, sliding-window-rate-limiting]

key-files:
  created:
    - lib/fetchers/types.ts
    - lib/utils/cache.ts
    - lib/utils/rate-limiter.ts
    - vercel.json
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Stale cache pattern with 24h TTL for resilience when fresh fetch fails"
  - "Sliding window rate limiter at 10 req/10s for Google Trends API"
  - "Daily cron at 5am UTC for trend fetching (Vercel Hobby limitation)"
  - "Redis.fromEnv() for automatic Upstash connection from environment variables"

patterns-established:
  - "Cache pattern: getCached → fetch → setCache with stale fallback"
  - "Rate limit pattern: checkRateLimit throws on exceeded, returns success/remaining/reset"

# Metrics
duration: 4min
completed: 2026-01-25
---

# Phase 2 Plan 1: Data Collection Infrastructure Summary

**Installed Google Trends API, Upstash Redis for caching/rate-limiting, shared type system, and Vercel cron configuration**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-25T08:26:35Z
- **Completed:** 2026-01-25T08:30:23Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Installed google-trends-api, @upstash/ratelimit, @upstash/redis packages
- Created shared type definitions for raw/normalized trend data
- Built Redis-based caching utilities with stale cache fallback pattern
- Configured sliding window rate limiter for Google Trends API (10 req/10s)
- Set up Vercel cron job for daily trend fetching at 5am UTC

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create types** - `dc0e56f` (chore)
2. **Task 2: Create caching and rate limiting utilities** - `d7b22fe` (feat)

## Files Created/Modified
- `package.json` - Added google-trends-api, @upstash/ratelimit, @upstash/redis
- `lib/fetchers/types.ts` - Shared types: RawTrend, NormalizedTrend, TrendWithHistory, FetchResult, SourceType
- `lib/utils/cache.ts` - Redis caching with getCached/setCache/getStaleCached, stale cache fallback
- `lib/utils/rate-limiter.ts` - Sliding window rate limiter, checkRateLimit helper
- `vercel.json` - Cron job configuration for /api/cron/fetch-trends at 5am UTC daily

## Decisions Made

1. **Stale cache pattern**: Implemented dual-cache approach where setCache() stores both fresh cache (with specified TTL) and stale cache (24h TTL). getStaleCached() provides fallback when fresh fetch fails, improving resilience.

2. **Sliding window rate limiter**: Chose sliding window algorithm over fixed window to prevent thundering herd at window boundaries. Set at 10 req/10s for Google Trends API.

3. **Error handling in cache**: Cache failures (get/set) log errors but don't throw, preventing cache issues from breaking app functionality.

4. **Vercel cron timing**: Set to 5am UTC (daily). Vercel Hobby plan runs crons anywhere within the specified hour, not at exact minute.

5. **@types/google-trends-api**: Package doesn't exist on npm. Proceeded without it - google-trends-api will be used without TypeScript definitions (acceptable for Phase 2).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Skipped @types/google-trends-api installation**
- **Found during:** Task 1 (dependency installation)
- **Issue:** @types/google-trends-api package doesn't exist on npm registry (404 error)
- **Fix:** Proceeded without TypeScript types for google-trends-api. The library is still usable, just without type definitions.
- **Files modified:** None (npm install skipped)
- **Verification:** npm ls shows google-trends-api installed successfully
- **Committed in:** dc0e56f (Task 1 commit note in message)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Missing types file is not critical - google-trends-api still functions. Can add custom type definitions if needed in future phase.

## Issues Encountered
None - plan executed smoothly after skipping unavailable @types package.

## User Setup Required

**External services require manual configuration.** Upstash Redis setup needed:

### Environment Variables

Add to Vercel project (or `.env.local` for development):

```env
UPSTASH_REDIS_REST_URL=<from Upstash Console>
UPSTASH_REDIS_REST_TOKEN=<from Upstash Console>
```

**Source:** Upstash Console → Database → REST API section

### Dashboard Configuration

1. Create free Redis database at console.upstash.com
2. Click "Create Database"
3. Select region (recommend: us-east-1 for lowest latency to Vercel)
4. Copy REST API credentials to environment variables

### Verification

After setup, verify Redis connection works:
```bash
# In development
npm run dev
# Cache utilities will log errors if Redis connection fails
```

## Next Phase Readiness

**Ready for:** Google Trends fetcher implementation (02-02)
- Type system defines data contracts
- Caching utilities ready to store/retrieve trend data
- Rate limiter ready to prevent API abuse
- Vercel cron job path configured

**Blockers:**
- Upstash Redis credentials must be configured before cache utilities work
- Without Redis setup, caching will fail gracefully (log errors, return null)

**Concerns:**
- google-trends-api library can break when Google changes backend structure - monitor for errors
- Vercel Hobby cron runs anywhere in hour (not exact time) - acceptable for daily trends

---
*Phase: 02-data-collection*
*Completed: 2026-01-25*
