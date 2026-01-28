---
path: /home/lesh/source/FashionTrendMapper/app/api/test/google-trends/route.ts
type: api
updated: 2026-01-25
status: active
---

# route.ts

## Purpose

Manual test endpoint for the Google Trends fetcher that allows developers to verify trend data retrieval. Provides open access in development mode but requires CRON_SECRET authentication in production.

## Exports

- `dynamic` - Next.js route segment config set to 'force-dynamic' to disable caching
- `GET` - HTTP GET handler that fetches Google Trends data and returns JSON response with success status, cache info, and trend data

## Dependencies

- `next/server` (NextRequest)
- [[google-trends-fetcher]] (@/lib/fetchers/google-trends)

## Used By

TBD

## Notes

- Environment-aware authentication: bypasses auth check when `NODE_ENV === 'development'`
- Production requires `Authorization` header matching `CRON_SECRET` env variable
- Returns structured response with `success`, `cached`, `count`, `data`, `error`, and `timestamp` fields