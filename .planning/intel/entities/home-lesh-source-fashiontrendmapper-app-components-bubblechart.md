---
path: /home/lesh/source/FashionTrendMapper/app/components/BubbleChart.tsx
type: component
updated: 2026-01-27
status: active
---

# BubbleChart.tsx

## Purpose

React component that renders an interactive D3-powered bubble chart visualization for fashion trends. Converts trend data into force-simulated bubbles with radius scaled by score, supporting click interactions.

## Exports

- `BubbleChart` - Main component that renders SVG bubble chart with force simulation animation

## Dependencies

- react (useMemo)
- d3 (scaleSqrt for radius scaling)
- [[home-lesh-source-fashiontrendmapper-lib-hooks-useforcesimulation]] (force simulation hook)
- [[home-lesh-source-fashiontrendmapper-lib-fetchers-types]] (TrendWithHistory type)
- [[home-lesh-source-fashiontrendmapper-lib-visualization-types]] (BubbleNode type)
- ./Bubble (Bubble component)

## Used By

TBD

## Notes

- Radius scales from 20px to 80px using D3's sqrt scale based on trend score (0-100)
- Maintains a Map for efficient trend lookup on bubble click events
- Uses optional chaining for node.x/y with fallback to 0 for initial render before simulation settles