/# FashionTrendMapper

## What This Is

A fashion trends visualization website that displays animated bubbles representing current fashion trends, sized by popularity with the biggest in the center (Crypto Bubbles style). Data is fetched daily from free sources (Google Trends, Reddit fashion subreddits, Pinterest). Top trends have auto-generated Amazon affiliate links, and past trends are archived with their links preserved.

## Core Value

Surface trending fashion items with actionable buy links — users discover what's hot and can immediately purchase through affiliate links.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Animated bubble visualization with size = popularity, center gravity
- [ ] Bubbles display: trend name, popularity score, daily change %, source icons
- [ ] Click bubble opens modal with trend details and affiliate links
- [ ] Daily data fetch from Google Trends, Reddit, Pinterest
- [ ] Popularity scoring system that normalizes across sources
- [ ] Top 10 trends auto-fetch Amazon affiliate product links
- [ ] Affiliate system extensible for future networks
- [ ] Past trends page with archived trends and preserved affiliate links
- [ ] Scheduled daily refresh at fixed time
- [ ] Admin dashboard for single user
- [ ] Admin can configure popularity thresholds
- [ ] Admin can view trend stats and history
- [ ] Track clothing items, styles/aesthetics, brands, colors/patterns

### Out of Scope

- TikTok integration — API requires business approval, revisit in v2
- Instagram integration — Meta API restricted to owned business accounts
- X/Twitter integration — free tier too limited (1,500 posts/month)
- Multiple admin users — single admin sufficient for now
- Real-time updates — daily refresh is enough
- Mobile app — web-first

## Context

**Data source landscape:**
- Google Trends: No official API, use pytrends or similar scraping library
- Reddit: Free API with rate limits, fashion subreddits (r/malefashionadvice, r/femalefashionadvice, r/streetwear, etc.)
- Pinterest: API available with limitations

**Affiliate context:**
- Amazon Product Advertising API (PA-API) for product searches
- Requires Amazon Associates account with affiliate tag
- Rate limited, need to cache product results

**Visual reference:**
- Crypto Bubbles (cryptobubbles.net) — the gold standard for this bubble visualization style

## Constraints

- **Hosting**: Vercel or Netlify (serverless, free tier)
- **Budget**: Free data sources only, no paid APIs
- **API Limits**: Must respect rate limits on all services, implement caching
- **Amazon PA-API**: Requires approved Associates account before affiliate links work

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Prioritize accessible sources (Google Trends, Reddit, Pinterest) | TikTok/Instagram/X APIs too restricted | — Pending |
| Amazon-first affiliate strategy | Largest product catalog, easy to add other networks later | — Pending |
| Top 10 threshold for affiliate links | Balance between monetization and API usage/quality | — Pending |
| Single admin auth | Simplicity, only one person managing | — Pending |
| Daily scheduled refresh | Simpler than continuous, fashion trends don't change hourly | — Pending |

---
*Last updated: 2026-01-21 after initialization*
