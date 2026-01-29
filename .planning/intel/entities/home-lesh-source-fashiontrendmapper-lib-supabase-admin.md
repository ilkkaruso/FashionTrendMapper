---
path: /home/lesh/source/FashionTrendMapper/lib/supabase/admin.ts
type: util
updated: 2026-01-29
status: active
---

# admin.ts

## Purpose

Creates a Supabase admin client using the service role key for server-side operations that require elevated permissions. This client bypasses Row Level Security (RLS) policies and should never be exposed to the browser.

## Exports

- `createAdminClient()` - Factory function that returns a Supabase client configured with service role credentials and disabled session persistence

## Dependencies

- `@supabase/supabase-js` (external)

## Used By

TBD

## Notes

- Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables
- Throws an error if required env vars are missing
- Auth is configured with `autoRefreshToken: false` and `persistSession: false` for stateless server-side usage