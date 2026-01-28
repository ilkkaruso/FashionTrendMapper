---
path: /home/lesh/source/FashionTrendMapper/lib/visualization/types.ts
type: model
updated: 2026-01-27
status: active
---

# types.ts

## Purpose

Defines TypeScript interfaces for the bubble visualization system. Provides the `BubbleNode` type that extends D3's simulation node with fashion trend-specific properties for rendering interactive bubble charts.

## Exports

- **BubbleNode** - Interface for bubble visualization nodes containing trend id, title, score, changePercent, and radius properties

## Dependencies

- d3 (external - SimulationNodeDatum type)

## Used By

TBD

## Notes

- Extends D3's `SimulationNodeDatum` to integrate with D3 force simulation
- Score is normalized to 0-100 range
- Radius is pre-calculated from score for performance