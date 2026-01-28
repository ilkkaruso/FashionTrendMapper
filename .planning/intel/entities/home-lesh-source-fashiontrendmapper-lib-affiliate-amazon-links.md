---
path: /home/lesh/source/FashionTrendMapper/lib/affiliate/amazon-links.ts
type: util
updated: 2026-01-28
status: active
---

# amazon-links.ts

## Purpose

Generates Amazon affiliate links using the SiteStripe approach, which requires only an Amazon Associates partner tag without needing PA-API integration. Provides functions to create search links for general Amazon or specifically the Fashion department.

## Exports

- `getAmazonSearchLink(keyword: string): string` - Generates Amazon search URL with affiliate tag for any keyword
- `getAmazonFashionLink(keyword: string): string` - Generates Amazon Fashion department search URL with affiliate tag
- `isAffiliateConfigured(): boolean` - Checks if the Amazon partner tag environment variable is set

## Dependencies

None

## Used By

TBD

## Notes

- Uses `NEXT_PUBLIC_AMAZON_TAG` environment variable for client-side availability
- Links gracefully degrade when partner tag is not configured (still functional, just not affiliated)
- Fashion links use `i=fashion` parameter to restrict results to Fashion department