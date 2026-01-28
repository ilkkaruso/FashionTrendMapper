---
path: /home/lesh/source/FashionTrendMapper/lib/hooks/useForceSimulation.ts
type: hook
updated: 2026-01-27
status: active
---

# useForceSimulation.ts

## Purpose

React hook that manages a D3 force simulation for bubble chart animations. It creates and controls the physics simulation lifecycle, updating React state on each animation tick to drive smooth node positioning.

## Exports

- `useForceSimulation` - Hook that takes nodes, width, and height, returning animated node positions updated by the force simulation

## Dependencies

- react (useEffect, useState, useRef)
- d3 (Simulation type)
- [[lib-visualization-forces]] - createBubbleSimulation factory
- [[lib-visualization-types]] - BubbleNode type

## Used By

TBD

## Notes

- Uses 'use client' directive for client-side rendering
- Simulation restarts with alpha 0.3 when input nodes change, providing smooth transitions
- Properly cleans up simulation on unmount to prevent memory leaks
- Guards against zero dimensions or empty nodes to avoid invalid simulations