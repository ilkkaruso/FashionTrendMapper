---
path: /home/lesh/source/FashionTrendMapper/types/d3plus-text.d.ts
type: module
updated: 2026-01-27
status: active
---

# d3plus-text.d.ts

## Purpose

TypeScript type declarations for the `d3plus-text` library. Provides type safety for the TextBox class used for automatic text wrapping and fitting within SVG elements.

## Exports

- `TextBox` - Class declaration for d3plus-text's TextBox component with chainable methods for configuring text rendering (data, select, fontResize, fontSize, width, height, x, y, verticalAlign, textAnchor, fontColor, render)

## Dependencies

None (ambient module declaration)

## Used By

TBD

## Notes

- Uses TypeScript module augmentation pattern (`declare module`)
- All configuration methods return `this` for method chaining
- The `fontColor` method accepts either a static string or a callback function for dynamic coloring