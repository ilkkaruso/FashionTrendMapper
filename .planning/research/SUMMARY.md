# Research Summary

## Stack Recommendation

| Layer | Choice | Confidence |
|-------|--------|------------|
| Framework | Next.js 14+ (App Router) | High |
| Visualization | D3.js + d3-force | High |
| Styling | Tailwind CSS | High |
| Database | Supabase (Postgres) | Medium |
| Cache | Vercel KV | Medium |
| Hosting | Vercel | High |

## Data Sources

| Source | Method | Free Tier | Notes |
|--------|--------|-----------|-------|
| Google Trends | pytrends library | Yes | Unofficial, may break |
| Reddit | Official API | 100 QPM | Reliable, good signal |
| Pinterest | Skip for v1 | N/A | API access issues |
| Amazon Products | PA-API 5.0 | Yes* | Requires Associates approval |

## Key Findings

### Visualization
- D3.js with d3-force is the only viable option for Crypto Bubbles-style physics
- Chart.js and ApexCharts lack force simulation
- Limit to 50-100 visible bubbles for performance
- Minimum 40px bubble size for mobile touch targets

### Data Collection
- pytrends is free but unstable — have SerpApi as paid fallback
- Reddit API is reliable with generous free tier (100 QPM)
- Pinterest API is advertiser-focused, skip for v1
- Google launched official Trends API in 2025 (alpha) — monitor

### Affiliate
- Amazon PA-API 5.0 with Node.js SDK
- Requires Associates account approval (need existing traffic)
- Rate limits apply — cache product results
- Clear affiliate disclosure required for compliance

### Serverless
- Vercel cron jobs work for daily refresh
- 10s timeout on free tier — parallelize API calls
- Store API keys in Vercel environment variables

## Critical Pitfalls to Avoid

1. **pytrends instability** — Build abstraction layer, have fallback
2. **Trend name normalization** — "baggy jeans" vs "Baggy Jeans" — use fuzzy matching
3. **Amazon Associates approval** — Apply early, need 3 sales in 180 days
4. **Function timeouts** — Parallelize fetches, consider Pro plan
5. **Mobile performance** — Test D3 visualization on real devices

## Architecture Decision

```
User → Vercel (Next.js) → Supabase (Postgres)
                       ↘ Vercel KV (Cache)
                       ↘ External APIs (Google Trends, Reddit, Amazon)
```

Single Next.js app handles:
- Frontend pages (home, archive, admin)
- API routes for data
- Cron endpoint for daily refresh

## Build Order Recommendation

1. **Foundation** — Next.js + Supabase + basic pages
2. **Data Collection** — Google Trends + Reddit fetchers + cron
3. **Visualization** — D3 bubbles + modal
4. **Affiliate** — Amazon PA-API + top 10 logic
5. **Admin & Polish** — Dashboard + auth + archive page

## Sources

- [Luzmo: Best JavaScript Chart Libraries](https://www.luzmo.com/blog/best-javascript-chart-libraries)
- [pytrends GitHub](https://github.com/GeneralMills/pytrends)
- [SerpApi: Google Trends Alternative](https://serpapi.com/blog/scraping-google-trends-with-python-pytrends-alternative/)
- [Reddit API Limits](https://data365.co/blog/reddit-api-limits)
- [Amazon PA-API 5.0 Documentation](https://webservices.amazon.com/paapi5/documentation/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Pinterest Developers](https://developers.pinterest.com/docs/api/v5/)
