---
path: /home/lesh/source/FashionTrendMapper/app/layout.tsx
type: component
updated: 2026-01-22
status: active
---

# layout.tsx

## Purpose

Root layout component for the Fashion Trend Mapper Next.js application. Defines the HTML structure, global fonts, navigation header, and footer that wrap all pages.

## Exports

- `metadata`: Next.js Metadata object with title "Fashion Trend Mapper" and description
- `default` (RootLayout): Root layout component that wraps page children with header navigation and footer

## Dependencies

- next/font/google (Inter font)
- next/link (Link component)
- [[globals-css]] (global styles)

## Used By

TBD

## Notes

- Uses Inter font with CSS variable `--font-inter`
- Navigation includes Home, Archive, and Admin routes
- Footer includes affiliate disclosure text
- Bug: `className={}` on body element appears to be incomplete (missing `inter.variable`)