---
path: /home/lesh/source/FashionTrendMapper/types/google-trends-api.d.ts
type: model
updated: 2026-01-25
status: active
---

# google-trends-api.d.ts

## Purpose

Provides TypeScript type declarations for the `google-trends-api` npm package, which lacks its own type definitions. Enables type-safe usage of the Google Trends API client throughout the project.

## Exports

- **DailyTrendsOptions** - Interface for daily trends query options (geo, trendDate)
- **InterestOverTimeOptions** - Interface for interest-over-time queries (keyword, date range, geo, language, timezone, category)
- **RelatedQueriesOptions** - Interface for related queries lookup (keyword, date range, geo, language, timezone, category)
- **googleTrends** (default) - Typed API client object with methods: `dailyTrends`, `interestOverTime`, `relatedQueries`

## Dependencies

- google-trends-api (external, ambient module declaration)

## Used By

TBD

## Notes

- All API methods return `Promise<string>` - responses need JSON parsing
- This is an ambient module declaration (`declare module`) for augmenting an untyped npm package