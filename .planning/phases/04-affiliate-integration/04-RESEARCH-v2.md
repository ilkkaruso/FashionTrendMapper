# Phase 4: Affiliate Integration - Research v2 (SiteStripe Approach)

**Researched:** 2026-01-28
**Domain:** Amazon Associates SiteStripe Link Method
**Confidence:** HIGH

## Context Change

PA-API requires 3 qualifying sales before access is granted. For a new site without traffic, this creates a chicken-and-egg problem.

**Solution:** Use Amazon SiteStripe-style affiliate links that point to Amazon search results pages instead of specific products.

## SiteStripe Link Approach

### How It Works

Instead of fetching specific products via PA-API, we generate affiliate links to Amazon search results:

```
https://www.amazon.com/s?k={keyword}&tag={partner-tag}
```

Example for trend "baggy jeans":
```
https://www.amazon.com/s?k=baggy+jeans&tag=yoursite-20
```

### Advantages

| Aspect | PA-API | SiteStripe Links |
|--------|--------|------------------|
| Requirements | 3+ sales first | Just Associates account |
| Rate limits | 1 TPS, 8640 TPD | None |
| Caching needed | Yes (24h TTL) | No |
| Product images | Yes (from API) | No (link to Amazon) |
| Implementation | Complex | Simple |
| Maintenance | API changes, deprecations | Stable URL format |

### Disadvantages

- No product images in modal (users see link to Amazon instead)
- No prices displayed (Amazon shows them on their site)
- Less visual appeal
- User leaves site to browse products

### Implementation

**Much simpler architecture:**

```
lib/
└── affiliate/
    └── amazon-links.ts    # Single utility file

app/components/
└── TrendModal.tsx         # Add "Shop on Amazon" button
```

**Core utility:**

```typescript
// lib/affiliate/amazon-links.ts

const PARTNER_TAG = process.env.NEXT_PUBLIC_AMAZON_PARTNER_TAG || '';

/**
 * Generate Amazon search affiliate link for a keyword
 */
export function getAmazonSearchLink(keyword: string): string {
  const encodedKeyword = encodeURIComponent(keyword);

  if (!PARTNER_TAG) {
    // Fallback without affiliate tag (still works, just no commission)
    return `https://www.amazon.com/s?k=${encodedKeyword}`;
  }

  return `https://www.amazon.com/s?k=${encodedKeyword}&tag=${PARTNER_TAG}`;
}

/**
 * Generate Amazon Fashion search link (more targeted)
 */
export function getAmazonFashionLink(keyword: string): string {
  const encodedKeyword = encodeURIComponent(keyword);
  const baseUrl = 'https://www.amazon.com/s';

  const params = new URLSearchParams({
    k: keyword,
    i: 'fashion', // Fashion department
    ...(PARTNER_TAG && { tag: PARTNER_TAG }),
  });

  return `${baseUrl}?${params.toString()}`;
}
```

**Modal integration:**

```tsx
// In TrendModal.tsx - add after Related Trends section

<div className="pt-4 border-t">
  <a
    href={getAmazonFashionLink(trend.title)}
    target="_blank"
    rel="noopener noreferrer nofollow"
    className="flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      {/* Amazon icon or shopping bag icon */}
    </svg>
    Shop "{trend.title}" on Amazon
  </a>
  <p className="text-xs text-gray-500 mt-2 text-center">
    As an Amazon Associate we earn from qualifying purchases.
  </p>
</div>
```

### Environment Variables

Only one env var needed (and it's public since it's in the URL):

```
NEXT_PUBLIC_AMAZON_PARTNER_TAG=yoursite-20
```

### What We Remove

From the original Phase 4 plan, we can eliminate:

- ❌ paapi5-typescript-sdk package
- ❌ Database schema migration for products
- ❌ Affiliate repository (cacheAffiliateProducts, getCachedProducts)
- ❌ Cron endpoint for product fetching
- ❌ Product grid in modal
- ❌ 3 of 4 plan files (04-01, 04-02, 04-03)

### What We Keep

- ✅ Simple affiliate link utility
- ✅ "Shop on Amazon" button in modal
- ✅ Amazon Associates disclosure
- ✅ Extensibility for future PA-API (when 3 sales achieved)

## Revised Plan

**Single plan (04-01-PLAN.md):**

1. Create `lib/affiliate/amazon-links.ts` with link generators
2. Add `NEXT_PUBLIC_AMAZON_PARTNER_TAG` env var
3. Update TrendModal with "Shop on Amazon" button
4. Add Associates disclosure

**Estimated time:** ~15 minutes vs ~2 hours for PA-API approach

## Future Upgrade Path

Once the site generates 3 qualifying sales:

1. Apply for PA-API access
2. Create new plans (04-02, 04-03, 04-04) for product grid
3. Replace simple link with product carousel
4. Keep SiteStripe link as fallback

## Recommendation

**Proceed with SiteStripe link approach for v1.**

This gets affiliate monetization live immediately with minimal implementation effort. The product grid can be added as a v1.1 enhancement once PA-API access is earned.

---

*Research updated: 2026-01-28*
