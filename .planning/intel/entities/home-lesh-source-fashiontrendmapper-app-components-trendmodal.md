---
path: /home/lesh/source/FashionTrendMapper/app/components/TrendModal.tsx
type: component
updated: 2026-01-28
status: active
---

# TrendModal.tsx

## Purpose

A modal dialog component that displays detailed information about a selected fashion trend, including its popularity score, change percentage, description, related trends, and an Amazon affiliate shopping link. Uses the native HTML `<dialog>` element for proper accessibility.

## Exports

- `TrendModal` - React component that renders a modal with trend details, related trends list, and affiliate link

## Dependencies

- react (useRef, useEffect)
- [[home-lesh-source-fashiontrendmapper-lib-fetchers-types]] - TrendWithHistory type
- [[home-lesh-source-fashiontrendmapper-lib-utils-related-trends]] - findRelatedTrends function
- [[home-lesh-source-fashiontrendmapper-lib-affiliate-amazon-links]] - getAmazonFashionLink function

## Used By

TBD

## Notes

- Uses native `<dialog>` element with `showModal()` for proper modal behavior and accessibility
- Handles ESC key close via native dialog event listener
- Displays up to 3 related trends using `findRelatedTrends`
- Integrates Amazon affiliate links for trend monetization