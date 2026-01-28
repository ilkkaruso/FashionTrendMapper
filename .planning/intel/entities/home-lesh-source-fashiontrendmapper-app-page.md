---
path: /home/lesh/source/FashionTrendMapper/app/page.tsx
type: component
updated: 2026-01-27
status: active
---

# page.tsx

## Purpose

Main page component for the Fashion Trend Mapper application. Orchestrates the trend visualization dashboard by fetching trend data, managing filter/modal state, and rendering the BubbleChart visualization with filtering and detail modal capabilities.

## Exports

- `default` - Default export of the Home component (wrapped with Suspense)
- `Home` - Named export of the main page component

## Dependencies

- react (useEffect, useState, Suspense)
- [[home-lesh-source-fashiontrendmapper-app-components-bubblechart]] - Bubble visualization component
- [[home-lesh-source-fashiontrendmapper-app-components-filterbar]] - Search and category filter UI
- [[home-lesh-source-fashiontrendmapper-app-components-trendmodal]] - Trend details modal
- [[home-lesh-source-fashiontrendmapper-lib-hooks-useresizeobserver]] - Container dimension tracking
- [[home-lesh-source-fashiontrendmapper-lib-hooks-usetrendfiltering]] - Search/category filtering logic
- [[home-lesh-source-fashiontrendmapper-lib-fetchers-types]] - TrendWithHistory type

## Used By

TBD

## Notes

- Uses 'use client' directive for client-side rendering
- Fetches from `/api/trends` endpoint on mount
- HomeContent is wrapped in Suspense boundary via Home component
- Manages loading, error, and empty states for trend data