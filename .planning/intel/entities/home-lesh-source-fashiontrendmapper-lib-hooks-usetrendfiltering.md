---
path: /home/lesh/source/FashionTrendMapper/lib/hooks/useTrendFiltering.ts
type: hook
updated: 2026-01-27
status: active
---

# useTrendFiltering.ts

## Purpose

React hook that provides URL-synchronized filtering capabilities for fashion trends. Manages search query and category filters with browser URL state persistence via Next.js navigation.

## Exports

- `useTrendFiltering(allTrends: TrendWithHistory[])` - Hook returning filtered trends array and filter state/setters for search query and category

## Dependencies

- `next/navigation` (useSearchParams, useRouter)
- `react` (useMemo)
- [[home-lesh-source-fashiontrendmapper-lib-fetchers-types]] (TrendWithHistory type)
- [[home-lesh-source-fashiontrendmapper-lib-utils-category-matcher]] (detectCategory, Category type)

## Used By

TBD

## Notes

- Bug: `router.push()` calls are missing the URL argument - should be `router.push(\`?\${params.toString()}\`)`
- Uses URL search params for filter state, enabling shareable/bookmarkable filtered views
- Category defaults to 'all' when not specified in URL