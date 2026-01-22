# Requirements: FashionTrendMapper

**Defined:** 2026-01-21
**Core Value:** Surface trending fashion items with actionable buy links — users discover what's hot and can immediately purchase through affiliate links.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Visualization

- [ ] **VIZ-01**: Animated bubble visualization with D3 force-directed physics
- [ ] **VIZ-02**: Bubbles sized by popularity score (bigger = more popular)
- [ ] **VIZ-03**: Center gravity pulls largest bubbles to middle
- [ ] **VIZ-04**: Trend name displayed on each bubble
- [ ] **VIZ-05**: Popularity score (0-100) displayed on each bubble
- [ ] **VIZ-06**: Daily change indicator (+/-%) displayed on each bubble
- [ ] **VIZ-07**: Responsive design works on mobile and desktop

### Data Display

- [ ] **DATA-01**: Category filtering (clothing, styles, brands, colors)
- [ ] **DATA-02**: Search within trends by typing
- [ ] **DATA-03**: Last updated timestamp visible on page
- [ ] **DATA-04**: Trends sorted by popularity in visualization

### Trend Modal

- [ ] **MODAL-01**: Click bubble opens modal with trend details
- [ ] **MODAL-02**: Modal shows trend description/explanation
- [ ] **MODAL-03**: Modal shows score breakdown by source (Google vs Reddit)
- [ ] **MODAL-04**: Modal shows related trends (similar/connected)
- [ ] **MODAL-05**: Modal displays affiliate product grid for top 10 trends

### Data Collection

- [ ] **FETCH-01**: Fetch fashion trends from Google Trends daily
- [ ] **FETCH-02**: Fetch fashion trends from Reddit fashion subreddits daily
- [ ] **FETCH-03**: Scheduled daily refresh at fixed time (5am UTC)
- [ ] **FETCH-04**: Normalize and aggregate scores across sources
- [ ] **FETCH-05**: Track trend history for change calculations
- [ ] **FETCH-06**: Handle API rate limits gracefully with caching

### Affiliate Integration

- [ ] **AFF-01**: Top 10 trends automatically fetch Amazon products
- [ ] **AFF-02**: Product grid shows 4-6 products per trend
- [ ] **AFF-03**: Display product images in modal
- [ ] **AFF-04**: Display product prices in modal
- [ ] **AFF-05**: "Buy on Amazon" button with affiliate link
- [ ] **AFF-06**: Cache product results to avoid rate limits
- [ ] **AFF-07**: Affiliate system extensible for future networks

### Archive Page

- [ ] **ARCH-01**: Separate page showing past trends
- [ ] **ARCH-02**: Paginated list of trends that dropped from top 10
- [ ] **ARCH-03**: Display peak score trend achieved
- [ ] **ARCH-04**: Display date range when trend was in top 10
- [ ] **ARCH-05**: Preserve affiliate links from when trend was active

### Admin Dashboard

- [ ] **ADMIN-01**: Password-protected admin access (single user)
- [ ] **ADMIN-02**: View all current trends with scores
- [ ] **ADMIN-03**: Configure top N threshold (default: 10)
- [ ] **ADMIN-04**: View fetch logs with timestamps
- [ ] **ADMIN-05**: Alert/warning when API endpoints fail
- [ ] **ADMIN-06**: Manual refresh trigger button

### Infrastructure

- [ ] **INFRA-01**: Deploy on Vercel
- [ ] **INFRA-02**: Supabase database for trend storage
- [ ] **INFRA-03**: Vercel cron job for daily refresh
- [ ] **INFRA-04**: Environment variables for API keys
- [ ] **INFRA-05**: Error logging and monitoring

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Data Sources

- **SRC-01**: Pinterest integration for visual trends
- **SRC-02**: TikTok integration (if API access obtained)
- **SRC-03**: Multiple affiliate networks (ShareASale, etc.)

### User Features

- **USER-01**: Trend alerts when item hits popularity threshold
- **USER-02**: Social sharing of individual trends
- **USER-03**: Historical trend chart (30-day sparkline)
- **USER-04**: Compare trends side-by-side

### Admin Enhancements

- **ADM-01**: Scoring weight configuration
- **ADM-02**: Trend synonym/alias management
- **ADM-03**: Multiple admin users
- **ADM-04**: Analytics dashboard (clicks, conversions)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts for browsing | Adds friction, no value for casual users |
| Comments/social features | Not a social platform, focus on data |
| User-submitted trends | Quality control nightmare |
| Real-time updates | Overkill for fashion, daily sufficient |
| Price tracking | Different product, scope creep |
| Outfit recommendations | AI complexity, different product |
| Mobile app | Web works fine, app store hassle |
| Source icons on bubbles | Visual clutter, deferred to modal |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 2 | Pending |
| INFRA-04 | Phase 1 | Pending |
| INFRA-05 | Phase 5 | Pending |
| VIZ-01 | Phase 3 | Pending |
| VIZ-02 | Phase 3 | Pending |
| VIZ-03 | Phase 3 | Pending |
| VIZ-04 | Phase 3 | Pending |
| VIZ-05 | Phase 3 | Pending |
| VIZ-06 | Phase 3 | Pending |
| VIZ-07 | Phase 3 | Pending |
| DATA-01 | Phase 3 | Pending |
| DATA-02 | Phase 3 | Pending |
| DATA-03 | Phase 3 | Pending |
| DATA-04 | Phase 3 | Pending |
| MODAL-01 | Phase 3 | Pending |
| MODAL-02 | Phase 3 | Pending |
| MODAL-03 | Phase 3 | Pending |
| MODAL-04 | Phase 3 | Pending |
| MODAL-05 | Phase 4 | Pending |
| FETCH-01 | Phase 2 | Pending |
| FETCH-02 | Phase 2 | Pending |
| FETCH-03 | Phase 2 | Pending |
| FETCH-04 | Phase 2 | Pending |
| FETCH-05 | Phase 2 | Pending |
| FETCH-06 | Phase 2 | Pending |
| AFF-01 | Phase 4 | Pending |
| AFF-02 | Phase 4 | Pending |
| AFF-03 | Phase 4 | Pending |
| AFF-04 | Phase 4 | Pending |
| AFF-05 | Phase 4 | Pending |
| AFF-06 | Phase 4 | Pending |
| AFF-07 | Phase 4 | Pending |
| ARCH-01 | Phase 5 | Pending |
| ARCH-02 | Phase 5 | Pending |
| ARCH-03 | Phase 5 | Pending |
| ARCH-04 | Phase 5 | Pending |
| ARCH-05 | Phase 5 | Pending |
| ADMIN-01 | Phase 5 | Pending |
| ADMIN-02 | Phase 5 | Pending |
| ADMIN-03 | Phase 5 | Pending |
| ADMIN-04 | Phase 5 | Pending |
| ADMIN-05 | Phase 5 | Pending |
| ADMIN-06 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 39 total
- Mapped to phases: 39
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-21*
*Last updated: 2026-01-21 after initial definition*
