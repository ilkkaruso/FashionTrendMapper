# Pitfalls Research

## API & Data Source Pitfalls

### Google Trends / pytrends Instability
**Risk: High**

pytrends is unofficial and breaks whenever Google changes their backend. GitHub issues show frequent reports of broken endpoints and zero results.

**Warning signs:**
- Empty results from pytrends
- Unexpected errors or timeouts
- Data that doesn't match Google Trends website

**Prevention:**
- Build abstraction layer around data fetching
- Implement fallback to SerpApi or manual intervention
- Monitor fetch success rate in logs
- Don't rely solely on Google Trends — Reddit as backup signal

**Phase:** Data Collection

### Reddit 1,000 Post Limit
**Risk: Medium**

Reddit API caps queries at 1,000 posts per subreddit, regardless of pagination.

**Warning signs:**
- Missing trending topics that are visible on Reddit
- Incomplete data from large subreddits

**Prevention:**
- Query multiple fashion subreddits (diversify sources)
- Focus on "hot" and "rising" instead of "new"
- Supplement with search API for specific keywords

**Phase:** Data Collection

### Rate Limiting Across All APIs
**Risk: High**

All APIs have rate limits. Hitting them = broken fetches.

| Service | Limit |
|---------|-------|
| Reddit | 100 QPM |
| Amazon PA-API | Varies by account history |
| Google Trends | Unstable, can get blocked |

**Prevention:**
- Implement exponential backoff
- Cache aggressively (24h for most data)
- Batch requests where possible
- Monitor rate limit headers

**Phase:** Data Collection, Affiliate Integration

## Data Quality Pitfalls

### Trend Name Normalization
**Risk: High**

Same trend appears differently across sources:
- "baggy jeans" vs "Baggy Jeans" vs "loose fit jeans"
- "quiet luxury" vs "#quietluxury" vs "old money aesthetic"

**Warning signs:**
- Duplicate bubbles for same trend
- Fragmented scores across variations

**Prevention:**
- Normalize all trend names (lowercase, trim, remove hashtags)
- Build synonym mapping table
- Use fuzzy matching (Levenshtein distance) for deduplication
- Manual review queue for edge cases

**Phase:** Processing/Scoring

### Stale Data Display
**Risk: Medium**

If daily fetch fails, users see outdated data.

**Warning signs:**
- "Last updated" timestamp more than 24h ago
- Same trends showing for multiple days

**Prevention:**
- Display "last updated" timestamp prominently
- Alert admin on fetch failure
- Show cached data with "may be outdated" warning
- Implement retry logic for failed fetches

**Phase:** Data Collection, Presentation

### Score Normalization Edge Cases
**Risk: Medium**

Combining scores from different sources with different scales.

**Warning signs:**
- One source dominating all rankings
- New trends jumping to #1 immediately

**Prevention:**
- Use percentile ranking within each source
- Apply time decay to prevent stale trends from dominating
- Cap maximum daily score change
- Test with historical data before launch

**Phase:** Processing/Scoring

## Visualization Pitfalls

### D3 Performance with Many Bubbles
**Risk: Medium**

Force simulation is CPU-intensive. Too many bubbles = laggy experience.

**Warning signs:**
- Janky animations
- High CPU usage on mobile
- Slow initial render

**Prevention:**
- Limit visible bubbles to top 50-100
- Use requestAnimationFrame for smooth animation
- Implement level-of-detail (smaller bubbles = simpler)
- Test on low-end devices early

**Phase:** Visualization

### Mobile Touch Interactions
**Risk: Medium**

Hover states don't exist on mobile. Click targets may be too small.

**Warning signs:**
- Users can't select small bubbles
- Accidental selections

**Prevention:**
- Minimum bubble size of 40px for touch targets
- Tap to select (no hover dependency)
- Zoom/pan controls for crowded areas
- Test on actual mobile devices

**Phase:** Visualization

### SVG vs Canvas Performance
**Risk: Low**

SVG is easier but slower for many elements.

**Prevention:**
- Start with SVG (D3 default)
- Monitor performance
- Switch to Canvas rendering if needed (d3-force works with both)

**Phase:** Visualization

## Affiliate Pitfalls

### Amazon Associates Approval
**Risk: High**

Amazon requires an existing website with traffic to approve Associates accounts. New sites often get rejected.

**Warning signs:**
- Application rejection
- Account suspended for no qualifying sales

**Prevention:**
- Apply early with basic site live
- Ensure 3 qualifying sales within 180 days
- Have backup affiliate network (ShareASale, etc.)
- Build site value before relying on affiliate revenue

**Phase:** Affiliate Integration

### Amazon PA-API Product Matching
**Risk: Medium**

Searching "baggy jeans" returns thousands of products. Which ones to show?

**Warning signs:**
- Irrelevant products (kids jeans for adult fashion trends)
- Low-quality/knockoff products
- Products frequently out of stock

**Prevention:**
- Filter by category (Clothing > Women/Men)
- Sort by relevance + reviews
- Exclude products below rating threshold
- Cache and manually curate top products

**Phase:** Affiliate Integration

### Affiliate Link Compliance
**Risk: Medium**

Amazon has strict rules about affiliate disclosure.

**Warning signs:**
- Account suspension notice
- Legal issues

**Prevention:**
- Clear "Affiliate Disclosure" on site
- "As an Amazon Associate I earn from qualifying purchases"
- Don't cloak or hide affiliate nature
- Review Amazon Operating Agreement

**Phase:** Affiliate Integration

### Link Rot
**Risk: Medium**

Products go out of stock, links break, ASINs become invalid.

**Prevention:**
- Refresh product data weekly
- Handle 404s gracefully (show alternative products)
- Monitor click-through to catch broken links
- Archive products maintain links but mark "may be unavailable"

**Phase:** Affiliate Integration, Archive

## Serverless Pitfalls

### Vercel Function Timeout
**Risk: High**

Free tier: 10 second timeout. Fetching from multiple APIs may exceed this.

**Warning signs:**
- Function timeout errors in logs
- Incomplete data fetches

**Prevention:**
- Parallelize API calls
- Split into multiple smaller functions
- Use background functions or queues
- Consider Pro plan if needed (60s timeout)

**Phase:** Data Collection

### Cron Reliability
**Risk: Low**

Vercel cron is generally reliable, but can miss executions.

**Prevention:**
- Monitor cron execution logs
- Implement manual refresh fallback
- Alert admin if daily refresh didn't run

**Phase:** Data Collection

### Cold Start Latency
**Risk: Low**

First request after idle = slower response.

**Prevention:**
- Use Edge Functions where possible
- Keep functions small
- Accept first-request latency (users won't notice daily)

**Phase:** All API routes

## Prevention Strategies Summary

| Pitfall | Prevention | Phase |
|---------|------------|-------|
| pytrends instability | Abstraction layer + fallback | Data Collection |
| Reddit post limit | Multiple subreddits, hot/rising | Data Collection |
| Rate limiting | Exponential backoff, caching | Data Collection |
| Trend name normalization | Lowercase, fuzzy matching | Processing |
| Stale data | Timestamp display, retry logic | Presentation |
| D3 performance | Limit bubbles, test mobile | Visualization |
| Mobile touch | Min 40px targets, tap-to-select | Visualization |
| Amazon approval | Apply early, backup network | Affiliate |
| Product matching | Category filter, rating threshold | Affiliate |
| Affiliate compliance | Clear disclosure | Affiliate |
| Link rot | Weekly refresh, graceful 404 | Affiliate |
| Function timeout | Parallelize, split functions | Infrastructure |
