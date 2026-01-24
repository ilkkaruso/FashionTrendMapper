# Phase 2: Data Collection - Research

**Researched:** 2026-01-24
**Domain:** Data fetching and aggregation from Google Trends and Reddit APIs
**Confidence:** MEDIUM

## Summary

Phase 2 requires building a data fetching pipeline that collects fashion trends from Google Trends and Reddit, normalizes scores across sources, and runs daily via Vercel cron jobs. The research reveals critical constraints and architectural choices:

**Key findings:**
- Google Trends has NO official API - must use unofficial scrapers (google-trends-api npm) which break frequently when Google changes backend
- Reddit API requires OAuth with 60-100 requests/minute limit via snoowrap wrapper
- Vercel Hobby plan supports 100 cron jobs but only HOURLY precision (not minute-level)
- Vercel serverless functions timeout at 10 seconds on Hobby (60s on Pro)
- Score normalization requires min-max scaling (0-100) since sources use different scales
- Rate limiting and caching are critical - use @upstash/ratelimit with Vercel KV/Redis

**Primary recommendation:** Use google-trends-api (npm) for Google Trends despite fragility, snoowrap for Reddit with OAuth, and Vercel cron with CRON_SECRET authentication. Cache aggressively and implement graceful degradation when APIs fail. Plan for Google Trends to break and require maintenance.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| google-trends-api | 4.9.2 | Fetch Google Trends data | Most popular Node.js wrapper, but unmaintained for 5 years - breaks often |
| snoowrap | 1.23.0 | Reddit API wrapper | Fully-featured JS wrapper with automatic token refresh and Promise-based |
| @upstash/ratelimit | 2.0.8 | Rate limiting for serverless | Built for Vercel/serverless, integrates with Upstash Redis/Vercel KV |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @upstash/redis | latest | Serverless Redis client | For caching API responses and rate limit state |
| @vercel/kv | latest | Vercel KV storage | Alternative to Upstash Redis if using Vercel ecosystem |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| google-trends-api | @alkalisummer/google-trends-js | TypeScript-native, updated 3 months ago, but less community adoption |
| google-trends-api | pytrends (Python) | More actively maintained, but requires Python serverless function |
| google-trends-api | SerpApi/Glimpse (paid) | Reliable and won't break, but costs $50-200/month |
| snoowrap | reddit-wrapper | Lighter weight, but missing features like auto token refresh |
| Vercel cron | Supabase pg_cron | Native to database, no network call, but couples data fetching to DB |

**Installation:**
```bash
npm install google-trends-api snoowrap @upstash/ratelimit @upstash/redis
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── api/
│   ├── cron/
│   │   ├── fetch-trends/
│   │   │   └── route.ts        # Main cron endpoint (CRON_SECRET auth)
│   │   ├── test-google/
│   │   │   └── route.ts        # Manual test endpoint
│   │   └── test-reddit/
│   │       └── route.ts        # Manual test endpoint
lib/
├── fetchers/
│   ├── google-trends.ts        # Google Trends fetcher
│   ├── reddit-trends.ts        # Reddit fetcher
│   └── types.ts                # Shared types
├── normalizers/
│   └── score-normalizer.ts     # Score normalization logic
├── database/
│   └── trend-repository.ts     # Supabase data access layer
└── utils/
    ├── rate-limiter.ts         # Upstash rate limiter config
    └── cache.ts                # Caching utilities
```

### Pattern 1: Cron Route with Authentication
**What:** Vercel cron jobs invoke production endpoints via GET request with CRON_SECRET header
**When to use:** Always for scheduled jobs - prevents unauthorized execution
**Example:**
```typescript
// app/api/cron/fetch-trends/route.ts
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(request: NextRequest) {
  // Authenticate cron request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Fetch from both sources in parallel
    const [googleTrends, redditTrends] = await Promise.all([
      fetchGoogleTrends(),
      fetchRedditTrends()
    ]);

    // Normalize and merge
    const normalized = normalizeScores(googleTrends, redditTrends);

    // Save to database
    await saveTrends(normalized);

    return Response.json({ success: true, count: normalized.length });
  } catch (error) {
    console.error('Cron job failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Pattern 2: Rate-Limited API Fetcher with Caching
**What:** Wrapper around external API with rate limiting and cache layer
**When to use:** For all external API calls (Google Trends, Reddit)
**Example:**
```typescript
// lib/fetchers/google-trends.ts
import googleTrends from 'google-trends-api';
import { ratelimit } from '@/lib/utils/rate-limiter';

export async function fetchGoogleTrends(keywords: string[]) {
  // Check rate limit
  const { success } = await ratelimit.limit('google-trends');
  if (!success) {
    throw new Error('Rate limit exceeded');
  }

  // Try cache first
  const cached = await getCachedTrends('google', keywords);
  if (cached) return cached;

  try {
    // Fetch daily trends
    const results = await googleTrends.dailyTrends({
      geo: 'US',
    });

    const parsed = JSON.parse(results);
    const trends = parsed.default.trendingSearchesDays[0].trendingSearches;

    // Cache for 1 hour
    await cacheTrends('google', keywords, trends, 3600);
    return trends;
  } catch (error) {
    console.error('Google Trends fetch failed:', error);
    // Return stale cache if available
    return await getStaleCachedTrends('google', keywords) || [];
  }
}
```

### Pattern 3: Score Normalization Across Sources
**What:** Min-max normalization to scale different source scores to 0-100
**When to use:** When aggregating scores from different APIs with different scales
**Example:**
```typescript
// lib/normalizers/score-normalizer.ts
export function normalizeScores(
  googleTrends: GoogleTrend[],
  redditTrends: RedditTrend[]
) {
  // Google Trends uses search volume (0-100 already)
  // Reddit uses upvotes (can be 0-10000+)

  const redditMax = Math.max(...redditTrends.map(t => t.upvotes));
  const redditMin = Math.min(...redditTrends.map(t => t.upvotes));

  const normalized = redditTrends.map(trend => ({
    title: trend.title,
    source: 'reddit',
    // Min-max normalization to 0-100
    score: ((trend.upvotes - redditMin) / (redditMax - redditMin)) * 100
  }));

  const googleNormalized = googleTrends.map(trend => ({
    title: trend.title,
    source: 'google',
    score: trend.searchVolume // Already 0-100
  }));

  // Merge and aggregate by title
  return aggregateByTitle([...googleNormalized, ...normalized]);
}

function aggregateByTitle(trends: NormalizedTrend[]) {
  const grouped = trends.reduce((acc, trend) => {
    if (!acc[trend.title]) {
      acc[trend.title] = { scores: [], sources: [] };
    }
    acc[trend.title].scores.push(trend.score);
    acc[trend.title].sources.push(trend.source);
    return acc;
  }, {});

  return Object.entries(grouped).map(([title, data]) => ({
    title,
    score: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
    sources: data.sources,
    sourceBreakdown: {
      google: data.scores[data.sources.indexOf('google')] || null,
      reddit: data.scores[data.sources.indexOf('reddit')] || null,
    }
  }));
}
```

### Pattern 4: Reddit OAuth with snoowrap
**What:** Initialize snoowrap with OAuth credentials for authenticated requests
**When to use:** For all Reddit API access
**Example:**
```typescript
// lib/fetchers/reddit-trends.ts
import snoowrap from 'snoowrap';

const reddit = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT!,
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN!,
});

export async function fetchRedditTrends() {
  const subreddits = ['streetwear', 'malefashionadvice', 'femalefashionadvice'];

  const allPosts = await Promise.all(
    subreddits.map(async (subreddit) => {
      // Get hot posts from last 24 hours
      const posts = await reddit.getSubreddit(subreddit).getHot({ time: 'day', limit: 25 });
      return posts.map(post => ({
        title: post.title,
        upvotes: post.ups,
        subreddit: post.subreddit.display_name,
        url: post.url,
      }));
    })
  );

  return allPosts.flat();
}
```

### Anti-Patterns to Avoid
- **Don't call APIs on every request:** Always cache responses for at least 1 hour - trends don't change that fast
- **Don't use cron expressions for minute precision on Hobby plan:** Vercel Hobby only supports hourly precision - job runs anywhere in the hour
- **Don't skip CRON_SECRET validation:** Anyone with the URL can trigger expensive API calls
- **Don't rely on Google Trends API always working:** It WILL break - implement fallbacks and monitoring
- **Don't aggregate scores without normalization:** Different sources use different scales (0-100 vs 0-10000)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rate limiting in serverless | In-memory counter or custom Redis logic | @upstash/ratelimit | Handles distributed state, multiple algorithms (sliding window, token bucket), serverless-optimized |
| Reddit OAuth flow | Custom OAuth implementation | snoowrap | Auto-refreshes tokens, handles rate limits, fully typed Promise API |
| Cron scheduling | Custom queue or polling | Vercel cron jobs | Native to platform, no infrastructure, automatic monitoring |
| Score normalization | Manual percentage calculation | Min-max or Z-score normalization | Handles edge cases (division by zero, negative values, outliers) |
| API response caching | Custom file or DB storage | Upstash Redis with TTL | Serverless-friendly, automatic expiration, global replication |

**Key insight:** External API integration is harder than it looks. Google Trends has no official API and unofficial scrapers break constantly. Reddit has strict rate limits (60-100 req/min) and complex OAuth. Don't underestimate the brittleness - build defensive code with caching, fallbacks, and monitoring.

## Common Pitfalls

### Pitfall 1: Google Trends API Breaking Without Warning
**What goes wrong:** google-trends-api scrapes Google's frontend - when Google changes HTML/endpoints, the library breaks completely
**Why it happens:** No official API exists - all libraries scrape the website. Google frequently changes backend (confirmed by library maintainers)
**How to avoid:**
- Implement try-catch with fallback to cached data
- Monitor library GitHub issues for breaking changes
- Consider paid alternative (SerpApi) for production reliability
- Set up alerts when fetch fails
**Warning signs:**
- 429 rate limit errors (Google blocking you)
- Empty results array
- "Too many requests" message
- Library returns error about changed endpoint

### Pitfall 2: Vercel Cron Job Not Running at Expected Time
**What goes wrong:** Job configured for `0 5 * * *` (5am UTC) runs anywhere between 5:00-5:59am on Hobby plan
**Why it happens:** Vercel Hobby plan only guarantees hourly precision to distribute load - NOT minute precision
**How to avoid:**
- Upgrade to Pro plan for minute precision ($20/month)
- Design system to tolerate up to 1 hour variance
- Don't schedule multiple jobs in same hour on Hobby
**Warning signs:**
- Logs show job running at inconsistent minutes
- Jobs triggering in middle of hour, not at :00

### Pitfall 3: Reddit API Rate Limiting (429 Errors)
**What goes wrong:** Fetching from multiple subreddits quickly hits 60-100 requests/minute limit
**Why it happens:** Limit is per OAuth client ID - applies to ALL requests from your app, and Reddit uses 10-minute rolling window
**How to avoid:**
- Space out subreddit requests (100ms delay between calls)
- Cache Reddit responses for at least 1 hour
- Use rate limiter to track usage locally
- Don't fetch on every page load - only in cron job
**Warning signs:**
- 429 status codes in logs
- X-Ratelimit-Remaining header showing 0
- Requests failing after initial success

### Pitfall 4: Serverless Function Timeout (10s Hobby, 60s Pro)
**What goes wrong:** Cron job times out before completing all API calls
**Why it happens:** Fetching from multiple APIs sequentially takes too long - Google Trends (3s) + Reddit 3 subreddits (5s) + DB writes (2s) = 10s+
**How to avoid:**
- Fetch APIs in parallel with Promise.all()
- Cache aggressively to reduce API calls
- Consider splitting into separate cron jobs per source
- Monitor function duration in Vercel logs
**Warning signs:**
- "Function execution timeout" errors
- Partial data saved (only Google or only Reddit)
- Logs showing 10s+ execution time

### Pitfall 5: Cron Job Not Following Redirects
**What goes wrong:** If your route has trailingSlash enabled or redirects, cron job completes without executing logic
**Why it happens:** Vercel cron invocations don't follow 3xx redirects - they treat redirect as final response
**How to avoid:**
- Ensure cron route path exactly matches vercel.json (including trailing slash)
- Check Next.js config for `trailingSlash: true` and adjust paths
- Test with curl locally: `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/fetch-trends`
**Warning signs:**
- Cron logs show 200 status but no data updated
- Function not executing but no errors

### Pitfall 6: Concurrent Cron Executions Creating Race Conditions
**What goes wrong:** If job runs longer than 1 hour, next invocation starts while first still running - both write to DB
**Why it happens:** Vercel doesn't prevent concurrent invocations - if job takes 65 minutes and runs hourly, overlap occurs
**How to avoid:**
- Implement distributed lock with Redis (check if lock exists before running)
- Keep job duration well under interval (aim for <30 min for hourly job)
- Make operations idempotent (safe to run twice)
- Use unique IDs to detect duplicate processing
**Warning signs:**
- Duplicate trends in database
- Logs showing two invocations with overlapping timestamps
- Inconsistent data state

### Pitfall 7: Environment Variables Not Available in Vercel Cron
**What goes wrong:** CRON_SECRET or API keys undefined in cron execution but work in regular API routes
**Why it happens:** Environment variables not set in production deployment or set after deployment
**How to avoid:**
- Set env vars in Vercel dashboard before deploying
- Redeploy after adding new env vars
- Check logs for "undefined" errors
- Test with manual API call first: `curl https://your-app.vercel.app/api/cron/fetch-trends`
**Warning signs:**
- 401 Unauthorized errors in cron logs
- "clientId is required" errors from snoowrap
- "Cannot read property of undefined"

## Code Examples

Verified patterns from official sources:

### Vercel Cron Configuration
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/fetch-trends",
      "schedule": "0 5 * * *"
    }
  ]
}
```
*Note: Hobby plan runs anywhere in hour 5 (5:00-5:59 UTC). Pro runs at 5:00-5:05 UTC.*

### CRON_SECRET Authentication
```typescript
// app/api/cron/fetch-trends/route.ts
import type { NextRequest } from 'next/server';

// CRITICAL: Prevent caching
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Your cron logic here
  return Response.json({ success: true });
}
```

### Upstash Rate Limiter Setup
```typescript
// lib/utils/rate-limiter.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize outside handler for caching (faster warm starts)
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(), // Uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
  analytics: true,
  prefix: "@upstash/ratelimit",
});

// Usage in API route
const { success, remaining } = await ratelimit.limit('google-trends');
if (!success) {
  return new Response('Rate limit exceeded', {
    status: 429,
    headers: { 'X-RateLimit-Remaining': remaining.toString() }
  });
}
```

### Google Trends Daily Trends Fetch
```typescript
// lib/fetchers/google-trends.ts
import googleTrends from 'google-trends-api';

export async function fetchDailyFashionTrends() {
  try {
    const results = await googleTrends.dailyTrends({
      geo: 'US',
    });

    const data = JSON.parse(results);
    const trendingSearches = data.default.trendingSearchesDays[0].trendingSearches;

    // Filter for fashion-related trends
    const fashionKeywords = ['fashion', 'style', 'clothing', 'wear', 'outfit', 'brand'];
    const fashionTrends = trendingSearches.filter((trend: any) =>
      fashionKeywords.some(keyword =>
        trend.title.query.toLowerCase().includes(keyword)
      )
    );

    return fashionTrends.map((trend: any) => ({
      title: trend.title.query,
      traffic: trend.formattedTraffic, // e.g., "50K+"
      relatedQueries: trend.relatedQueries.map((q: any) => q.query),
    }));
  } catch (error) {
    console.error('Google Trends fetch failed:', error);
    throw error;
  }
}
```

### Reddit Fashion Trends Fetch
```typescript
// lib/fetchers/reddit-trends.ts
import snoowrap from 'snoowrap';

const reddit = new snoowrap({
  userAgent: 'FashionTrendMapper/1.0',
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN!,
});

export async function fetchRedditFashionTrends() {
  const fashionSubreddits = [
    'streetwear',           // 4.1M members - streetwear trends
    'malefashionadvice',    // 5.2M members - men's fashion
    'femalefashionadvice',  // 3.2M members - women's fashion
  ];

  const allPosts = await Promise.all(
    fashionSubreddits.map(async (subreddit) => {
      const posts = await reddit.getSubreddit(subreddit)
        .getHot({ time: 'day', limit: 25 });

      return posts.map(post => ({
        title: post.title,
        upvotes: post.ups,
        subreddit: post.subreddit.display_name,
        url: `https://reddit.com${post.permalink}`,
        created: new Date(post.created_utc * 1000),
      }));
    })
  );

  return allPosts.flat();
}
```

### Saving Trends to Supabase with History Tracking
```typescript
// lib/database/trend-repository.ts
import { createClient } from '@/lib/supabase/server';

export async function saveTrendsWithHistory(trends: NormalizedTrend[]) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  for (const trend of trends) {
    // Upsert trend (insert or update)
    const { data: trendData, error: trendError } = await supabase
      .from('trends')
      .upsert({
        title: trend.title,
        description: trend.description,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'title',
      })
      .select()
      .single();

    if (trendError) throw trendError;

    // Save daily snapshot for history tracking
    const { error: historyError } = await supabase
      .from('trend_history')
      .upsert({
        trend_id: trendData.id,
        snapshot_date: today,
        data_snapshot: {
          score: trend.score,
          sources: trend.sources,
          sourceBreakdown: trend.sourceBreakdown,
        },
      }, {
        onConflict: 'trend_id,snapshot_date', // Unique constraint
      });

    if (historyError) throw historyError;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| pytrends (Python library) | google-trends-api (Node.js) | 2026 - TypeScript/Next.js ecosystem | Still unofficial, both scrape Google's frontend |
| reddit NPM package | snoowrap | Active development | Better OAuth handling, auto token refresh |
| Custom cron infrastructure | Vercel cron jobs | 2023 (Vercel launch) | No server management, native integration |
| Traditional Redis | Upstash Redis (serverless) | 2021-present | HTTP-based, no connection pooling, pay-per-request |
| Manual score averaging | Min-max normalization | Standard ML practice | Proper 0-100 scaling across different source ranges |

**Deprecated/outdated:**
- **reddit (npm package):** Abandoned, use snoowrap instead - better maintained, TypeScript support
- **google-trends-api-es:** Fork of google-trends-api with Spanish focus, not actively maintained
- **Express rate-limit:** Server-based, doesn't work in serverless - use @upstash/ratelimit
- **node-cron in serverless:** Doesn't persist across cold starts - use Vercel cron or Supabase pg_cron

**Recent changes (2025-2026):**
- **Vercel Pro default timeout reduced to 15s** (October 2025) - must explicitly configure maxDuration
- **Google launched official Trends API in alpha** (2025) - limited endpoints, may become viable alternative
- **Vercel Fluid Compute** - extends function duration to 14 minutes on paid plans for network-intensive tasks

## Open Questions

Things that couldn't be fully resolved:

1. **Google Trends API reliability for production**
   - What we know: google-trends-api breaks frequently (library unmaintained 5 years, GitHub issues show constant breakage)
   - What's unclear: How often will it break in practice? Will it work for 6 months or 6 days?
   - Recommendation: Start with google-trends-api but budget $50/month for SerpApi fallback if it breaks. Monitor GitHub issues weekly. Consider switching to @alkalisummer/google-trends-js (updated 3 months ago, TypeScript-native) as it may be more stable.

2. **Reddit rate limiting in practice**
   - What we know: Documented as 60-100 requests/minute with OAuth, 10-minute rolling window
   - What's unclear: Do multiple subreddit fetches count as separate requests? How does pagination affect limits?
   - Recommendation: Start conservative (3 subreddits, 25 posts each = 3 requests). Monitor X-Ratelimit-Remaining header. Add delay between calls if needed. Cache for 1+ hours.

3. **Vercel Hobby hourly precision impact**
   - What we know: Job runs anywhere in the hour (5:00-5:59am for `0 5 * * *`)
   - What's unclear: Is variance truly random or consistent per project? Does it affect user experience?
   - Recommendation: Design system to tolerate 1-hour variance. Run at 5am UTC (off-peak for US users). If precision becomes critical, upgrade to Pro ($20/month).

4. **Score normalization strategy across different data types**
   - What we know: Google Trends uses 0-100 scale (search volume), Reddit uses upvotes (0-10000+)
   - What's unclear: Should we use min-max (0-100), z-score (standard deviations), or weighted average?
   - Recommendation: Start with min-max normalization (simpler, preserves relative ranking). If outliers become problem (one viral Reddit post skews all scores), switch to z-score or weighted average (70% Google, 30% Reddit based on source reliability).

5. **Supabase pg_cron vs Vercel cron**
   - What we know: Both support cron jobs - pg_cron runs in database, Vercel cron invokes serverless functions
   - What's unclear: Is it better to run data fetching logic in database (pg_cron + pg_net) or in Next.js API routes (Vercel cron)?
   - Recommendation: Use Vercel cron for now (better logging, easier debugging, TypeScript). Consider pg_cron later if Vercel timeout (10s Hobby) becomes limiting or if moving to self-hosted Postgres.

6. **Fashion keyword filtering**
   - What we know: Google Trends dailyTrends returns all trending searches - need to filter for fashion
   - What's unclear: What keywords reliably identify fashion trends? How to avoid false positives?
   - Recommendation: Start with broad keywords (fashion, style, clothing, wear, outfit, brand, sneaker, accessory). Review results weekly and refine. Consider ML classification later if manual filtering becomes unmaintainable.

## Sources

### Primary (HIGH confidence)
- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs) - Official configuration guide
- [Vercel Cron Jobs Usage & Pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing) - Plan limits confirmed
- [Vercel Managing Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs) - Security best practices
- [Vercel Functions Limits](https://vercel.com/docs/functions/limitations) - Timeout limits by plan
- [Upstash Ratelimit Documentation](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview) - Official API reference
- [Supabase Cron Documentation](https://supabase.com/docs/guides/cron) - pg_cron configuration

### Secondary (MEDIUM confidence)
- [snoowrap npm package](https://www.npmjs.com/package/snoowrap) - Version 1.23.0, official package
- [google-trends-api npm](https://www.npmjs.com/package/google-trends-api) - Version 4.9.2, last updated 5 years ago
- [@upstash/ratelimit npm](https://www.npmjs.com/package/@upstash/ratelimit) - Version 2.0.8, published 5 days ago
- [Upstash Blog: Rate Limiting Next.js API Routes](https://upstash.com/blog/nextjs-ratelimiting) - Implementation guide
- [Vercel Template: Ratelimit with Upstash Redis](https://vercel.com/templates/next.js/ratelimit-with-upstash-redis) - Working example

### Tertiary (LOW confidence - requires verification)
- [Reddit API Rate Limits 2026 Guide](https://painonsocial.com/blog/reddit-api-rate-limits-guide) - Third-party analysis, not official
- [Fashion Subreddits List - NicheProwler](https://www.nicheprowler.com/tools/reddit/curated-subreddits/fashion-advice) - Community-curated list
- [Top PyTrends Alternatives](https://meetglimpse.com/software-guides/pytrends-alternatives/) - Paid service comparison
- [Min-Max vs Z-Score Normalization - Codecademy](https://www.codecademy.com/article/min-max-zscore-normalization) - Educational resource
- [Google Trends API Issues - GitHub](https://github.com/pat310/google-trends-api/issues/105) - Community reports of rate limiting

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - google-trends-api is unofficial and unmaintained, but most popular option
- Architecture: HIGH - Vercel cron patterns are official, well-documented
- Pitfalls: HIGH - Verified from official docs and community issues (rate limits, timeouts, redirects)
- Score normalization: MEDIUM - Standard ML techniques but no TypeScript library found
- Reddit API: HIGH - Official snoowrap documentation, clear rate limits

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days) - Google Trends libraries change frequently, verify before implementing
