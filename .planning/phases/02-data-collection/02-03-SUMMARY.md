---
phase: 02-data-collection
plan: 03
subsystem: database
tags: [normalization, min-max, supabase, postgresql, repository, history-tracking]

# Dependency graph
requires:
  - phase: 02-01-infrastructure
    provides: RawTrend and NormalizedTrend types from lib/fetchers/types.ts
  - phase: 02-02-google-trends
    provides: Google Trends fetcher returning RawTrend[] with traffic strings
  - phase: 01-02-database
    provides: Supabase database with trends, trend_history tables
provides:
  - Score normalizer (min-max normalization) scaling 0-100
  - Trend repository with saveTrendsWithHistory() for persistence
  - Daily snapshot tracking in trend_history table
  - Change percentage calculation (today vs yesterday)
affects: [02-04-aggregation, 03-visualization, 04-affiliate-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [Min-max normalization, Repository pattern, Historical snapshot tracking, Change calculation]

key-files:
  created:
    - lib/normalizers/score-normalizer.ts
    - lib/database/trend-repository.ts
    - migrations/002_trend_sources_junction.sql
    - migrations/003_add_current_score.sql
  modified: []

key-decisions:
  - "Min-max normalization scales scores to 0-100 based on batch range (not absolute)"
  - "All equal scores → 50 (middle value) to avoid division by zero"
  - "Round normalized scores to 2 decimals for precision without noise"
  - "Change percentage = 0 for new trends (no yesterday snapshot)"
  - "If yesterday score = 0, cap change at +100% (not +infinity)"
  - "Traffic string parsing: 50K+ → 50000, 1M+ → 1000000"

patterns-established:
  - "Repository pattern: Database operations encapsulated in repository functions"
  - "Upsert by unique constraint (title) to prevent duplicates"
  - "JSONB data_snapshot for flexible historical data storage"
  - "Separate tables for trends, sources (junction), and history (snapshots)"
  - "Error handling: Log errors, continue processing, throw if all fail"

# Metrics
duration: 5min
completed: 2026-01-25
---

# Phase 02 Plan 03: Score Normalization and Persistence Summary

**Min-max score normalizer (0-100 scale) and trend repository with daily snapshot tracking for change calculations**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-25T08:41:19Z
- **Completed:** 2026-01-25T08:46:22Z
- **Tasks:** 2 (both auto)
- **Files modified:** 6 (2 code files, 2 migrations, 2 schema fixes)

## Accomplishments

- Score normalizer parses traffic strings ("50K+") and scales to 0-100 via min-max normalization
- Trend repository persists trends with source tracking and daily history snapshots
- Change calculation compares today vs yesterday scores from history table
- Schema fixes: trend_sources as junction table, current_score column added

## Task Commits

Each task was committed atomically:

1. **Task 1: Create score normalizer** - `55b1387` (feat)
   - Created lib/normalizers/score-normalizer.ts with normalizeScores() function
   - Parses traffic strings (50K+, 1M+) to numeric values
   - Applies min-max normalization to scale 0-100
   - Handles edge cases: all equal → 50, empty array → []
   - Rounds to 2 decimal places

2. **Task 2: Create trend repository** - `2b46cf8` (feat)
   - Created lib/database/trend-repository.ts with saveTrendsWithHistory() and getTrendsWithChange()
   - Upserts trends by title (no duplicates)
   - Saves source scores to trend_sources junction table
   - Creates daily snapshots in trend_history table
   - Calculates change percentage from yesterday's snapshot
   - Handles errors gracefully with logging

**Schema fixes:**
- `422af7f` (fix) - trend_sources junction table migration
- `91166e8` (fix) - current_score column migration

**Plan metadata:** *(not yet committed - final docs commit pending)*

## Files Created/Modified

**Created:**
- `lib/normalizers/score-normalizer.ts` - Score normalization utilities
  - `parseTraffic()` - Parse "50K+", "1M+" to numeric values
  - `minMaxNormalize()` - Scale array to 0-100 range
  - `normalizeScores()` - Main export: RawTrend[] → NormalizedTrend[]

- `lib/database/trend-repository.ts` - Database operations for trends
  - `saveTrendsWithHistory()` - Upsert trends + sources + daily snapshot
  - `getTrendsWithChange()` - Fetch trends with change% from yesterday

- `migrations/002_trend_sources_junction.sql` - Fix trend_sources schema
  - Recreate as junction table with trend_id, source_name, source_score
  - Add UNIQUE constraint on (trend_id, source_name)
  - Indexes for efficient trend and source lookups

- `migrations/003_add_current_score.sql` - Add current_score to trends
  - NUMERIC(5,2) column for normalized scores (0-100)
  - Descending index for score-based sorting

**Modified:**
- None (all new files)

## Decisions Made

1. **Min-max normalization scales scores relative to batch, not absolute**
   - Rationale: Google Trends scores vary widely ("50K+" vs "200+") - min-max ensures fair comparison within each batch
   - Impact: Highest trend = 100, lowest = 0, rest proportional

2. **All equal scores → 50 (middle value)**
   - Rationale: Avoid division by zero when max = min; 50 represents "average" when all trends equal
   - Edge case handling for single-source batches

3. **Round to 2 decimals for precision**
   - Rationale: Balance between precision (not just integers) and noise reduction (not 10 decimals)
   - Display-friendly for UI

4. **Change percentage = 0 for new trends**
   - Rationale: No yesterday snapshot = new trend, not "infinite change"
   - Clear distinction from trending-up vs brand new

5. **Cap change at +100% when yesterday = 0**
   - Rationale: If yesterday was 0, today's positive score is technically +infinity, but display as +100% for UI consistency
   - Prevents "Infinity%" in visualization

6. **Traffic string parsing supports K and M suffixes**
   - Rationale: Google Trends uses "50K+", "1M+" format - parse to integers for normalization
   - Also handles plain numbers for flexibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] trend_sources schema mismatch**
- **Found during:** Task 2 (trend repository implementation)
- **Issue:** Original schema had trend_sources as simple name/url registry, but plan expects junction table with per-trend, per-source scores
- **Fix:** Created migration 002 to drop and recreate trend_sources as junction table with trend_id, source_name, source_score, fetched_at columns
- **Files modified:** migrations/002_trend_sources_junction.sql
- **Verification:** TypeScript compilation passes with new schema
- **Committed in:** 422af7f (separate fix commit)

**2. [Rule 2 - Missing Critical] current_score column missing**
- **Found during:** Task 2 (trend repository implementation)
- **Issue:** trends table had no current_score column, but saveTrendsWithHistory() needs to save normalized scores
- **Fix:** Created migration 003 to add NUMERIC(5,2) current_score column with descending index
- **Files modified:** migrations/003_add_current_score.sql
- **Verification:** TypeScript compilation passes, upsert logic references current_score
- **Committed in:** 91166e8 (separate fix commit)

---

**Total deviations:** 2 auto-fixed (both Rule 2 - missing critical functionality)
**Impact on plan:** Both schema fixes essential for data persistence. Original 001_initial_schema.sql was incomplete for Phase 2 requirements. No scope creep - fixes enable planned functionality.

## Issues Encountered

None during code implementation. TypeScript compilation passed on first try after schema fixes.

## User Setup Required

**Database migrations require manual execution:**

The following migrations were created but need to be run in Supabase SQL Editor:

1. **migrations/002_trend_sources_junction.sql**
   - Purpose: Transform trend_sources to junction table
   - Action: Copy file contents → Supabase Dashboard → SQL Editor → Run

2. **migrations/003_add_current_score.sql**
   - Purpose: Add current_score column to trends table
   - Action: Copy file contents → Supabase Dashboard → SQL Editor → Run

**Verification:**
```sql
-- Check trend_sources schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'trend_sources';

-- Should show: trend_id, source_name, source_score, source_url, fetched_at

-- Check current_score column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'trends' AND column_name = 'current_score';

-- Should show: current_score, numeric
```

## Authentication Gates

None - no external service authentication required during execution.

## Next Phase Readiness

**Ready for next phase:**
- Score normalization complete - can convert any traffic strings to 0-100 scale
- Trend repository ready - can save and retrieve trends with history
- Change calculation implemented - daily snapshots enable trending indicators
- Schema updated - migrations ready to apply in Supabase

**Prerequisites for next phase (02-04 aggregation):**
- Migrations 002 and 003 must be applied to Supabase database
- Upstash Redis credentials still needed (from 02-01 blocker)

**No blockers** for code development - aggregation layer can be built and tested locally with TypeScript. Database operations will work once migrations applied.

---
*Phase: 02-data-collection*
*Completed: 2026-01-25*
