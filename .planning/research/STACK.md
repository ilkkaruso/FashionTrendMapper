# Stack Research

## Frontend

### Framework: Next.js 14+ (App Router)
**Confidence: High**

- Best-in-class for Vercel deployment (same company)
- Server components for data fetching
- Built-in API routes for backend logic
- TypeScript support out of the box

### Visualization: D3.js + custom physics
**Confidence: High**

While Chart.js and ApexCharts offer bubble charts, they don't provide the Crypto Bubbles-style physics simulation needed. D3.js with d3-force gives:
- Force-directed layout with center gravity
- Collision detection for bubbles
- Smooth animations
- Full control over rendering

Alternative considered: Recharts (React-friendly D3 wrapper) — but lacks force simulation.

### Styling: Tailwind CSS
**Confidence: High**

- Utility-first, fast iteration
- Works perfectly with Next.js
- Good for responsive design

### Animation: Framer Motion
**Confidence: Medium**

- For modal transitions and UI animations (not bubble physics)
- D3 handles the bubble animations

## Backend/API

### Serverless Functions: Next.js API Routes
**Confidence: High**

- Vercel native
- TypeScript support
- Easy cron integration

### Scheduled Jobs: Vercel Cron Jobs
**Confidence: High**

- Native Vercel feature
- Configure in vercel.json with cron expressions
- Daily refresh: `"0 5 * * *"` (5am UTC)
- Free tier includes cron jobs

## Database

### Primary: Vercel Postgres (or Supabase)
**Confidence: Medium**

Options:
1. **Vercel Postgres** — Native integration, free tier available
2. **Supabase** — More generous free tier, Postgres-based
3. **PlanetScale** — MySQL, great free tier, but Postgres preferred

Recommendation: Start with Supabase for generous free tier (500MB), easy setup.

### Caching: Vercel KV (Redis)
**Confidence: Medium**

- Cache API responses (Google Trends, Reddit, Amazon products)
- Avoid rate limits
- Fast reads for frontend

Alternative: Use database with TTL columns if KV costs are a concern.

## Data Sources

### Google Trends: pytrends (with caution) or SerpApi
**Confidence: Medium**

- **pytrends** — Free, unofficial, breaks frequently when Google changes backend
- **SerpApi** — Paid but reliable ($50/mo for 5,000 searches)
- **Glimpse API** — Most reliable, but paid

Recommendation: Start with pytrends via a Python microservice or serverless function. Have SerpApi as fallback if pytrends breaks.

Note: Google launched an official Trends API in 2025 (alpha) — worth monitoring.

### Reddit: PRAW or Reddit API directly
**Confidence: High**

- Free tier: 100 queries per minute
- Non-commercial use allowed
- Fashion subreddits: r/malefashionadvice, r/femalefashionadvice, r/streetwear, r/womensstreetwear
- Limitation: 1,000 posts max per subreddit query

### Pinterest: Unofficial API / Scraping service
**Confidence: Low**

- Official API focused on advertisers, not trend data
- Pinterest Trends API exists but requires business approval
- Options:
  - ScrapeCreators API (paid)
  - Self-hosted scraper with Playwright (maintenance burden)
  - Skip Pinterest for v1, add later

Recommendation: Deprioritize Pinterest for v1. Focus on Google Trends + Reddit.

## Affiliate Integration

### Amazon PA-API 5.0
**Confidence: High**

- Official SDK: paapi5-nodejs-sdk
- Community wrapper: amazon-paapi (cleaner syntax)
- Requires Amazon Associates account (approval needed)
- Rate limits apply, cache product results

Setup steps:
1. Sign up for Amazon Associates
2. Get approved (requires existing website/traffic)
3. Generate PA-API credentials
4. Use SDK to search products by keyword

## Recommendations Summary

| Component | Choice | Confidence | Rationale |
|-----------|--------|------------|-----------|
| Framework | Next.js 14+ | High | Vercel native, full-stack |
| Visualization | D3.js + d3-force | High | Only option for force-directed bubbles |
| Styling | Tailwind CSS | High | Fast, responsive |
| Database | Supabase | Medium | Free tier, Postgres |
| Cache | Vercel KV or Supabase | Medium | Rate limit protection |
| Google Trends | pytrends → SerpApi fallback | Medium | Free first, paid backup |
| Reddit | PRAW / Reddit API | High | Free, generous limits |
| Pinterest | Skip for v1 | Low | API access issues |
| Affiliate | Amazon PA-API 5.0 | High | Best product catalog |
| Hosting | Vercel | High | Native cron, edge functions |

## What NOT to Use

| Don't Use | Why |
|-----------|-----|
| Chart.js/ApexCharts for bubbles | No force-directed physics simulation |
| TikTok API | Business approval required, too restrictive |
| Instagram Graph API | Only for business accounts you own |
| X/Twitter API | Free tier allows only 1,500 reads/month |
| Official Pinterest API | Focused on advertisers, not trend data |
| MongoDB | Overkill for this use case, Postgres simpler |
| Self-hosted scraping for all sources | Maintenance nightmare, use APIs where possible |
