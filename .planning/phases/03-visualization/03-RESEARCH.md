# Phase 3: Visualization - Research

**Researched:** 2026-01-26
**Domain:** D3.js force-directed visualization with React/Next.js
**Confidence:** HIGH

## Summary

D3.js force simulations are the industry-standard approach for creating animated bubble visualizations like Crypto Bubbles. The key architectural pattern is to **use D3 for calculations/physics and React for DOM rendering**, avoiding the anti-pattern of letting D3 control the DOM in React applications. For this phase, we'll use D3's force simulation engine for positioning and collision detection while React components render the SVG bubbles declaratively.

The standard stack combines D3's force module with Next.js's built-in font optimization for Inter font, ResizeObserver for responsive sizing, and URL-based state management for modals. Text wrapping in SVG circles requires d3plus-text library since SVG lacks native text wrapping. For styling, Next.js officially recommends Tailwind CSS for utility-based styling with CSS Modules for component-specific overrides.

**Primary recommendation:** Use D3 v7+ forceSimulation with collision force (radius + padding) and center force, render with React SVG components via useRef/useEffect pattern, implement modal with native `<dialog>` element for accessibility, and use d3plus-text for bubble labels.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| d3-force | v7+ (part of d3) | Force simulation physics | Industry standard for force-directed layouts, battle-tested performance |
| d3-scale | v7+ (part of d3) | Scale radius by score | Standard for data-to-visual mapping transformations |
| next/font | Built-in | Inter font optimization | Next.js built-in feature, automatic self-hosting with zero layout shift |
| d3plus-text | Latest | SVG text wrapping in circles | Only mature solution for text wrapping in SVG shapes |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ResizeObserver API | Native browser | Responsive sizing | Always - standard for canvas/SVG resize detection |
| Tailwind CSS | v4 | Utility styling | Already in project, Next.js recommended |
| CSS Modules | Built-in | Component-specific styles | When Tailwind utilities insufficient |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| d3plus-text | Custom text wrapping | Custom solution would miss edge cases (ellipsis, multi-line, font metrics) |
| SVG rendering | Canvas rendering | Canvas faster for 1000+ nodes, but SVG fine for fashion trends (likely <100 bubbles), easier interactivity |
| Native `<dialog>` | react-modal library | Library adds dependency, but native dialog has excellent browser support since March 2022 |

**Installation:**
```bash
npm install d3 d3plus-text
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── page.tsx                          # Main visualization page
├── components/
│   ├── BubbleVisualization.tsx      # Main visualization container
│   ├── BubbleChart.tsx              # D3 force simulation + SVG rendering
│   ├── Bubble.tsx                   # Individual bubble component
│   ├── TrendModal.tsx               # Modal for trend details
│   ├── FilterBar.tsx                # Category/search filters
│   └── LastUpdated.tsx              # Timestamp display
├── hooks/
│   ├── useForceSimulation.ts        # D3 force simulation hook
│   ├── useResizeObserver.ts         # Responsive sizing hook
│   └── useTrendFiltering.ts         # Filter/search logic
└── lib/
    └── visualization/
        └── forces.ts                 # Force configuration helpers
```

### Pattern 1: D3 + React Integration (Calculation vs Rendering)
**What:** Use D3 for math/physics, React for DOM rendering
**When to use:** Always when combining D3 with React
**Example:**
```typescript
// Source: https://d3js.org/d3-force/simulation + React best practices
'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { TrendWithHistory } from '@/lib/fetchers/types';

interface BubbleNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  score: number;
  changePercent: number;
  radius: number;
}

export function BubbleChart({ trends }: { trends: TrendWithHistory[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<BubbleNode[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Convert trends to nodes with radius
  useEffect(() => {
    const radiusScale = d3.scaleSqrt()
      .domain([0, 100])
      .range([20, 80]);

    const bubbleNodes: BubbleNode[] = trends.map(trend => ({
      id: trend.title,
      title: trend.title,
      score: trend.score,
      changePercent: trend.changePercent,
      radius: radiusScale(trend.score),
    }));

    setNodes(bubbleNodes);
  }, [trends]);

  // D3 force simulation (calculation only)
  useEffect(() => {
    if (nodes.length === 0 || !svgRef.current) return;

    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide<BubbleNode>()
        .radius(d => d.radius + 5) // 5px padding between bubbles
        .strength(0.8)
        .iterations(2)
      )
      .on('tick', () => {
        // Update React state on each tick
        setNodes([...simulation.nodes()]);
      });

    return () => {
      simulation.stop();
    };
  }, [nodes.length, dimensions]);

  return (
    <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
      {/* React renders the DOM */}
      {nodes.map(node => (
        <Bubble
          key={node.id}
          x={node.x ?? 0}
          y={node.y ?? 0}
          radius={node.radius}
          title={node.title}
          score={node.score}
          changePercent={node.changePercent}
        />
      ))}
    </svg>
  );
}
```

### Pattern 2: Responsive SVG with ResizeObserver
**What:** Use ResizeObserver to dynamically resize visualization
**When to use:** Always for responsive D3 visualizations
**Example:**
```typescript
// Source: https://blog.logrocket.com/make-any-svg-responsive-with-this-react-component/
import { useEffect, useRef, useState } from 'react';

export function useResizeObserver<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observeTarget = ref.current;
    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      });
    });

    resizeObserver.observe(observeTarget);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { ref, dimensions };
}

// Usage:
function BubbleVisualization() {
  const { ref, dimensions } = useResizeObserver<HTMLDivElement>();

  return (
    <div ref={ref} className="w-full h-screen">
      <BubbleChart width={dimensions.width} height={dimensions.height} />
    </div>
  );
}
```

### Pattern 3: Accessible Modal with Native Dialog
**What:** Use HTML `<dialog>` element for modals with proper focus management
**When to use:** Modal overlays, trend detail popups
**Example:**
```typescript
// Source: https://reactcommunity.org/react-modal/accessibility/ + native dialog
'use client';

import { useRef, useEffect } from 'react';
import type { TrendWithHistory } from '@/lib/fetchers/types';

interface TrendModalProps {
  trend: TrendWithHistory | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TrendModal({ trend, isOpen, onClose }: TrendModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal(); // Use showModal() for proper a11y
    } else {
      dialog.close();
    }
  }, [isOpen]);

  if (!trend) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="p-6 rounded-lg backdrop:bg-black/50"
    >
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold">{trend.title}</h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Popularity Score</h3>
          <p className="text-4xl">{trend.score.toFixed(1)}</p>
          <p className="text-sm text-gray-600">
            {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}% from yesterday
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Source Breakdown</h3>
          {trend.sourceBreakdown.map(sb => (
            <div key={sb.source} className="flex justify-between">
              <span className="capitalize">{sb.source}</span>
              <span>{sb.score.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ESC key closes automatically with native dialog */}
    </dialog>
  );
}
```

### Pattern 4: SVG Text Wrapping with d3plus-text
**What:** Use d3plus-text to wrap trend names inside circles
**When to use:** Displaying text labels on bubbles
**Example:**
```typescript
// Source: https://github.com/d3plus/d3plus-text
import { useEffect, useRef } from 'react';
import { TextBox } from 'd3plus-text';

interface BubbleProps {
  x: number;
  y: number;
  radius: number;
  title: string;
  score: number;
  changePercent: number;
  onClick?: () => void;
}

export function Bubble({ x, y, radius, title, score, changePercent, onClick }: BubbleProps) {
  const textRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // d3plus-text automatically wraps text to fit in circle
    new TextBox()
      .select(textRef.current)
      .data([{
        text: title,
        x: x,
        y: y,
      }])
      .fontSize(12)
      .fontMin(8)
      .fontMax(16)
      .width(radius * 1.6) // Slightly smaller than diameter for padding
      .height(radius * 1.6)
      .textAnchor('middle')
      .verticalAlign('top')
      .render();
  }, [x, y, radius, title]);

  const color = changePercent >= 0 ? '#22c55e' : '#ef4444'; // green/red

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={color}
        fillOpacity={0.7}
        stroke="#fff"
        strokeWidth={2}
      />
      <g ref={textRef} />
      <text
        x={x}
        y={y + radius * 0.4}
        textAnchor="middle"
        fontSize={14}
        fontWeight="bold"
        fill="#fff"
      >
        {score.toFixed(0)}
      </text>
      <text
        x={x}
        y={y + radius * 0.6}
        textAnchor="middle"
        fontSize={10}
        fill="#fff"
      >
        {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
      </text>
    </g>
  );
}
```

### Pattern 5: Filter State Management with URL Search Params
**What:** Store filter/search state in URL for shareability
**When to use:** Search and category filtering
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/use-search-params
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import type { TrendWithHistory } from '@/lib/fetchers/types';

export function useTrendFiltering(allTrends: TrendWithHistory[]) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchQuery = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';

  const setSearchQuery = (query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    router.push(`?${params.toString()}`);
  };

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat && cat !== 'all') {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    router.push(`?${params.toString()}`);
  };

  const filteredTrends = allTrends.filter(trend => {
    // Search filter
    if (searchQuery && !trend.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter (would need category field on trends)
    // if (category !== 'all' && trend.category !== category) {
    //   return false;
    // }

    return true;
  });

  return {
    filteredTrends,
    searchQuery,
    setSearchQuery,
    category,
    setCategory,
  };
}
```

### Anti-Patterns to Avoid
- **Don't use D3 for DOM manipulation in React:** Let D3 calculate positions, let React render. Using `.append()` or `.enter()/.exit()` creates conflict with React's virtual DOM.
- **Don't omit dependencies in useEffect:** Force simulation dependencies must be specified or you'll get stale data and memory leaks.
- **Don't use static charge values for variable-sized bubbles:** Larger bubbles need stronger repulsion. Use function-based charge: `d3.forceManyBody().strength(d => -d.radius * 2)`.
- **Don't forget ResizeObserver cleanup:** Always disconnect ResizeObserver in cleanup function to prevent memory leaks.
- **Don't skip accessibility for modals:** Use native `<dialog>` or ensure `role="dialog"`, `aria-modal="true"`, focus trapping, and ESC key handling.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG text wrapping in circles | Custom line-break logic | d3plus-text | SVG lacks native text wrapping; custom solution will miss edge cases (font metrics, ellipsis, multi-line, shape fitting) |
| Collision detection | Manual circle overlap math | d3.forceCollide() | D3's implementation uses Barnes-Hut approximation with quadtree for O(n log n) performance vs naive O(n²) |
| Responsive SVG sizing | Manual window resize listener | ResizeObserver API | Native browser API handles all resize triggers (window, container, flexbox, grid), automatic cleanup |
| Modal accessibility | Custom focus trap | Native `<dialog>` element | Browser-native focus management, backdrop, ESC key, `::backdrop` pseudo-element since March 2022 |
| Font loading optimization | Manual font preload tags | next/font | Next.js inlines font CSS at build time, eliminates FOUT/FOIT, size-adjust prevents layout shift |
| Scale calculations | Manual linear interpolation | d3.scaleLinear(), d3.scaleSqrt() | D3 scales handle edge cases (domain clamps, nice ticks, inversion) |

**Key insight:** D3's force simulation and collision detection are highly optimized with quadtree data structures. Hand-rolling these will result in O(n²) complexity instead of O(n log n), causing performance issues beyond ~50 nodes.

## Common Pitfalls

### Pitfall 1: Force Simulation Creates Infinite Render Loop
**What goes wrong:** Setting React state on every `tick` event causes infinite re-renders
**Why it happens:** Each state update triggers re-render, which re-initializes simulation, which triggers tick, which updates state...
**How to avoid:**
- Use `useRef` to store simulation instance outside render cycle
- Only update state when simulation stabilizes (alpha < threshold) OR
- Use `requestAnimationFrame` to batch updates OR
- Stop simulation after initial layout (`.stop()` after N ticks)
**Warning signs:** Browser freezes, React DevTools shows thousands of renders, fan spins up

### Pitfall 2: Text Overflows Small Bubbles
**What goes wrong:** Long trend names don't fit in small bubbles, text renders outside circle
**Why it happens:** SVG `<text>` doesn't wrap or truncate automatically
**How to avoid:**
- Use d3plus-text with fontMin/fontMax to auto-scale
- Set `.width()` and `.height()` to ~1.6× radius (not full diameter)
- Configure `.fontMin(8)` to prevent unreadable text
- Consider hiding text entirely for bubbles below radius threshold
**Warning signs:** Text overlapping other bubbles, unreadable tiny text, trend names cut off

### Pitfall 3: Poor Mobile Performance with Touch Events
**What goes wrong:** Bubble clicks don't work on mobile, or page scrolls when trying to tap bubble
**Why it happens:** Touch events have different handlers than mouse, and may conflict with scroll
**How to avoid:**
- Use `onClick` on SVG elements (React normalizes touch/mouse)
- Add `touch-action: none` CSS to SVG container if implementing drag
- Test on actual mobile device, not just browser DevTools
- Consider minimum tap target size of 44×44px (increase bubble radius or hit area)
**Warning signs:** Taps not registering, accidental scrolling, double-tap zoom activating

### Pitfall 4: Bubble Positions Not Responsive on Window Resize
**What goes wrong:** Bubbles stay in old positions when window resizes, don't re-center
**Why it happens:** Force simulation uses fixed width/height from initialization
**How to avoid:**
- Use ResizeObserver to detect size changes
- When dimensions change, update center force: `.force('center', d3.forceCenter(newWidth/2, newHeight/2))`
- Call `.alpha(0.3).restart()` to reheat simulation for smooth repositioning
- Don't create new simulation on resize, just update forces
**Warning signs:** Bubbles clumped in corner after resize, center force offset, simulation doesn't respond to container size

### Pitfall 5: Accessibility Issues with Modal
**What goes wrong:** Screen readers don't announce modal, keyboard users trapped, focus lost
**Why it happens:** Modal implemented as regular div without ARIA attributes
**How to avoid:**
- Use native `<dialog>` element with `.showModal()` method (not `.show()`)
- If not using `<dialog>`, add `role="dialog"` and `aria-modal="true"`
- Set `aria-labelledby` pointing to modal title
- Ensure backdrop has `aria-hidden="true"` applied to content behind modal
- Test with screen reader (NVDA, VoiceOver, JAWS)
**Warning signs:** Screen reader doesn't announce modal opening, Tab key escapes modal, focus returns to wrong element on close

### Pitfall 6: D3 Version Conflicts with Next.js SSR
**What goes wrong:** `ReferenceError: document is not defined` or `window is not defined`
**Why it happens:** D3 code runs on server during SSR, but DOM APIs only exist in browser
**How to avoid:**
- Mark components using D3 with `'use client'` directive at top of file
- Check `typeof window !== 'undefined'` before accessing window/document
- Use dynamic imports with `{ ssr: false }` if needed: `dynamic(() => import('./BubbleChart'), { ssr: false })`
- useEffect runs only client-side, safe for D3 initialization
**Warning signs:** Build errors about `window`/`document`, hydration mismatches, blank screen on initial load

## Code Examples

Verified patterns from official sources:

### Force Simulation Configuration for Bubble Chart
```typescript
// Source: https://d3js.org/d3-force + https://vallandingham.me/bubble_charts_in_d3.html
import * as d3 from 'd3';

interface BubbleNode extends d3.SimulationNodeDatum {
  id: string;
  radius: number;
  score: number;
}

function createBubbleSimulation(
  nodes: BubbleNode[],
  width: number,
  height: number
) {
  return d3.forceSimulation(nodes)
    // Many-body force for repulsion (prevents overlap via charge)
    .force('charge', d3.forceManyBody()
      .strength(d => -Math.pow(d.radius, 2) * 0.05) // Stronger repulsion for larger bubbles
    )
    // Center force pulls bubbles to middle (larger bubbles naturally drift center)
    .force('center', d3.forceCenter(width / 2, height / 2)
      .strength(0.05) // Weak center force, let collisions dominate
    )
    // Collision force prevents overlap
    .force('collision', d3.forceCollide<BubbleNode>()
      .radius(d => d.radius + 5) // 5px padding between bubbles
      .strength(0.8) // Strong collision (0-1 range)
      .iterations(2) // More iterations = more rigid (default: 1)
    )
    // Alpha controls simulation "temperature"
    .alpha(1) // Start hot
    .alphaDecay(0.02) // Slower cooling for smoother animation (default: 0.0228)
    .velocityDecay(0.4) // Friction (default: 0.4)
    .alphaMin(0.001); // Stop threshold
}
```

### Next.js Font Optimization with Inter
```typescript
// Source: https://nextjs.org/docs/app/getting-started/fonts
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Use font-display: swap
  variable: '--font-inter', // CSS variable for Tailwind
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}

// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
};
```

### Drag Interaction for Bubbles
```typescript
// Source: https://d3js.org/d3-force/simulation (event handling section)
import * as d3 from 'd3';

function createDragBehavior(simulation: d3.Simulation<BubbleNode, undefined>) {
  function dragStarted(event: d3.D3DragEvent<SVGCircleElement, BubbleNode, BubbleNode>) {
    if (!event.active) {
      // Reheat simulation on drag start
      simulation.alphaTarget(0.3).restart();
    }
    // Fix node position
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: d3.D3DragEvent<SVGCircleElement, BubbleNode, BubbleNode>) {
    // Update fixed position during drag
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragEnded(event: d3.D3DragEvent<SVGCircleElement, BubbleNode, BubbleNode>) {
    if (!event.active) {
      // Cool down simulation
      simulation.alphaTarget(0);
    }
    // Unfix node (let it be affected by forces again)
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3.drag<SVGCircleElement, BubbleNode>()
    .on('start', dragStarted)
    .on('drag', dragged)
    .on('end', dragEnded);
}
```

### Color Scaling by Change Percent
```typescript
// Source: https://d3js.org/d3-scale
import * as d3 from 'd3';

// Green for positive, red for negative, intensity by magnitude
function createChangeColorScale() {
  return d3.scaleLinear<string>()
    .domain([-50, 0, 50]) // -50% to +50% change
    .range(['#ef4444', '#f3f4f6', '#22c55e']) // red -> gray -> green
    .clamp(true); // Values outside domain get clamped to range
}

// Usage:
const colorScale = createChangeColorScale();
const bubbleColor = colorScale(trend.changePercent); // Returns hex color
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| D3 v3 monolithic package | D3 v7 modular packages (d3-force, d3-scale, etc.) | 2016 (v4) | Smaller bundle sizes, tree-shaking, only import what you need |
| D3 `.enter()/.exit()` for React | D3 for calculations, React for rendering | ~2018 | Avoids virtual DOM conflicts, more maintainable, better TypeScript support |
| Manual font preloading | next/font automatic optimization | Next.js 13 (2022) | Zero configuration, eliminates layout shift, inlines font CSS |
| react-modal library | Native `<dialog>` element | March 2022 (baseline) | No dependency, native focus management, `::backdrop` styling |
| CSS-in-JS (styled-components) | Tailwind CSS + CSS Modules | 2023-2024 | Faster builds, no runtime cost, better DX in Next.js ecosystem |
| Manual window resize | ResizeObserver API | ~2020 (baseline) | More reliable, detects container resize, better performance |

**Deprecated/outdated:**
- **D3 `.enter()/.exit()` pattern with React**: Use declarative React rendering instead. The join/merge pattern conflicts with React's reconciliation.
- **forceLayout() (D3 v3)**: Renamed to forceSimulation() in v4+. Old API incompatible.
- **Manual `window.addEventListener('resize')`**: Use ResizeObserver for container-based resize detection.
- **react-modal for basic modals**: Native `<dialog>` now has excellent browser support, use it for new projects.

## Open Questions

Things that couldn't be fully resolved:

1. **Category field on trends**
   - What we know: Requirements specify category filtering (clothing, styles, brands, colors) but database schema doesn't have category field
   - What's unclear: Should categories be inferred from trend title (regex/keywords), stored explicitly, or fetched from external API?
   - Recommendation: Plan task to decide category strategy - likely need to add `category` column to `trends` table and categorize via LLM or keyword matching

2. **Related trends algorithm**
   - What we know: MODAL-04 requires showing related trends, but no existing relationship data
   - What's unclear: How to calculate "relatedness" - text similarity, co-occurrence in search, category overlap?
   - Recommendation: Start with simple text similarity (shared words in titles), plan for enhancement later

3. **Optimal bubble count threshold**
   - What we know: SVG handles ~1000 elements, Canvas better beyond that
   - What's unclear: How many fashion trends will actually exist? 50? 500? 5000?
   - Recommendation: Start with SVG, monitor performance, switch to Canvas if >500 bubbles

4. **Mobile zoom/pan behavior**
   - What we know: d3-zoom supports touch, but may conflict with page scroll
   - What's unclear: Should users be able to pan/zoom the bubble chart on mobile, or is single-screen sufficient?
   - Recommendation: Test mobile UX - if all bubbles fit on screen, skip zoom/pan to avoid scroll conflicts

## Sources

### Primary (HIGH confidence)
- [D3 Force Simulation API](https://d3js.org/d3-force/simulation) - Official D3 documentation on force simulations
- [D3 Collide Force API](https://d3js.org/d3-force/collide) - Official D3 documentation on collision force
- [Jim Vallandingham's D3 Bubble Chart Tutorial](https://vallandingham.me/bubble_charts_in_d3.html) - Foundational resource for D3 bubble patterns
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) - Official Next.js documentation
- [Next.js CSS Documentation](https://nextjs.org/docs/app/getting-started/css) - Official Next.js styling recommendations
- [d3plus-text GitHub](https://github.com/d3plus/d3plus-text) - Official d3plus-text library documentation

### Secondary (MEDIUM confidence)
- [D3.js with Next.js Integration (clouddevs.com)](https://clouddevs.com/next/data-visualization-with-d3js/) - useRef/useEffect pattern
- [How to Use D3 in Next.js (Alan Smith)](https://d3-playground.alanwsmith.com/how-to-use-d3-in-nextjs) - SSR handling
- [D3 Force Layout In-Depth](https://www.d3indepth.com/force-layout/) - Force configuration patterns
- [React Loading Skeleton (LogRocket)](https://blog.logrocket.com/handling-react-loading-states-react-loading-skeleton/) - Loading state patterns
- [Native Dialog Element (react-modal docs)](https://reactcommunity.org/react-modal/accessibility/) - Accessibility requirements
- [State Management in React 2026 (Nucamp)](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) - URL state pattern
- [Responsive SVG in React (LogRocket)](https://blog.logrocket.com/make-any-svg-responsive-with-this-react-component/) - ResizeObserver hook
- [Tailwind CSS vs CSS Modules (Medium)](https://medium.com/@mernstackdevbykevin/tailwind-css-vs-css-modules-which-to-choose-in-2025-5511f54560af) - Styling comparison

### Tertiary (LOW confidence)
- [D3 Canvas vs SVG Performance (various sources)](https://blog.scottlogic.com/2020/05/01/rendering-one-million-points-with-d3.html) - Performance thresholds (dates vary)
- [D3 Zoom Touch Issues](https://github.com/d3/d3-zoom/issues/141) - Known mobile touch problems
- [SVG Text Wrapping Proposals](https://www.w3.org/Graphics/SVG/WG/wiki/Proposals/Wrapping_Text) - SVG 2 spec (not widely implemented)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - D3 force simulation is industry standard, official Next.js docs verify font/styling recommendations
- Architecture: HIGH - Patterns verified with official D3 docs and established React+D3 best practices
- Pitfalls: MEDIUM - Based on community reports and known issues, not all personally verified

**Research date:** 2026-01-26
**Valid until:** ~2026-03-26 (60 days - D3 and React patterns are stable, but Next.js updates frequently)
