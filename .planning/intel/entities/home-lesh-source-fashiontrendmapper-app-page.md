---
path: /home/lesh/source/FashionTrendMapper/app/page.tsx
type: component
updated: 2026-01-22
status: active
---

# page.tsx

## Purpose

Main homepage component for the Fashion Trends application. Displays a welcome message and tests the Supabase database connection by querying the categories table.

## Exports

- `default` (HomePage): Async React Server Component that renders the main landing page with database connection status

## Dependencies

- [[supabase-server]] - Server-side Supabase client factory

## Used By

TBD

## Notes

- Uses React Server Components (async function component)
- Performs server-side data fetching directly in the component
- Includes temporary database connection test UI that should be removed in production