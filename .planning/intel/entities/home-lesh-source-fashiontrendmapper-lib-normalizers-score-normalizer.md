---
path: /home/lesh/source/FashionTrendMapper/lib/normalizers/score-normalizer.ts
type: util
updated: 2026-01-25
status: active
---

# score-normalizer.ts

## Purpose

Normalizes trend scores from various formats (e.g., "50K+", "1M+") to a consistent 0-100 scale using min-max normalization. Enables comparable scoring across different data sources with varying score representations.

## Exports

- `normalizeScores(trends: RawTrend[]): NormalizedTrend[]` - Converts raw trend data to normalized 0-100 scores

## Dependencies

- [[lib-fetchers-types]] - RawTrend, NormalizedTrend types

## Used By

TBD

## Notes

- Handles traffic strings with K (thousands) and M (millions) suffixes
- When all values are equal, assigns middle score (50) to avoid division by zero
- Scores rounded to 2 decimal places
- Internal helpers `parseTraffic()` and `minMaxNormalize()` are not exported