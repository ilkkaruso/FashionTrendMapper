# Phase 4: Affiliate Integration - Research

**Researched:** 2026-01-28
**Domain:** Amazon Product Advertising API (PA-API) 5.0, Affiliate Integration Architecture
**Confidence:** HIGH

## Summary

Amazon Product Advertising API (PA-API) 5.0 is the official API for retrieving Amazon product data with affiliate links. The API requires Amazon Associates account credentials (Access Key, Secret Key, Partner Tag) and operates on a rate-limited model (initial: 1 TPS, 8640 TPD) that scales with affiliate revenue. The SearchItems operation enables keyword-based product search with configurable resources (images, prices, titles). Aggressive caching (24h TTL) is essential due to strict rate limits.

For TypeScript/Next.js integration, `paapi5-typescript-sdk` provides native TypeScript support with cleaner API than alternatives. The database schema requires migration to add ASIN, image URLs, price data, and TTL fields. A provider pattern with abstract interface enables future extensibility for multiple affiliate networks (ShareASale, CJ Affiliate, etc.).

**Primary recommendation:** Use `paapi5-typescript-sdk` for Amazon integration, implement 24-hour database cache with `expires_at` field, and abstract affiliate operations behind a provider interface for future network additions.

## Standard Stack

The established libraries/tools for Amazon PA-API integration:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| paapi5-typescript-sdk | 0.2.0 | TypeScript SDK for PA-API 5.0 | Native TypeScript support, cleaner API than official SDK, proper type definitions |
| Next.js API Routes | 16.x | Serverless functions for API calls | Already in stack, secure server-side credential handling |
| Supabase PostgreSQL | - | Product cache storage | Already in stack, TTL pattern via expires_at column |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @itsmaneka/paapi5-nodejs-sdk | Latest | Enhanced official SDK fork | If paapi5-typescript-sdk has issues, includes OffersV2 support |
| amazon-paapi | Latest | Simplified wrapper (non-TypeScript) | If TypeScript not required, simpler API |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| paapi5-typescript-sdk | Official paapi5-nodejs-sdk | Official but unmaintained, worse API, no TypeScript definitions |
| paapi5-typescript-sdk | amazon-paapi | Simpler API but no TypeScript support, requires custom typings |
| paapi5-typescript-sdk | @itsmaneka/paapi5-nodejs-sdk | Actively maintained fork, more features (OffersV2), slightly heavier |

**Installation:**
```bash
npm install paapi5-typescript-sdk
```

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── affiliate/
│   ├── types.ts              # Shared affiliate interfaces
│   ├── provider.ts           # Abstract provider interface
│   └── providers/
│       ├── amazon.ts         # Amazon PA-API implementation
│       └── index.ts          # Provider registry
├── database/
│   └── affiliate-repository.ts  # Database operations for products
app/
└── api/
    └── affiliate/
        └── fetch-products/
            └── route.ts      # API endpoint for product fetching
```

### Pattern 1: Provider Interface (Strategy Pattern)
**What:** Abstract interface defining affiliate operations, implemented by network-specific providers
**When to use:** When supporting multiple affiliate networks or planning to add more
**Example:**
```typescript
// Source: Design Patterns research + project requirements
// lib/affiliate/provider.ts

export interface AffiliateProduct {
  id: string;           // Network-specific ID (ASIN for Amazon)
  name: string;
  link: string;         // Affiliate link with partner tag
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
  provider: string;     // "amazon", "shareasale", etc.
}

export interface AffiliateProvider {
  name: string;

  /**
   * Search for products by keyword
   * @param keyword Search term (e.g., trend title)
   * @param limit Max products to return (default: 6)
   * @returns Array of affiliate products
   */
  searchProducts(keyword: string, limit?: number): Promise<AffiliateProduct[]>;

  /**
   * Check if provider credentials are configured
   */
  isConfigured(): boolean;
}
```

### Pattern 2: Amazon Provider Implementation
**What:** Concrete implementation of AffiliateProvider for Amazon PA-API
**When to use:** For Phase 4 Amazon integration
**Example:**
```typescript
// Source: paapi5-typescript-sdk documentation + PA-API best practices
// lib/affiliate/providers/amazon.ts

import { SearchItemsRequest, PartnerType, Host, Region } from 'paapi5-typescript-sdk';
import type { AffiliateProvider, AffiliateProduct } from '../provider';

export class AmazonProvider implements AffiliateProvider {
  name = 'amazon';

  private accessKey: string;
  private secretKey: string;
  private partnerTag: string;

  constructor() {
    this.accessKey = process.env.AMAZON_ACCESS_KEY || '';
    this.secretKey = process.env.AMAZON_SECRET_KEY || '';
    this.partnerTag = process.env.AMAZON_PARTNER_TAG || '';
  }

  isConfigured(): boolean {
    return !!(this.accessKey && this.secretKey && this.partnerTag);
  }

  async searchProducts(keyword: string, limit = 6): Promise<AffiliateProduct[]> {
    if (!this.isConfigured()) {
      console.warn('Amazon PA-API not configured');
      return [];
    }

    try {
      const request = new SearchItemsRequest(
        {
          Keywords: keyword,
          SearchIndex: 'Fashion',  // Fashion = Clothing, Shoes & Jewelry
          ItemCount: Math.min(limit, 10), // PA-API max is 10
          Resources: [
            'Images.Primary.Medium',
            'ItemInfo.Title',
            'Offers.Listings.Price',  // Use OffersV2 after Jan 31, 2026
          ],
        },
        this.partnerTag,
        PartnerType.ASSOCIATES,
        this.accessKey,
        this.secretKey,
        Host.UNITED_STATES,
        Region.UNITED_STATES
      );

      const response = await request.send();

      if (!response.SearchResult?.Items) {
        return [];
      }

      return response.SearchResult.Items.map((item: any) => ({
        id: item.ASIN,
        name: item.ItemInfo?.Title?.DisplayValue || 'Unknown Product',
        link: item.DetailPageURL || '',
        imageUrl: item.Images?.Primary?.Medium?.URL || null,
        price: item.Offers?.Listings?.[0]?.Price?.Amount || null,
        currency: item.Offers?.Listings?.[0]?.Price?.Currency || 'USD',
        provider: 'amazon',
      }));

    } catch (error) {
      console.error('Amazon PA-API error:', error);
      return [];
    }
  }
}
```

### Pattern 3: Repository Pattern for Database Cache
**What:** Database layer for caching affiliate products with TTL
**When to use:** All affiliate product storage operations
**Example:**
```typescript
// Source: PostgreSQL TTL research + Supabase patterns
// lib/database/affiliate-repository.ts

import { createClient } from '@/lib/supabase/server';
import type { AffiliateProduct } from '@/lib/affiliate/provider';

/**
 * Cache affiliate products for a trend
 *
 * @param trendId UUID of the trend
 * @param products Products to cache
 * @param ttlHours Hours until cache expires (default: 24)
 */
export async function cacheAffiliateProducts(
  trendId: string,
  products: AffiliateProduct[],
  ttlHours = 24
): Promise<void> {
  const supabase = await createClient();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttlHours);

  // Delete existing products for this trend
  await supabase
    .from('affiliate_products')
    .delete()
    .eq('trend_id', trendId);

  // Insert new products
  const rows = products.map(p => ({
    trend_id: trendId,
    provider: p.provider,
    product_id: p.id,
    product_name: p.name,
    affiliate_link: p.link,
    image_url: p.imageUrl,
    current_price: p.price,
    currency: p.currency,
    expires_at: expiresAt.toISOString(),
  }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from('affiliate_products')
      .insert(rows);

    if (error) {
      console.error('Error caching affiliate products:', error);
      throw error;
    }
  }
}

/**
 * Get cached products for a trend
 *
 * @param trendId UUID of the trend
 * @returns Cached products if valid, empty array if expired/missing
 */
export async function getCachedProducts(trendId: string): Promise<AffiliateProduct[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('affiliate_products')
    .select('*')
    .eq('trend_id', trendId)
    .gt('expires_at', now);  // Only get non-expired products

  if (error) {
    console.error('Error fetching cached products:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map(row => ({
    id: row.product_id,
    name: row.product_name,
    link: row.affiliate_link,
    imageUrl: row.image_url,
    price: row.current_price,
    currency: row.currency,
    provider: row.provider,
  }));
}
```

### Anti-Patterns to Avoid
- **Client-side API calls:** Never expose PA-API credentials to browser. Always use server-side API routes.
- **No caching:** Rate limits are strict (1 TPS initial). Without caching, you'll hit limits immediately.
- **Editing affiliate links:** PA-API terms prohibit link modification. Use links exactly as returned.
- **Requesting all resources:** Only request needed resources (Images, Title, Price) to reduce latency.
- **Single API calls per product:** Use batch operations (up to 10 ASINs in GetItems).
- **Ignoring TTL:** Offers/prices are volatile (1h TTL), static data is stable (24h TTL).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PA-API request signing | Custom AWS V4 signature | paapi5-typescript-sdk | AWS V4 signing is complex, error-prone, SDK handles it |
| Rate limiting logic | Custom token bucket | Database cache + TTL | PA-API enforces server-side limits, cache prevents hitting them |
| Price formatting | Custom currency logic | Display raw price with currency | Amazon handles currency, price display varies by locale |
| Product search parsing | Custom HTML scraping | PA-API SearchItems | Scraping violates TOS, API is official method |
| Affiliate link generation | Manual URL building | Use DetailPageURL from API | Partner tag injection is automatic, manual risks TOS violation |
| Multi-provider switching | Manual if/else chains | Provider interface + registry | Strategy pattern enables runtime switching, easier testing |

**Key insight:** Amazon PA-API has strict terms of service. Violating them (link editing, scraping, improper caching) can result in account suspension. Use the official SDK and follow caching guidelines exactly.

## Common Pitfalls

### Pitfall 1: Credentials Not Activating (48-Hour Lag)
**What goes wrong:** New PA-API credentials return 429 TooManyRequests or authentication errors immediately after creation
**Why it happens:** New API keys take up to 48 hours to activate after creation in Amazon Associates Central
**How to avoid:**
- Create credentials at project start, wait 48 hours before implementation
- Test credentials using [PA-API Scratchpad](https://webservices.amazon.com/paapi5/scratchpad/index.html)
- Store credentials in environment variables immediately, even if not active yet
**Warning signs:** 429 errors within first 2 days of credential creation

### Pitfall 2: Rate Limits with Zero Revenue (Access Revoked)
**What goes wrong:** 429 TooManyRequests errors despite caching, requests fail silently
**Why it happens:**
- Initial limits: 1 TPS (request/second), 8640 TPD (requests/day)
- If no "qualified referring sales" for 30 consecutive days, access is paused
- Limits increase with revenue: +1 TPD per $0.05 revenue, +1 TPS per $4,320 revenue (max 10 TPS)
**How to avoid:**
- Implement aggressive caching (24h TTL minimum)
- Spread requests evenly over 24 hours, not in bursts
- Only fetch products for top 10 trends (requirement), not all trends
- Monitor for 429 errors, reduce frequency if detected
**Warning signs:** 429 errors after working for weeks/months, new Associate account

### Pitfall 3: Offers V1 Deprecation (January 31, 2026)
**What goes wrong:** Price data stops returning, Offers resource becomes unavailable
**Why it happens:** Amazon is deprecating Offers V1 on January 31, 2026, migrating to OffersV2
**How to avoid:**
- Use `Offers.Listings.Price` now (still works until Jan 31, 2026)
- Plan migration to OffersV2 resources before deadline
- **CRITICAL:** Creators API (replacement) requires NEW credentials, AWS keys won't work
- Create Creators API credentials in Associates Central before Jan 31
**Warning signs:** Empty price data after Jan 31, 2026, deprecation notices in API responses

### Pitfall 4: Over-Requesting Resources (Slow Response)
**What goes wrong:** API responses are slow (>2s), high latency in product display
**Why it happens:** Requesting all available resources increases response payload and processing time
**How to avoid:**
- Only request needed resources: `Images.Primary.Medium`, `ItemInfo.Title`, `Offers.Listings.Price`
- Don't request: CustomerReviews, BrowseNodeInfo, SalesRank unless displaying them
- For fashion products, SearchIndex: "Fashion" is more focused than "All"
**Warning signs:** API latency >1s, large response payloads (>500KB)

### Pitfall 5: Volatile Data Caching Too Long
**What goes wrong:** Displayed prices are outdated, deals/availability wrong
**Why it happens:** Caching prices/offers for 24 hours when they change more frequently
**How to avoid:**
- **Official recommendation:** Offers (prices) cache 1 hour, other data 24 hours
- For fashion trends project: 24h cache acceptable (not real-time price comparison site)
- If implementing price tracking, use 1h TTL for price field only
**Warning signs:** Customer complaints about wrong prices, expired deals shown

### Pitfall 6: Not Handling Partial Responses
**What goes wrong:** Entire product fetch fails when 1-2 items are invalid
**Why it happens:** PA-API returns partial responses (valid items + error objects)
**How to avoid:**
- SearchItems can return 0-10 items even if requesting 10
- Check `response.SearchResult?.Items` exists before mapping
- Handle `response.Errors` array for invalid requests
- Gracefully degrade: show 4 products if only 4 found, not an error
**Warning signs:** Empty product grids when some products should exist

## Code Examples

Verified patterns from official sources:

### Fetching Products for Top 10 Trends (Cron Job)
```typescript
// Source: Project requirements + PA-API best practices
// app/api/affiliate/fetch-products/route.ts

import { NextResponse } from 'next/server';
import { getTrendsWithChange } from '@/lib/database/trend-repository';
import { getCachedProducts, cacheAffiliateProducts } from '@/lib/database/affiliate-repository';
import { AmazonProvider } from '@/lib/affiliate/providers/amazon';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get top 10 trends (AFF-01 requirement)
    const allTrends = await getTrendsWithChange();
    const top10 = allTrends.slice(0, 10);

    // 2. Initialize provider
    const provider = new AmazonProvider();
    if (!provider.isConfigured()) {
      console.warn('Amazon provider not configured, skipping product fetch');
      return NextResponse.json({
        message: 'Provider not configured',
        fetched: 0
      });
    }

    // 3. Fetch products for each trend
    let fetchedCount = 0;
    let cachedCount = 0;

    for (const trend of top10) {
      // Get trend ID from database
      const supabase = await createClient();
      const { data } = await supabase
        .from('trends')
        .select('id')
        .eq('title', trend.title)
        .single();

      if (!data) continue;
      const trendId = data.id;

      // Check cache first (AFF-06 requirement)
      const cachedProducts = await getCachedProducts(trendId);
      if (cachedProducts.length > 0) {
        cachedCount++;
        continue;
      }

      // Fetch fresh products (AFF-02: 4-6 products)
      const products = await provider.searchProducts(trend.title, 6);

      if (products.length > 0) {
        await cacheAffiliateProducts(trendId, products, 24); // 24h TTL
        fetchedCount++;
      }

      // Rate limiting: 1 TPS initial, add delay
      await new Promise(resolve => setTimeout(resolve, 1100)); // 1.1s = safe
    }

    return NextResponse.json({
      message: 'Product fetch complete',
      top10Count: top10.length,
      fetched: fetchedCount,
      cached: cachedCount,
    });

  } catch (error) {
    console.error('Error fetching affiliate products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Displaying Products in TrendModal (Frontend)
```typescript
// Source: Project requirements MODAL-05, AFF-03, AFF-04, AFF-05
// app/components/TrendModal.tsx (add after Related Trends section)

interface AffiliateProductDisplay {
  id: string;
  name: string;
  link: string;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
}

// Add to TrendModal component (after relatedTrends section):
{affiliateProducts.length > 0 && (
  <div>
    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
      Shop This Trend
    </h3>
    <div className="grid grid-cols-2 gap-3">
      {affiliateProducts.map(product => (
        <div
          key={product.id}
          className="border rounded-lg p-2 hover:shadow-md transition-shadow"
        >
          {/* Product Image (AFF-03) */}
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-32 object-cover rounded mb-2"
            />
          )}

          {/* Product Name */}
          <p className="text-xs text-gray-700 line-clamp-2 mb-1">
            {product.name}
          </p>

          {/* Price (AFF-04) */}
          {product.price && (
            <p className="text-sm font-semibold text-gray-900 mb-2">
              {product.currency === 'USD' ? '$' : product.currency}
              {product.price.toFixed(2)}
            </p>
          )}

          {/* Buy Button (AFF-05) */}
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="block w-full text-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-xs font-semibold py-1.5 rounded transition-colors"
          >
            Buy on Amazon
          </a>
        </div>
      ))}
    </div>
    <p className="text-xs text-gray-500 mt-2">
      As an Amazon Associate we earn from qualifying purchases.
    </p>
  </div>
)}
```

### Environment Variables Setup
```bash
# Source: PA-API authentication requirements
# .env.local

# Amazon Product Advertising API (PA-API 5.0)
# Get from: Amazon Associates Central > Product Advertising API
AMAZON_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
AMAZON_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AMAZON_PARTNER_TAG=yourtaghere-20

# Cron authentication (for /api/affiliate/fetch-products)
CRON_SECRET=your-random-secret-here
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Offers V1 resources | OffersV2 resources | Deprecation: Jan 31, 2026 | Must migrate to Creators API with new credentials |
| AWS IAM credentials | Associates Central credentials | PA-API 5.0 (2019) | Can migrate from AWS console or use Associates Central |
| XML responses | JSON/RPC responses | PA-API 5.0 (2019) | Lighter payload, faster parsing |
| HTTP GET/REST | HTTPS POST/RPC | PA-API 5.0 (2019) | More secure, AWS Signature V4 |
| ResponseGroups | Resources | PA-API 5.0 (2019) | Granular resource selection, better performance |

**Deprecated/outdated:**
- **Offers V1:** Deprecated Jan 31, 2026. Use OffersV2 resources (`Offers.Listings.Price` → requires Creators API)
- **PA-API 4.0 (XML):** Fully retired. Must use PA-API 5.0 (JSON)
- **AWS Console credential management:** Can still use, but Associates Central is now primary method
- **paapi5-nodejs-sdk (official):** Unmaintained. Use forks (`@itsmaneka/paapi5-nodejs-sdk`) or unofficial (`paapi5-typescript-sdk`)

## Open Questions

Things that couldn't be fully resolved:

1. **OffersV2 Migration Exact Timing**
   - What we know: Offers V1 deprecated Jan 31, 2026; OffersV2 requires Creators API credentials
   - What's unclear: Whether existing implementations will break immediately or have grace period
   - Recommendation: Use Offers V1 (`Offers.Listings.Price`) for Phase 4, add migration task to Phase 5. Monitor Amazon announcements.

2. **Rate Limit Scaling Timeline**
   - What we know: +1 TPS per $4,320 revenue, +1 TPD per $0.05 revenue in trailing 30 days
   - What's unclear: How quickly limits increase after first sale, whether limits decrease if revenue drops
   - Recommendation: Start with conservative caching (24h TTL, top 10 only). Monitor 429 errors and adjust.

3. **SearchIndex for Fashion Sub-Categories**
   - What we know: "Fashion" SearchIndex works for all clothing/shoes/jewelry
   - What's unclear: Whether sub-categories (Women's Fashion, Men's Fashion) improve relevance
   - Recommendation: Use "Fashion" SearchIndex. If product relevance is poor, experiment with sub-categories in refinement phase.

4. **Product Relevance Algorithm**
   - What we know: Keywords parameter searches product titles/descriptions; no relevance score returned
   - What's unclear: How Amazon ranks results, whether brand-specific trends (e.g., "Nike Air Max") return better results than style trends (e.g., "baggy jeans")
   - Recommendation: Accept PA-API ranking as-is. If products are irrelevant, investigate SearchRefinements resource for filtering.

## Sources

### Primary (HIGH confidence)
- [Amazon PA-API 5.0 Official Documentation](https://webservices.amazon.com/paapi5/documentation/) - Core API concepts
- [SearchItems Operation](https://webservices.amazon.com/paapi5/documentation/search-items.html) - SearchItems parameters and resources
- [Images Resource](https://webservices.amazon.com/paapi5/documentation/images.html) - Image URL structure and sizes
- [API Rates](https://webservices.amazon.com/paapi5/documentation/troubleshooting/api-rates.html) - Rate limits (WebSearch verified)
- [Best Programming Practices](https://webservices.amazon.com/paapi5/documentation/best-programming-practices.html) - Official caching guidelines
- [OffersV2 Documentation](https://webservices.amazon.com/paapi5/documentation/offersV2.html) - Price/offer resources
- [paapi5-typescript-sdk GitHub](https://github.com/Pigotz/paapi5-typescript-sdk) - TypeScript SDK source
- [paapi5-typescript-sdk npm](https://www.npmjs.com/package/paapi5-typescript-sdk) - Package details (attempted fetch)

### Secondary (MEDIUM confidence)
- [amazon-paapi npm](https://www.npmjs.com/package/amazon-paapi) - Alternative package (WebSearch verified)
- [PA-API Scratchpad](https://webservices.amazon.com/paapi5/scratchpad/index.html) - Credential testing tool
- [Adapter Pattern for Multiple Integrations](https://medium.com/@olorondu_emeka/adapter-design-pattern-a-guide-to-manage-multiple-third-party-integrations-dc342f435daf) - Provider pattern research
- [Strategy Pattern vs Provider Pattern](https://www.simplethread.com/the-provider-model-pattern-really/) - Pattern comparison
- [Next.js Environment Variables](https://nextjs.org/docs/pages/guides/environment-variables) - Env var best practices (WebSearch verified)
- [PostgreSQL TTL Implementation](https://medium.com/@tihomir.manushev/implementing-redis-like-ttl-in-postgresql-6d7dedd51bef) - Cache expiration patterns

### Tertiary (LOW confidence)
- [Amazon PA-API 429 TooManyRequests Guide](https://www.keywordrush.com/blog/fix-amazon-paapi-too-many-requests/) - Rate limit troubleshooting (blog post)
- [Amazon Creators API Migration](https://www.keywordrush.com/blog/amazon-creator-api-what-changed-and-how-to-switch/) - OffersV2 deprecation details (blog post)
- [New PA-API V5 for Node](https://rationaldev.com/new-amazon-product-advertising-api-v5-for-node/) - Package comparison (blog post, 2019)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - paapi5-typescript-sdk verified via GitHub, official PA-API docs authoritative
- Architecture: HIGH - Provider pattern is established design pattern, verified via multiple sources
- Pitfalls: HIGH - Rate limits, credentials, deprecation verified via official Amazon documentation
- Schema design: HIGH - Based on PA-API response structure (official docs) and PostgreSQL TTL research
- Code examples: MEDIUM - Synthesized from official docs + SDK examples, not production-tested

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - stable domain, but OffersV2 deprecation Jan 31 makes this time-sensitive)

**CRITICAL DATES:**
- January 31, 2026: Offers V1 deprecated, must migrate to OffersV2/Creators API
- 48 hours after credential creation: New PA-API keys become active
