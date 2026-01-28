---
path: /home/lesh/source/FashionTrendMapper/lib/utils/category-matcher.ts
type: util
updated: 2026-01-27
status: active
---

# category-matcher.ts

## Purpose

Maps trend titles to predefined categories (clothing, styles, brands, colors, accessories) via keyword matching. Used for client-side filtering since the database doesn't store category information.

## Exports

- **CATEGORIES**: Readonly array of category strings including 'all', 'clothing', 'styles', 'brands', 'colors', 'accessories'
- **Category**: TypeScript type derived from CATEGORIES array
- **detectCategory(title: string)**: Scans title for keywords and returns first matching category, defaults to 'styles'

## Dependencies

None

## Used By

TBD

## Notes

- Category detection is case-insensitive
- First matching category wins (order: clothing → styles → brands → colors → accessories)
- 'all' category exists in CATEGORIES but is excluded from detection results
- Default fallback is 'styles' when no keywords match