---
path: /home/lesh/source/FashionTrendMapper/lib/supabase/server.ts
type: util
updated: 2026-01-22
status: active
---

# server.ts

## Purpose

Creates a Supabase client configured for server-side usage in Next.js. Handles cookie-based authentication by integrating with Next.js cookies API for session management.

## Exports

- `createClient`: Async function that returns a configured Supabase server client with cookie handling for authentication

## Dependencies

- `@supabase/ssr`: createServerClient
- `next/headers`: cookies

## Used By

TBD

## Notes

- Uses non-null assertions for environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- Cookie writing is wrapped in try/catch to handle Server Components where cookies are read-only
- Relies on middleware for token refresh when running in Server Components