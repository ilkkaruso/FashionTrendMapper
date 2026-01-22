---
path: /home/lesh/source/FashionTrendMapper/lib/supabase/client.ts
type: util
updated: 2026-01-22
status: active
---

# client.ts

## Purpose

Creates a Supabase browser client for client-side database operations. This is the primary way to interact with Supabase from React components in the browser.

## Exports

- `createClient()` - Factory function that returns a configured Supabase browser client using environment variables for URL and publishable key

## Dependencies

- `@supabase/ssr` - Supabase SSR package for creating browser-compatible clients

## Used By

TBD

## Notes

- Uses non-null assertions (`!`) on environment variables - requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to be set
- Browser client only - for server-side operations, use a separate server client