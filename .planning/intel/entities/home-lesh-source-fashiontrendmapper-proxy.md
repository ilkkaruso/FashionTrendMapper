---
path: /home/lesh/source/FashionTrendMapper/proxy.ts
type: middleware
updated: 2026-01-22
status: active
---

# proxy.ts

## Purpose

Next.js middleware that handles Supabase authentication session management. It creates a server-side Supabase client to refresh expired sessions and manage authentication cookies on every matched request.

## Exports

- `default` (proxy): Async middleware function that processes requests, creates a Supabase server client, refreshes auth sessions, and manages cookies
- `config`: Next.js middleware matcher configuration that excludes static assets and images from middleware processing

## Dependencies

- `@supabase/ssr`: createServerClient for server-side Supabase client creation
- `next/server`: NextResponse and NextRequest types for middleware handling

## Used By

TBD

## Notes

- Uses non-null assertions for environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
- Cookie handling syncs between request and response objects to maintain session state
- Matcher regex excludes: _next/static, _next/image, favicon.ico, and common image formats (svg, png, jpg, jpeg, gif, webp)