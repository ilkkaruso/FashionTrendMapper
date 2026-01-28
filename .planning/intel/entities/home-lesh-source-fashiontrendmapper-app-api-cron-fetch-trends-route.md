---
path: /home/lesh/source/FashionTrendMapper/app/api/cron/fetch-trends/route.ts
type: api
updated: 2026-01-25
status: active
---

# route.ts

## Purpose

Cron job endpoint that fetches fashion trends from Google Trends, normalizes the scores, and persists them to the database with historical tracking. Designed to run on Vercel Cron with authentication via CRON_SECRET.

## Exports

- `dynamic` - Route segment config set to 'force-dynamic' to prevent response caching
- `maxDuration` - Extended timeout of 60 seconds for Vercel Pro deployments
- `GET` - Main handler that orchestrates fetch → normalize → save pipeline with auth validation

## Dependencies

- [[lib-fetchers-google-trends]] - Fetches raw trend data from Google Trends API
- [[lib-normalizers-score-normalizer]] - Normalizes trend scores to 0-100 scale
- [[lib-database-trend-repository]] - Persists trends with history tracking
- next/server (NextRequest)

## Used By

TBD

## Notes

- Requires `CRON_SECRET` environment variable for authentication via Authorization header
- Returns detailed stats including source counts, cache status, and duration metrics
- Pipeline: authenticate → fetch Google Trends → normalize scores → save to database