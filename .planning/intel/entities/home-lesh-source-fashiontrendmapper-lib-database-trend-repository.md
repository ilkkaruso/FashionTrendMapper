---
path: /home/lesh/source/FashionTrendMapper/lib/database/trend-repository.ts
type: service
updated: 2026-01-25
status: active
---

# trend-repository.ts

## Purpose

Database repository for trend operations with Supabase. Handles saving normalized trends with historical snapshots and retrieving trends with change calculations for tracking trend movements over time.

## Exports

- `saveTrendsWithHistory(trends: NormalizedTrend[]): Promise<void>` - Upserts trends to database, saves source scores to trend_sources junction table, and creates daily snapshots in trend_history for change tracking
- `getTrendsWithChange` - Retrieves trends with calculated change data (implementation truncated)

## Dependencies

- [[lib-supabase-server]] - Supabase client for database operations
- [[lib-fetchers-types]] - NormalizedTrend and TrendWithHistory type definitions

## Used By

TBD

## Notes

- Uses upsert pattern with `onConflict` for idempotent saves
- Creates daily snapshots using ISO date format (YYYY-MM-DD)
- Processes trends sequentially with individual error handling to prevent single failures from blocking batch
- Logs success/error counts for observability