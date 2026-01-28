---
path: /home/lesh/source/FashionTrendMapper/lib/hooks/useResizeObserver.ts
type: hook
updated: 2026-01-27
status: active
---

# useResizeObserver.ts

## Purpose

A React hook that tracks the dimensions of a DOM element using the ResizeObserver API. Returns a ref to attach to the target element and reactive width/height values that update when the element resizes.

## Exports

- `useResizeObserver<T extends HTMLElement>()` - Generic hook returning `{ ref, dimensions }` where ref is a React ref and dimensions contains current `width` and `height`

## Dependencies

- react (useEffect, useRef, useState)

## Used By

TBD

## Notes

- Uses `'use client'` directive for Next.js client-side rendering
- Properly cleans up observer on unmount via disconnect()
- Initial dimensions are `{ width: 0, height: 0 }` until first observation