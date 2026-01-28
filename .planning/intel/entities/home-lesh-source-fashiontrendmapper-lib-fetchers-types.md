---
path: /home/lesh/source/FashionTrendMapper/lib/fetchers/types.ts
type: model
updated: 2026-01-25
status: active
---

# types.ts

## Purpose

Defines shared TypeScript types for trend data fetching, normalization, and historical comparison. Provides a consistent type system for handling raw external data, normalized scores, and generic fetch results across the trend collection pipeline.

## Exports

- **SourceType**: Union type for supported trend data sources (currently only 'google')
- **RawTrend**: Interface for raw trend data as returned from external APIs with source-specific scoring
- **NormalizedTrend**: Interface for trends with consistent 0-100 scoring and multi-source support
- **TrendWithHistory**: Extended NormalizedTrend that includes percentage change from previous day
- **FetchResult<T>**: Generic wrapper interface for fetch operations with success/error/cache states

## Dependencies

None

## Used By

TBD

## Notes

- Score normalization converts source-specific scales to a consistent 0-100 range
- FetchResult pattern enables consistent error handling and cache awareness across fetchers
- TrendWithHistory.changePercent ranges from -100 (complete disappearance) to +infinity (new trend)