---
path: /home/lesh/source/FashionTrendMapper/lib/database/trend-repository.ts
type: service
updated: 2026-01-29
status: active
---

# trend-repository.ts

## Purpose

Database repository for trend operations. Handles saving trends to Supabase with historical snapshots and retrieving trends with change calculations.

## Exports

- `saveTrendsWithHistory(trends: NormalizedTrend[]): Promise<void>` - Upserts trends to the trends table, saves source scores to trend_sources, and creates daily snapshots in trend_history for change tracking
- `getTrendsWithChange(): Promise<TrendWithHistory[]>` - Retrieves trends with calculated change data from historical snapshots

## Dependencies

- [[lib-supabase-admin]] - Supabase admin client for database operations
- `@/lib/fetchers/types` - Type definitions for NormalizedTrend, TrendWithHistory, SourceType

## Used By

TBD

## Notes

- Uses upsert operations with conflict handling on `title` for trends and `trend_id,source_name` for sources
- Creates daily snapshots in trend_history table for tracking score changes over time
- Contains a bug on line 36: calls `createClient()` instead of imported `createAdminClient()`