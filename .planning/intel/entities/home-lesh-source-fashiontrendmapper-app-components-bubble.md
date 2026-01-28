---
path: /home/lesh/source/FashionTrendMapper/app/components/Bubble.tsx
type: component
updated: 2026-01-27
status: active
---

# Bubble.tsx

## Purpose

SVG bubble component for the trend visualization chart. Renders an interactive circle with wrapped title text, score value, and change percentage indicator, using d3plus-text for automatic text fitting.

## Exports

- `Bubble` - React component that renders an SVG group containing a colored circle, auto-wrapped title text, score display, and percentage change indicator

## Dependencies

- react (useEffect, useRef)
- d3plus-text (TextBox)

## Used By

TBD

## Notes

- Color coding: green (#22c55e) for positive change, red (#ef4444) for negative
- Uses d3plus-text TextBox for automatic text wrapping and font size adjustment within bubble bounds
- Font size dynamically scales between 8-16px based on available space
- Circle opacity is 0.7 with white stroke border