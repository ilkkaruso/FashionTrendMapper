---
path: /home/lesh/source/FashionTrendMapper/lib/utils/related-trends.ts
type: util
updated: 2026-01-27
status: active
---

# related-trends.ts

## Purpose

Finds trends related to a target trend using text similarity. Uses Jaccard similarity based on word overlap in trend titles as a simple starting point for relationship discovery.

## Exports

- `findRelatedTrends(targetTrend, allTrends, limit?)` - Returns up to `limit` (default 3) trends with similar titles, sorted by similarity score

## Dependencies

- [[home-lesh-source-fashiontrendmapper-lib-fetchers-types]] (TrendWithHistory type)

## Used By

TBD

## Notes

- Filters out words shorter than 3 characters
- Requires at least 1 shared word (similarity > 0) to be considered related
- Designed for future enhancement per research guidelines