# Phase 1: Foundation - Research

**Researched:** 2026-01-22
**Domain:** Next.js 14 App Router, Supabase PostgreSQL, Vercel deployment
**Confidence:** HIGH

## Summary

Phase 1 establishes the full-stack foundation using Next.js 14 with App Router, Supabase for PostgreSQL database, and Vercel for deployment. The research confirms this is a well-established, production-ready stack with native integrations between all components.

Next.js 14 App Router uses file-system routing with special files (page.tsx, layout.tsx) and supports flexible project organization. Supabase provides PostgreSQL with automatic REST/GraphQL APIs and handles server-side auth through cookie-based sessions. Vercel offers zero-configuration deployment with automatic preview environments for all Git branches.

The stack is particularly well-suited for this project because Vercel (creator of Next.js) provides first-class Next.js support, Supabase auto-detects many-to-many relationships for trend categorization, and both platforms handle environment variables across multiple deployment environments natively.

**Primary recommendation:** Use `create-next-app@latest` with recommended defaults, structure the project with `/app` for routes and `/lib` for utilities, implement Supabase with separate client utilities for server vs browser contexts, and leverage Vercel's automatic Git-based deployments.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 14.x | React framework with App Router | Industry standard, Vercel native integration, built-in SSR/SSG |
| TypeScript | Latest | Type safety | Next.js first-class support, recommended default |
| Tailwind CSS | Latest | Utility-first styling | Included in Next.js defaults, rapid UI development |
| Supabase | Latest | PostgreSQL database + auth | Automatic APIs, real-time subscriptions, managed hosting |
| @supabase/supabase-js | Latest | Supabase JavaScript client | Official client library |
| @supabase/ssr | Latest | Server-side rendering support | Cookie-based auth for Next.js Server Components |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pg_cron | Built-in | PostgreSQL job scheduler | Data retention policies (90-day cleanup, monthly aggregation) |
| TimescaleDB | Optional | Time-series optimization | If trend history queries become slow (deprecated in PG 17) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase | Prisma + PostgreSQL | More control, requires manual auth/API setup, no real-time by default |
| Tailwind CSS | CSS Modules | More control, slower development, no utility classes |
| App Router | Pages Router | Older, stable, simpler mental model but misses Server Components benefits |

**Installation:**
```bash
# Recommended: Use Next.js defaults
npx create-next-app@latest

# Prompts:
# - Use recommended defaults? → Yes (includes TypeScript, Tailwind, App Router)
# - Or customize: TypeScript? → Yes, Tailwind? → Yes, App Router? → Yes, src/ directory? → (discretion)

# Add Supabase
npm install @supabase/supabase-js @supabase/ssr
```

## Architecture Patterns

### Recommended Project Structure
```
project-root/
├── app/                    # Next.js App Router (routes only)
│   ├── layout.tsx          # Root layout (header, footer)
│   ├── page.tsx            # Home page (/)
│   ├── archive/
│   │   └── page.tsx        # Archive page (/archive)
│   └── admin/
│       └── page.tsx        # Admin page (/admin)
├── components/             # Shared React components
│   ├── ui/                 # Generic UI components
│   └── features/           # Feature-specific components (e.g., TrendBubble)
├── lib/                    # Utilities, helpers, configurations
│   ├── supabase/
│   │   ├── client.ts       # Browser client (Client Components)
│   │   ├── server.ts       # Server client (Server Components, Actions)
│   │   └── middleware.ts   # Auth token refresh
│   └── utils.ts            # Helper functions
├── types/                  # TypeScript type definitions
│   └── database.ts         # Supabase schema types
├── public/                 # Static assets (images, fonts)
├── middleware.ts           # Next.js middleware (auth refresh)
├── .env.local              # Local environment variables (gitignored)
└── next.config.ts          # Next.js configuration
```

**Source:** [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)

**Key principle:** Next.js is unopinionated about organization. The `/app` directory is for routing only; components and utilities can live anywhere. Choose one strategy and stay consistent.

### Pattern 1: Supabase Client Setup (Server vs Browser)

**What:** Create separate Supabase clients for server and browser contexts because Server Components can't write cookies.

**When to use:** Always - required for cookie-based auth in Next.js App Router.

**Example:**

```typescript
// lib/supabase/client.ts (Browser - Client Components)
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

```typescript
// lib/supabase/server.ts (Server - Server Components, Actions, Route Handlers)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component context - can't write cookies, middleware handles this
          }
        },
      },
    }
  )
}
```

```typescript
// middleware.ts (Root - handles auth token refresh)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Source:** [Supabase Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)

### Pattern 2: Database Schema for Multi-Category Trends

**What:** Use junction table for many-to-many relationship between trends and categories.

**When to use:** When entities need multiple classifications (trends can have multiple categories).

**Example:**

```sql
-- Core entities
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  thumbnail_url TEXT,
  external_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Junction table (many-to-many)
CREATE TABLE trend_categories (
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (trend_id, category_id)
);

-- Indexes for performance
CREATE INDEX idx_trend_categories_trend ON trend_categories(trend_id);
CREATE INDEX idx_trend_categories_category ON trend_categories(category_id);
```

**Querying with Supabase (auto-detects junction table):**

```typescript
// Fetch trends with their categories
const { data: trends } = await supabase
  .from('trends')
  .select(`
    *,
    categories ( id, name, slug )
  `)
```

**Source:** [Supabase Joins and Nesting](https://supabase.com/docs/guides/database/joins-and-nesting)

### Pattern 3: Time-Series History with Retention Policy

**What:** Store daily snapshots with automated cleanup after 90 days and monthly aggregation.

**When to use:** For trend history tracking with retention requirements.

**Example:**

```sql
-- Daily history snapshots
CREATE TABLE trend_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  data_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trend_id, snapshot_date)
);

-- Monthly aggregates
CREATE TABLE trend_history_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trend_id, year, month)
);

-- Automated cleanup using pg_cron
-- (Run daily at 2 AM to aggregate and delete old records)
SELECT cron.schedule(
  'aggregate-trend-history',
  '0 2 * * *',
  $$
  -- Aggregate records older than 90 days into monthly
  INSERT INTO trend_history_monthly (trend_id, year, month, total_views, total_clicks)
  SELECT
    trend_id,
    EXTRACT(YEAR FROM snapshot_date)::INTEGER,
    EXTRACT(MONTH FROM snapshot_date)::INTEGER,
    SUM(view_count),
    SUM(click_count)
  FROM trend_history
  WHERE snapshot_date < CURRENT_DATE - INTERVAL '90 days'
  GROUP BY trend_id, EXTRACT(YEAR FROM snapshot_date), EXTRACT(MONTH FROM snapshot_date)
  ON CONFLICT (trend_id, year, month) DO UPDATE
  SET
    total_views = trend_history_monthly.total_views + EXCLUDED.total_views,
    total_clicks = trend_history_monthly.total_clicks + EXCLUDED.total_clicks;

  -- Delete aggregated records
  DELETE FROM trend_history WHERE snapshot_date < CURRENT_DATE - INTERVAL '90 days';
  $$
);
```

**Source:** [Supabase Data Retention Policies](https://bootstrapped.app/guide/how-to-implement-data-retention-policies-in-supabase)

### Pattern 4: Environment-Specific Configuration

**What:** Use Vercel's environment variable system for Production, Preview, and Development.

**When to use:** Always - required for Supabase connection and future API keys.

**Example:**

```bash
# .env.local (local development only - gitignored)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbG...

# Vercel Dashboard → Project Settings → Environment Variables
# Set for each environment: Production, Preview, Development
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

**Critical rules:**
- `NEXT_PUBLIC_*` prefix → available to browser (frozen at build time)
- No prefix → server-side only
- Redeploy after adding/changing variables
- Preview environment inherits from Production unless overridden
- Use `vercel env pull` to sync Development variables locally

**Source:** [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

### Anti-Patterns to Avoid

- **Calling your own API routes from Server Components:** Don't make HTTP requests to `/api/*` from `getServerSideProps` or Server Components - call database/utility functions directly
- **Trusting `getSession()` in Server Components:** Always use `getUser()` to validate auth tokens (sends request to Supabase Auth server every time)
- **Single utils.ts file:** Don't let utility files grow beyond 200 lines - organize into `/lib/` subdirectories by domain
- **Deep component nesting:** Avoid paths like `components/features/dashboard/widgets/weather/current/small/index.tsx` - 2-3 levels max
- **Mixing server and client contexts:** Don't import server-only utilities (like server Supabase client) into Client Components

**Source:** [Common Next.js App Router Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Database API layer | Custom REST endpoints | Supabase auto-generated APIs | Auto-updates with schema changes, includes auth, real-time subscriptions |
| Authentication | Custom JWT handling | Supabase Auth with cookies | Cookie rotation, session refresh, security best practices built-in |
| Cookie management in Server Components | Custom cookie utilities | `@supabase/ssr` package | Framework-agnostic, handles Server Component constraints (can't write cookies) |
| Time-series data retention | Manual cleanup scripts | `pg_cron` extension | Built into Supabase, reliable scheduling, SQL-based |
| Environment variable validation | Runtime checks | TypeScript + `process.env` assertions | Type safety at build time, fails fast |
| API route creation | Manual Express-like routes | Next.js `route.ts` files | Automatic serverless functions, edge runtime support |

**Key insight:** Next.js + Supabase + Vercel is a fully integrated stack. Each component expects the others and provides utilities specifically for the integration. Custom solutions break this integration and lose automatic features like preview deployments, auth token refresh, and database type generation.

## Common Pitfalls

### Pitfall 1: Environment Variable Timing Issues

**What goes wrong:** Adding environment variables in Vercel dashboard but deployment still shows `undefined` values.

**Why it happens:** Environment variables are baked into deployments at build time (for `NEXT_PUBLIC_*` vars). Adding variables after deployment doesn't update existing deployments.

**How to avoid:**
- Add environment variables BEFORE first deployment
- Trigger a redeploy after adding/changing any variables
- For local development, run `vercel env pull` to sync Development variables to `.env.local`

**Warning signs:**
- Supabase client initialization errors
- "Cannot read property of undefined" in server logs
- Different behavior between local and deployed versions

**Source:** [Vercel Environment Variables Docs](https://vercel.com/docs/environment-variables)

### Pitfall 2: Server Component Cookie Writing

**What goes wrong:** Auth tokens don't refresh, users get logged out randomly, or hydration errors occur.

**Why it happens:** Next.js Server Components are read-only for cookies - they can't write. Attempting to write cookies from Server Components fails silently or crashes.

**How to avoid:**
- Use the `@supabase/ssr` pattern with try/catch in `setAll()`
- Implement middleware to handle token refresh (middleware CAN write cookies)
- Always call `supabase.auth.getUser()` (not `getSession()`) in Server Components

**Warning signs:**
- Users randomly logged out after page navigation
- Auth state works on first load but breaks on client-side navigation
- Error logs mentioning "cannot set cookie"

**Source:** [Supabase SSR Setup Guide](https://medium.com/@zeyd.ajraou/the-easiest-way-to-setup-supabase-ssr-in-next-js-14-c590f163773d)

### Pitfall 3: Junction Table Query Confusion

**What goes wrong:** Attempting to select columns from junction table directly or manually joining through junction table.

**Why it happens:** Developers expect to reference junction table explicitly in queries, but Supabase auto-detects many-to-many relationships.

**How to avoid:**
- Let Supabase auto-detect the junction table through foreign keys
- Query directly from parent to child: `trends.select('*, categories(*)')`
- Don't try to select junction table columns (pending PostgREST feature)

**Warning signs:**
- Complex manual joins in queries
- Errors about "table not found" when referencing junction table
- Duplicated data in query results

**Source:** [Supabase Junction Table Discussion](https://github.com/orgs/supabase/discussions/2990)

### Pitfall 4: File Organization Paralysis

**What goes wrong:** Spending excessive time debating folder structure, reorganizing files multiple times, or creating overly complex directory hierarchies.

**Why it happens:** Next.js is unopinionated about organization, offering multiple valid strategies. Teams overthink the decision.

**How to avoid:**
- Choose ONE strategy early (recommended: `/app` for routes, `/components` and `/lib` at root)
- Stay consistent - don't mix strategies
- Start simple, refactor only when pain points emerge (200+ files in one folder, deep nesting)
- Remember: colocation is allowed - components can live in `/app` route folders

**Warning signs:**
- Multiple reorganization PRs in first week
- File paths more than 4 levels deep
- Team debates about "where should this go" for every file

**Source:** [Next.js Project Structure Best Practices](https://www.codebydeep.com/blog/next-js-folder-structure-best-practices-for-scalable-applications-2026-guide)

### Pitfall 5: Build-Time vs Runtime Confusion

**What goes wrong:** Expecting `NEXT_PUBLIC_*` variables to update at runtime or trying to change them in different deployments without rebuilding.

**Why it happens:** Next.js bundles `NEXT_PUBLIC_*` variables into the client JavaScript at build time - they're constants, not runtime values.

**How to avoid:**
- Understand: `NEXT_PUBLIC_*` = build-time constants for browser access
- For runtime values, create API routes that read server-side environment variables
- Use Vercel Edge Config for true runtime configuration
- Avoid: Expecting environment-specific values in client code without rebuilding

**Warning signs:**
- Same `NEXT_PUBLIC_*` value in Production and Preview despite different settings
- Client-side code showing old values after variable update
- Heroku pipeline-style "promote builds across environments" not working

**Source:** [Next.js Environment Variables Guide](https://nextjs.org/docs/pages/guides/environment-variables)

## Code Examples

Verified patterns from official sources:

### Fetching Data in Server Components

```typescript
// app/page.tsx - Home page with trends (Server Component)
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  // Direct database query in Server Component
  const { data: trends, error } = await supabase
    .from('trends')
    .select(`
      *,
      categories ( id, name, slug )
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching trends:', error)
    return <div>Error loading trends</div>
  }

  return (
    <main>
      <h1>Fashion Trends</h1>
      {trends.map(trend => (
        <TrendBubble key={trend.id} trend={trend} />
      ))}
    </main>
  )
}
```

**Source:** [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

### Basic Route Layout Structure

```typescript
// app/layout.tsx - Root layout
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Fashion Trend Mapper',
  description: 'Interactive visualization of current fashion trends',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b">
          <nav className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-6">
              <a href="/" className="font-bold">Fashion Trend Mapper</a>
              <a href="/">Home</a>
              <a href="/archive">Archive</a>
              <a href="/admin">Admin</a>
            </div>
          </nav>
        </header>

        {children}

        <footer className="border-t mt-8">
          <div className="container mx-auto px-4 py-6 text-sm text-gray-600">
            <p>&copy; 2026 Fashion Trend Mapper</p>
            <p>Affiliate Disclosure: We may earn commissions from featured products.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
```

**Source:** [Next.js App Router Documentation](https://nextjs.org/docs/app)

### Database Schema Migration

```sql
-- migrations/001_initial_schema.sql
-- Tables for Phase 1: Foundation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trends table
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  thumbnail_url TEXT,
  external_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Junction table for many-to-many
CREATE TABLE trend_categories (
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (trend_id, category_id)
);

-- Trend sources (for tracking where data comes from)
CREATE TABLE trend_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Affiliate products
CREATE TABLE affiliate_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  affiliate_link TEXT NOT NULL,
  price_range TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trend history (daily snapshots)
CREATE TABLE trend_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  data_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trend_id, snapshot_date)
);

-- Trend history monthly aggregates
CREATE TABLE trend_history_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trend_id, year, month)
);

-- Admin configuration
CREATE TABLE admin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_trends_created_at ON trends(created_at DESC);
CREATE INDEX idx_trend_categories_trend ON trend_categories(trend_id);
CREATE INDEX idx_trend_categories_category ON trend_categories(category_id);
CREATE INDEX idx_affiliate_products_trend ON affiliate_products(trend_id);
CREATE INDEX idx_trend_history_trend_date ON trend_history(trend_id, snapshot_date DESC);
CREATE INDEX idx_trend_history_monthly_trend ON trend_history_monthly(trend_id, year DESC, month DESC);

-- Row Level Security (RLS) policies
-- (Enable RLS in later phases when auth is added)
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_history_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- Public read access for now (restrict in later phases)
CREATE POLICY "Allow public read on trends" ON trends FOR SELECT USING (true);
CREATE POLICY "Allow public read on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read on trend_categories" ON trend_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read on affiliate_products" ON affiliate_products FOR SELECT USING (true);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router | App Router | Next.js 13 (2022), stable in 14 | Server Components by default, nested layouts, streaming |
| getServerSideProps | Direct async components | Next.js 13 | Cleaner code, no wrapper functions, better TypeScript |
| API routes for all data | Server Components + Server Actions | Next.js 13 | Fewer HTTP requests, colocation of data fetching |
| Supabase anon key | Publishable key (`sb_publishable_*`) | 2025 | Improved security, clearer naming |
| Manual cookie handling | @supabase/ssr package | 2024 | Framework-agnostic SSR, handles Server Component constraints |
| .env files only | Vercel environment tiers | Always | Per-environment configs (Production/Preview/Development) |
| TimescaleDB for time-series | pg_cron + standard tables | 2025 (PG 17) | TimescaleDB deprecated in Supabase PG 17, use pg_cron instead |

**Deprecated/outdated:**
- **Pages Router:** Still supported but not recommended for new projects - App Router is the future
- **getStaticProps/getServerSideProps:** Replaced by async Server Components and fetch caching
- **TimescaleDB in Supabase:** Deprecated in Postgres 17 instances - use pg_cron + standard tables for retention
- **Supabase anon keys:** Legacy format - use publishable keys (`sb_publishable_*`) for new projects

## Open Questions

Things that couldn't be fully resolved:

1. **Project structure: src/ directory or not?**
   - What we know: Next.js allows optional `/src` directory to separate app code from config files
   - What's unclear: User preference for `/src/app` vs `/app` at root
   - Recommendation: Ask user during implementation or default to no `/src` (simpler for small projects)

2. **Category storage: Predefined enum vs free text**
   - What we know: Junction table supports both approaches - categories can be pre-seeded or user-generated
   - What's unclear: Whether categories should be admin-controlled (seeded) or auto-created from scraped data
   - Recommendation: Start with admin-controlled (Phase 5), allows curation and prevents category explosion

3. **TypeScript database types: Manual or generated?**
   - What we know: Supabase can auto-generate TypeScript types from schema using `supabase gen types typescript`
   - What's unclear: Whether to commit generated types or generate on-demand
   - Recommendation: Commit generated types to `/types/database.ts`, regenerate when schema changes (Phase 2)

4. **Git branch strategy for Vercel previews**
   - What we know: Vercel creates preview deployments for all non-production branches automatically
   - What's unclear: User preference for `main` only vs feature branch workflow
   - Recommendation: Start with `main` branch only, add feature branches when team grows (marked as Claude's discretion)

## Sources

### Primary (HIGH confidence)
- [Next.js App Router Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) - Official docs
- [Next.js Installation Guide](https://nextjs.org/docs/app/getting-started/installation) - Official docs
- [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) - Official docs
- [Supabase Server-Side Auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client) - Official docs
- [Supabase Joins and Nesting](https://supabase.com/docs/guides/database/joins-and-nesting) - Official docs
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables) - Official docs
- [Next.js Environment Variables](https://nextjs.org/docs/pages/guides/environment-variables) - Official docs
- [Vercel Next.js Framework](https://vercel.com/docs/frameworks/full-stack/nextjs) - Official docs

### Secondary (MEDIUM confidence)
- [Common Next.js App Router Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) - Vercel blog (official)
- [Next.js Folder Structure Best Practices 2026](https://www.codebydeep.com/blog/next-js-folder-structure-best-practices-for-scalable-applications-2026-guide) - Community, recent
- [Best Practices for Organizing Next.js 15](https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji) - Community, verified patterns
- [Supabase SSR Setup Guide](https://medium.com/@zeyd.ajraou/the-easiest-way-to-setup-supabase-ssr-in-next-js-14-c590f163773d) - Community, Jan 2026
- [Supabase Data Retention Policies](https://bootstrapped.app/guide/how-to-implement-data-retention-policies-in-supabase) - Community guide
- [PostgreSQL Naming Conventions](https://www.geeksforgeeks.org/postgresql/postgresql-naming-conventions/) - Database best practices
- [Many-to-Many Database Relationships](https://www.beekeeperstudio.io/blog/many-to-many-database-relationships-complete-guide) - Database patterns

### Tertiary (LOW confidence)
- [Supabase Junction Table Discussion](https://github.com/orgs/supabase/discussions/2990) - GitHub discussion, unresolved feature request
- [Next.js App Router Migration](https://www.flightcontrol.dev/blog/nextjs-app-router-migration-the-good-bad-and-ugly) - Community experience, mixed opinions

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - All official documentation, stable versions, production-ready
- Architecture: **HIGH** - Official Next.js patterns, verified Supabase patterns, multiple sources align
- Pitfalls: **MEDIUM-HIGH** - Vercel blog + community consensus, some from experience reports
- Database schema: **HIGH** - PostgreSQL best practices, Supabase auto-detection verified in docs
- Deployment: **HIGH** - Vercel official docs, Next.js creator's platform

**Research date:** 2026-01-22
**Valid until:** 2026-03-22 (60 days - stable stack, slow-moving major versions)

**Notes:**
- Next.js 15 exists but 14 is specified in requirements - research focused on 14.x
- All patterns verified with official documentation where available
- WebSearch findings cross-referenced with official sources before inclusion
- TimescaleDB deprecation noted - pg_cron recommended for retention policies
