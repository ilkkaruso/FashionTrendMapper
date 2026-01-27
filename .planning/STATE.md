# Project State: FashionTrendMapper

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-21)

**Core value:** Surface trending fashion items with actionable buy links
**Current focus:** Phase 1 complete, ready for Phase 2

## Current Position

- **Phase:** 3 of 5 — Visualization (in progress)
- **Plan:** 2 of 5 in phase (03-01, 03-02 complete, Wave 2 executing)
- **Status:** Bubble chart components ready - BubbleChart and Bubble with D3 force physics
- **Last activity:** 2026-01-27 - Completed 03-02-PLAN.md - Bubble chart components (3m 53s)

**Progress:** ████████████████ 100% Phase 2 | █████████░ 48% Overall (12/25 plans)

## Milestone: v1.0

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 1 | Foundation | ✅ Complete | 100% (3/3) |
| 2 | Data Collection | ✅ Complete | 100% (5/5) |
| 3 | Visualization | 🔄 In Progress | 40% (2/5) |
| 4 | Affiliate Integration | ○ Pending | 0% |
| 5 | Admin & Archive | ○ Pending | 0% |

## Recent Activity

- 2026-01-27: Completed 03-02-PLAN.md - Bubble chart components with animated force physics (3m 53s)
- 2026-01-27: Completed 03-01-PLAN.md - D3 infrastructure with force simulation hooks (4m 19s)
- 2026-01-27: Replaced google-trends-api with SerpApi for reliable trend fetching
- 2026-01-26: Phase 3 planning complete - 5 plans created (03-01 through 03-05)
- 2026-01-26: Fixed MODAL-02 blocker - added description to types and plans
- 2026-01-26: Completed 02-05-PLAN.md - Database write policies (gap closure, Phase 2 complete)
- 2026-01-25: Completed 02-04-PLAN.md - Daily cron endpoint for automated trend collection
- 2026-01-25: Completed 02-03-PLAN.md - Score normalization and database persistence
- 2026-01-25: Completed 02-02-PLAN.md - Google Trends fetcher with fashion filtering
- 2026-01-25: Completed 02-01-PLAN.md - Data collection infrastructure (types, cache, rate-limiter)
- 2026-01-24: Completed 01-03-PLAN.md - Supabase integration + Vercel deployment
- 2026-01-24: Fixed Next.js 16 middleware→proxy deprecation
- 2026-01-22: Completed 01-02-PLAN.md - Supabase database with 8 tables

## Key Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| d3.scaleSqrt() for radius scaling | Area proportional to score (not radius) for accurate visual comparison, 20-80px range | 2026-01-27 |
| Green/red color coding for trends | Instant visual feedback: green (#22c55e) for positive, red (#ef4444) for negative | 2026-01-27 |
| useMemo for bubble nodes array | Prevents node recreation on every render, avoids unnecessary simulation resets | 2026-01-27 |
| Charge force proportional to bubble area | Strength = -radius² × 0.05 creates repulsion scaled to bubble size, prevents overlap | 2026-01-27 |
| Weak center force in D3 simulation | 0.05 strength lets collision dynamics dominate, larger bubbles naturally drift to center | 2026-01-27 |
| Array cloning in D3 tick handler | [...simulation.nodes()] creates new reference to trigger React re-render on position updates | 2026-01-27 |
| Simulation in useRef pattern | Avoids recreation on every render, only recreate when nodes.length/width/height changes | 2026-01-27 |
| SerpApi replaces google-trends-api | Old library returned HTML instead of JSON; SerpApi is reliable with 100 free searches/month | 2026-01-27 |
| Description field added to NormalizedTrend type | MODAL-02 requires trend description, database has column, types now expose it | 2026-01-26 |
| D3 for calculations, React for DOM | D3+React best practice per 03-RESEARCH.md, cleaner separation of concerns | 2026-01-26 |
| Native dialog element for modal | Built-in accessibility (focus trap, ESC close), no library needed | 2026-01-26 |
| URL search params for filter state | Shareable filter URLs, per 03-RESEARCH.md recommendation | 2026-01-26 |
| d3plus-text for SVG text wrapping | Only library that handles SVG text wrapping in bubbles | 2026-01-26 |
| Service_role-scoped RLS policies for server operations | Cron runs server-side with service_role credentials, policies must target service_role not anon | 2026-01-26 |
| 6 RLS policies for trend writes (INSERT + UPDATE × 3 tables) | Postgres requires separate policies per operation type and table | 2026-01-26 |
| UNIQUE constraint on trends.title | Repository upsert with onConflict requires UNIQUE constraint on conflict column | 2026-01-26 |
| CRON_SECRET authentication via Bearer token | Vercel sends cron requests with Authorization header, prevents unauthorized access | 2026-01-25 |
| Stats-based cron responses for monitoring | Return detailed stats (counts, duration, success flags) for Vercel log analysis | 2026-01-25 |
| Force dynamic cron endpoint | dynamic='force-dynamic' prevents response caching, critical for daily jobs | 2026-01-25 |
| Min-max normalization scales 0-100 relative to batch | Ensures fair comparison within each batch, highest=100, lowest=0 | 2026-01-25 |
| All equal scores → 50 (middle value) | Avoid division by zero when max=min, 50 represents average | 2026-01-25 |
| Change percentage = 0 for new trends | No yesterday snapshot = new trend, clear distinction from trending-up | 2026-01-25 |
| Cap change at +100% when yesterday = 0 | Prevents "Infinity%" display in UI, +100% is max shown increase | 2026-01-25 |
| 17 fashion keywords for filtering | Covers broad categories (clothing, accessories, styles) while avoiding generic terms | 2026-01-25 |
| parseTraffic() string conversion | Google Trends returns "50K+", normalize to integers for consistent scoring | 2026-01-25 |
| Rate limit before cache check | Prevents cache bypass abuse, stops thundering herd on cache expiry | 2026-01-25 |
| Test endpoint security model | Dev-accessible for iteration, prod-requires-CRON_SECRET to prevent abuse | 2026-01-25 |
| Stale cache fallback pattern | Dual-cache (fresh + 24h stale) for resilience when fetch fails | 2026-01-25 |
| Sliding window rate limiter | 10 req/10s for Google Trends, prevents thundering herd | 2026-01-25 |
| Vercel cron at 5am UTC | Daily trend fetching, Hobby plan runs within hour | 2026-01-25 |
| proxy.ts over middleware.ts | Next.js 16 deprecation, clearer network boundary | 2026-01-24 |
| gen_random_uuid() over uuid-ossp | Built-in to modern Postgres, no extension needed | 2026-01-22 |
| RLS enabled on all tables upfront | Security-first approach, prevent public writes | 2026-01-22 |
| JSONB for external_links/data_snapshot | Flexible schema for varying data sources | 2026-01-22 |
| CASCADE delete on foreign keys | Automatic cleanup, referential integrity | 2026-01-22 |
| Inter font for typography | Cleaner, more professional for fashion content | 2026-01-22 |
| Light mode only (no dark mode) | Cleaner, more fashion-forward feel | 2026-01-22 |
| Minimal header navigation | Lets content take full focus per CONTEXT.md | 2026-01-22 |
| Next.js 14 + Vercel | Native integration, serverless | 2026-01-21 |
| D3.js for visualization | Only option for force-directed bubbles | 2026-01-21 |
| Supabase for database | Generous free tier, Postgres | 2026-01-21 |
| pytrends for Google Trends | Free, with SerpApi fallback | 2026-01-21 |
| Skip Pinterest for v1 | API access issues, revisit later | 2026-01-21 |
| Amazon-first affiliate | Largest catalog, extensible | 2026-01-21 |

## Deployment

**Production URL:** https://fashion-trend-mapper-nr0csaveq-taavi-rusos-projects.vercel.app/

## Pending Todos

(None yet)

## Blockers / Concerns

- **CRON_SECRET environment variable required** - Generate with `openssl rand -hex 32` and add to Vercel dashboard before deployment
- **Upstash Redis credentials required** - Cache/rate-limiter need UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
- **Database migrations 002, 003, and 004 applied** - All migrations executed in Supabase (trends junction, current_score, write policies)
- **SerpApi integration complete** - Replaced google-trends-api with SerpApi (100 free searches/month, ~30 needed)
- Amazon Associates requires existing site traffic for approval — apply early
- Vercel Hobby cron runs anywhere in hour (not exact time) - acceptable for daily trends

## Session Continuity

Last session: 2026-01-27
Stopped at: Completed 03-02-PLAN.md (Bubble Chart Components)
Resume file: None
Next action: Wave 2 in progress - 03-03 (Filter Controls) executing in parallel

---
*Last updated: 2026-01-27*
