# Architecture Research

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Next.js App                            │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │   │
│  │  │   Pages    │  │    API     │  │   Cron Endpoint    │  │   │
│  │  │            │  │   Routes   │  │   /api/refresh     │  │   │
│  │  │ - Home     │  │            │  │                    │  │   │
│  │  │ - Archive  │  │ - trends   │  │   Daily @ 5am UTC  │  │   │
│  │  │ - Admin    │  │ - products │  │                    │  │   │
│  │  └────────────┘  └────────────┘  └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Vercel KV (Cache)                      │   │
│  │            API responses, product data cache              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Postgres                             │   │
│  │  - trends (current + historical)                          │   │
│  │  - trend_sources (per-source data)                        │   │
│  │  - affiliate_products (cached Amazon products)            │   │
│  │  - admin_config (thresholds, settings)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL APIS                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Google    │  │   Reddit    │  │        Amazon           │  │
│  │   Trends    │  │    API      │  │        PA-API           │  │
│  │  (pytrends) │  │   (PRAW)    │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### Data Collection Layer

**Purpose:** Fetch raw trend data from external sources

| Component | Tech | Responsibility |
|-----------|------|----------------|
| Google Trends Fetcher | pytrends (Python) or Node equivalent | Fetch trending fashion searches |
| Reddit Fetcher | Reddit API (Node) | Scrape fashion subreddits for trending topics |
| Pinterest Fetcher | TBD (v2) | Fetch visual trends |

**Key decisions:**
- Run fetchers as serverless functions triggered by cron
- Each fetcher writes to `trend_sources` table with source identifier
- Normalize data format across all sources

### Processing/Scoring Layer

**Purpose:** Aggregate and score trends across sources

**Scoring algorithm:**
```
score = (google_weight * google_score) +
        (reddit_weight * reddit_score) +
        (pinterest_weight * pinterest_score)

Where:
- google_weight = 0.5 (most representative of mainstream)
- reddit_weight = 0.4 (good signal for emerging trends)
- pinterest_weight = 0.1 (v2)

Normalization:
- Each source score normalized to 0-100
- Combined score normalized to 0-100
```

**Change calculation:**
```
change_percent = ((today_score - yesterday_score) / yesterday_score) * 100
```

### Storage Layer

**Database schema:**

```sql
-- Core trends table
CREATE TABLE trends (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT, -- clothing, style, brand, color
  score DECIMAL NOT NULL,
  previous_score DECIMAL,
  change_percent DECIMAL,
  is_top_10 BOOLEAN DEFAULT false,
  first_seen DATE NOT NULL,
  last_seen DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-source raw data
CREATE TABLE trend_sources (
  id UUID PRIMARY KEY,
  trend_id UUID REFERENCES trends(id),
  source TEXT NOT NULL, -- 'google', 'reddit', 'pinterest'
  raw_score DECIMAL NOT NULL,
  normalized_score DECIMAL NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL,
  metadata JSONB -- source-specific data
);

-- Cached affiliate products
CREATE TABLE affiliate_products (
  id UUID PRIMARY KEY,
  trend_id UUID REFERENCES trends(id),
  asin TEXT NOT NULL, -- Amazon product ID
  title TEXT NOT NULL,
  price DECIMAL,
  image_url TEXT,
  affiliate_url TEXT NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL -- cache expiry
);

-- Admin configuration
CREATE TABLE admin_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historical snapshots for archive
CREATE TABLE trend_history (
  id UUID PRIMARY KEY,
  trend_id UUID REFERENCES trends(id),
  score DECIMAL NOT NULL,
  rank INTEGER,
  snapshot_date DATE NOT NULL,
  UNIQUE(trend_id, snapshot_date)
);
```

### Presentation Layer

**Pages:**

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Bubble visualization of current trends |
| Archive | `/archive` | Past trends with preserved affiliate links |
| Admin | `/admin` | Dashboard for configuration |

**API Routes:**

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/trends` | GET | Current trends for visualization |
| `/api/trends/[slug]` | GET | Single trend details + products |
| `/api/archive` | GET | Historical trends (paginated) |
| `/api/refresh` | POST | Cron endpoint - trigger data refresh |
| `/api/admin/config` | GET/PUT | Admin configuration |

### Admin Layer

**Features:**
- View current trends and scores
- Configure scoring weights
- Set top N threshold (default: 10)
- View fetch logs and errors
- Manual refresh trigger

**Auth:**
- Simple password-based auth
- Store hashed password in environment variable
- JWT session token

## Data Flow

### Daily Refresh Flow

```
1. Cron triggers /api/refresh at 5am UTC
                    │
                    ▼
2. Fetch from each source (parallel)
   - Google Trends: fashion keywords
   - Reddit: hot posts from fashion subreddits
                    │
                    ▼
3. Normalize scores (0-100 per source)
                    │
                    ▼
4. Aggregate into combined score
                    │
                    ▼
5. Update trends table
   - New trends: insert
   - Existing: update score, calculate change
   - Archive: move from yesterday's top 10 to history
                    │
                    ▼
6. Determine new top 10
                    │
                    ▼
7. For new top 10 entries without products:
   - Fetch Amazon products via PA-API
   - Cache results
                    │
                    ▼
8. Done. Frontend serves fresh data.
```

### User Request Flow

```
User visits /
      │
      ▼
Next.js fetches /api/trends
      │
      ▼
API checks Vercel KV cache
      │
      ├── Cache hit → Return cached data
      │
      └── Cache miss → Query Supabase
                │
                ▼
          Return trends + cache for 5 min
      │
      ▼
D3.js renders bubble visualization
      │
      ▼
User clicks bubble
      │
      ▼
Modal loads /api/trends/[slug]
      │
      ▼
Display trend details + affiliate products
```

## Build Order

**Phase 1: Foundation**
1. Next.js project setup with TypeScript
2. Supabase database + schema
3. Basic page structure (home, archive, admin)

**Phase 2: Data Collection**
4. Google Trends fetcher
5. Reddit fetcher
6. Scoring/aggregation logic
7. Cron job setup

**Phase 3: Visualization**
8. D3.js bubble visualization
9. Trend modal component
10. Mobile responsiveness

**Phase 4: Affiliate**
11. Amazon PA-API integration
12. Top 10 product fetching
13. Affiliate link generation

**Phase 5: Admin & Polish**
14. Admin dashboard
15. Auth for admin
16. Archive page
17. Error handling, logging

## Serverless Considerations

**Vercel-specific patterns:**

| Consideration | Solution |
|---------------|----------|
| Cold starts | Use Edge Functions for API routes where possible |
| Function timeout | Free tier: 10s. Fetchers may need Pro (60s) |
| Cron limits | Free tier: 2 cron jobs. Sufficient for daily refresh |
| Environment variables | Store API keys in Vercel dashboard |
| Database connections | Use connection pooling (Supabase handles this) |

**Potential issues:**
- pytrends is Python — may need separate Python function or use Node alternative
- Long-running fetches — batch and parallelize
- Rate limits — implement backoff and caching
