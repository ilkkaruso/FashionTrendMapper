---
path: /home/lesh/source/FashionTrendMapper/middleware.ts
type: middleware
updated: 2026-01-22
status: active
---

# middleware.ts

## Purpose

Next.js middleware that handles Supabase authentication session management. It creates a server-side Supabase client for each request to refresh expired sessions and synchronize auth cookies between request and response.

## Exports

- `middleware` - Async function that processes incoming requests, creates a Supabase server client, and refreshes the user session
- `config` - Route matcher configuration that applies middleware to all routes except static assets and images

## Dependencies

- `@supabase/ssr` - createServerClient for server-side Supabase authentication
- `next/server` - NextResponse and NextRequest types for middleware handling

## Used By

TBD

## Notes

- Uses environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (non-null assertions)
- Cookie handling synchronizes between request and response objects to maintain session state
- The `getUser()` call triggers session refresh without using the returned value