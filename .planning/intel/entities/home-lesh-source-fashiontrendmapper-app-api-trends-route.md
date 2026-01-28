---
path: /home/lesh/source/FashionTrendMapper/app/api/trends/route.ts
type: api
updated: 2026-01-27
status: active
---

# route.ts

## Purpose

API endpoint that returns all fashion trends with their popularity scores and daily change percentages. Serves as the primary data source for the home page visualization.

## Exports

- `GET` - Async route handler that fetches trends via `getTrendsWithChange()` and returns JSON response with success status, trend data array, and lastUpdated timestamp

## Dependencies

- [[trend-repository]] - `getTrendsWithChange` function for database access
- `next/server` - NextResponse for API responses

## Used By

TBD

## Notes

- Returns `{ success: true, data: TrendWithHistory[], lastUpdated: string }` on success
- Returns `{ success: false, error: string, data: [] }` with status 500 on failure
- Logs errors to console for debugging