# Roadmap: FashionTrendMapper

**Created:** 2026-01-21
**Milestone:** v1.0

## Overview

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 1 | Foundation | 4 | ○ Pending |
| 2 | Data Collection | 6 | ○ Pending |
| 3 | Visualization | 15 | ○ Pending |
| 4 | Affiliate Integration | 8 | ○ Pending |
| 5 | Admin & Archive | 12 | ○ Pending |

**Total:** 5 phases | 39 requirements | 0% complete

---

## Phase 1: Foundation

**Goal:** Set up project infrastructure — Next.js app, Supabase database, Vercel deployment pipeline.

**Requirements:**
- INFRA-01: Deploy on Vercel
- INFRA-02: Supabase database for trend storage
- INFRA-04: Environment variables for API keys
- (Partial) INFRA-03: Vercel project setup (cron added in Phase 2)

**Success Criteria:**
1. Next.js 14 app created with TypeScript and Tailwind CSS
2. Supabase project created with database schema (trends, trend_sources, affiliate_products, trend_history, admin_config tables)
3. App deploys successfully to Vercel
4. Environment variables configured for Supabase connection
5. Basic page structure exists (/, /archive, /admin routes)

**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md — Next.js app creation with TypeScript, Tailwind, and basic routes
- [ ] 01-02-PLAN.md — Supabase project setup with complete database schema
- [ ] 01-03-PLAN.md — Supabase client integration and Vercel deployment

**Dependencies:** None (starting point)

---

## Phase 2: Data Collection

**Goal:** Build data fetching pipeline — Google Trends and Reddit fetchers with daily cron job.

**Requirements:**
- FETCH-01: Fetch fashion trends from Google Trends daily
- FETCH-02: Fetch fashion trends from Reddit fashion subreddits daily
- FETCH-03: Scheduled daily refresh at fixed time (5am UTC)
- FETCH-04: Normalize and aggregate scores across sources
- FETCH-05: Track trend history for change calculations
- FETCH-06: Handle API rate limits gracefully with caching

**Success Criteria:**
1. Google Trends fetcher retrieves fashion-related search trends
2. Reddit fetcher pulls trending topics from r/malefashionadvice, r/femalefashionadvice, r/streetwear
3. Scores normalized to 0-100 scale per source
4. Combined scoring algorithm weights sources appropriately
5. Daily cron job configured and triggers at 5am UTC
6. Rate limiting and caching prevents API failures
7. Historical data stored for change percentage calculations

**Dependencies:** Phase 1 (database must exist)

---

## Phase 3: Visualization

**Goal:** Build the Crypto Bubbles-style animated visualization with trend modal.

**Requirements:**
- VIZ-01: Animated bubble visualization with D3 force-directed physics
- VIZ-02: Bubbles sized by popularity score
- VIZ-03: Center gravity pulls largest bubbles to middle
- VIZ-04: Trend name displayed on each bubble
- VIZ-05: Popularity score (0-100) displayed on each bubble
- VIZ-06: Daily change indicator (+/-%)
- VIZ-07: Responsive design (mobile + desktop)
- DATA-01: Category filtering (clothing, styles, brands, colors)
- DATA-02: Search within trends
- DATA-03: Last updated timestamp
- DATA-04: Trends sorted by popularity
- MODAL-01: Click bubble opens modal
- MODAL-02: Trend description
- MODAL-03: Score breakdown by source
- MODAL-04: Related trends

**Success Criteria:**
1. D3 force-directed simulation renders animated bubbles
2. Bubble size correlates with popularity score
3. Largest bubbles gravitate toward center
4. Each bubble displays: trend name, score, change %
5. Mobile users can tap bubbles (min 40px touch target)
6. Category filter buttons work
7. Search input filters visible trends
8. "Last updated" timestamp shows on page
9. Clicking bubble opens modal with details
10. Modal shows trend description, source breakdown, related trends

**Dependencies:** Phase 2 (needs trend data to display)

---

## Phase 4: Affiliate Integration

**Goal:** Connect Amazon PA-API and display products for top 10 trends.

**Requirements:**
- MODAL-05: Affiliate product grid for top 10 trends
- AFF-01: Top 10 trends automatically fetch Amazon products
- AFF-02: Product grid shows 4-6 products per trend
- AFF-03: Display product images in modal
- AFF-04: Display product prices in modal
- AFF-05: "Buy on Amazon" button with affiliate link
- AFF-06: Cache product results to avoid rate limits
- AFF-07: Affiliate system extensible for future networks

**Success Criteria:**
1. Amazon PA-API integration working with valid credentials
2. Top 10 trends (by score) trigger product fetch
3. Products cached in database with 24h TTL
4. Modal shows 4-6 relevant products with images
5. Product prices displayed accurately
6. "Buy on Amazon" buttons have valid affiliate links
7. Affiliate provider abstracted for future network additions

**Dependencies:** Phase 3 (modal must exist to show products)

**Note:** Requires Amazon Associates account approval before affiliate links work.

---

## Phase 5: Admin & Archive

**Goal:** Build admin dashboard for management and archive page for historical trends.

**Requirements:**
- ADMIN-01: Password-protected admin access
- ADMIN-02: View all current trends with scores
- ADMIN-03: Configure top N threshold
- ADMIN-04: View fetch logs
- ADMIN-05: Alert when API endpoints fail
- ADMIN-06: Manual refresh trigger
- ARCH-01: Separate archive page
- ARCH-02: Paginated past trends list
- ARCH-03: Peak score display
- ARCH-04: Date range when trending
- ARCH-05: Preserved affiliate links
- INFRA-05: Error logging and monitoring

**Success Criteria:**
1. /admin route protected by password
2. Admin can view all trends with current scores
3. Admin can change top N threshold (default: 10)
4. Fetch logs visible with timestamps and status
5. Failed fetch attempts show warning/alert
6. Manual refresh button triggers data fetch
7. /archive page lists past trends (paginated)
8. Past trends show peak score achieved
9. Past trends show date range when in top 10
10. Archived trends retain affiliate links
11. Error logging captures and surfaces issues

**Dependencies:** Phase 4 (archive needs affiliate links to preserve)

---

## Requirement Coverage

All 39 v1 requirements mapped:

| Category | Count | Phases |
|----------|-------|--------|
| Infrastructure | 5 | 1, 2, 5 |
| Data Collection | 6 | 2 |
| Visualization | 7 | 3 |
| Data Display | 4 | 3 |
| Modal | 5 | 3, 4 |
| Affiliate | 7 | 4 |
| Archive | 5 | 5 |
| Admin | 6 | 5 |

**Coverage:** 39/39 requirements (100%) ✓

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| pytrends API breaks | Medium | High | Build abstraction layer, SerpApi fallback |
| Amazon Associates rejection | Medium | High | Apply early, have site live first |
| D3 mobile performance | Low | Medium | Limit bubbles to 50-100, test on devices |
| Vercel function timeout | Low | Medium | Parallelize fetches, consider Pro plan |

---

*Roadmap created: 2026-01-21*
*Last updated: 2026-01-22*
