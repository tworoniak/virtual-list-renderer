# Virtual List Renderer

A from-scratch implementation of virtual list rendering in React — no `react-window`, no `react-virtualized`. Renders 100,000 rows smoothly at 60fps with variable row heights, live search, column sorting, and a real-time FPS overlay.

Built with React, TypeScript, Tailwind CSS, and Vite.

---

## Purpose

Virtual list rendering is one of those foundational performance techniques that most developers use via a library without understanding what's happening underneath. This project builds the entire engine from scratch to demonstrate:

- Why rendering 100,000 DOM nodes at once destroys performance
- How binary search makes scroll position calculation O(log n)
- How `ResizeObserver` enables accurate variable row height measurement
- How Web Workers keep the main thread free during heavy data operations

---

## Features

### Core Virtual List Engine

Only the rows visible in the viewport — plus a small overscan buffer above and below — are mounted in the DOM at any time. Regardless of dataset size, the DOM contains ~15–20 nodes. Row positions are calculated with `position: absolute` + a `top` offset inside a single tall container div whose height matches the total scrollable content.

### Variable Row Heights

Each row measures its own rendered height via `ResizeObserver` and reports it back to the engine via a `onMeasure` callback. The engine stores a height cache and recomputes all downstream offsets when a measurement changes. This means rows with long messages, wrapped text, or badges of different sizes all scroll correctly without jumpiness.

### Binary Search Scroll

Finding the first visible row on each scroll event uses binary search against the offset cache — O(log n) rather than O(n). At 100k rows this is the difference between microseconds and milliseconds per scroll event.

### Web Worker Data Generation

All 100,000 log entries are generated in a Web Worker on mount so the main thread never blocks. Search and filter operations also run in the Worker, keeping the UI responsive even when scanning the full dataset.

### Debounced Search

Filtering across 100k rows is debounced at 300ms and offloaded to the Worker. The search bar shows the result count and filter timing in milliseconds after each query.

### Column Sorting

Click any column header — Timestamp, Level, or Duration — to sort ascending or descending. Sort state is indicated with ↑ / ↓ / ↕ icons.

### FPS Overlay

A fixed overlay in the bottom-right corner measures real frame rate using a `requestAnimationFrame` loop, updating every 500ms. Colour-coded green (≥55fps), yellow (≥30fps), or red (<30fps).

### Stats Bar

A persistent footer shows total row count, filtered row count, and live rendered DOM node count — the last number is the core demonstration of what virtual rendering achieves.

---

## Tech Stack

| Tool                  | Purpose                                  |
| --------------------- | ---------------------------------------- |
| React 18 + TypeScript | UI and type safety                       |
| Vite                  | Dev server and bundler                   |
| Tailwind CSS v4       | Styling                                  |
| Web Workers API       | Off-thread data generation and filtering |
| ResizeObserver API    | Variable row height measurement          |
| requestAnimationFrame | FPS measurement loop                     |

No runtime dependencies beyond React itself — the virtual list engine, FPS counter, debounce utility, and data worker are all built from scratch.

---

## Getting Started

```bash
git clone https://github.com/your-username/virtual-list-renderer
cd virtual-list-renderer
npm install
npm run dev
```

---

## Project Structure

```
src/
├── App.tsx                           # Root layout, wires all hooks and components
├── types/
│   └── index.ts                      # LogEntry, SortKey, SortDirection, WorkerRequest/Response
├── data/
│   └── generate.worker.ts            # Web Worker: generates and filters 100k log entries
├── hooks/
│   ├── useVirtualList.ts             # Core engine: offsets, binary search, overscan, measure
│   ├── useWorkerData.ts              # Spawns worker, manages data and search state
│   ├── useSort.ts                    # Sort state and sorted dataset via useMemo
│   └── useFPS.ts                     # requestAnimationFrame FPS counter
├── components/
│   ├── VirtualList.tsx               # Scroll container and virtual row renderer
│   ├── LogRow.tsx                    # Individual log entry with ResizeObserver measurement
│   ├── TableHeader.tsx               # Sortable column headers
│   ├── SearchBar.tsx                 # Debounced search input with result count and timing
│   ├── FPSOverlay.tsx                # Fixed FPS counter, colour-coded by performance tier
│   └── StatsBar.tsx                  # Total, filtered, and live DOM node count
└── utils/
    └── debounce.ts                   # Vanilla debounce utility, no lodash
```

---

## How It Works

### The Virtual List Engine (`useVirtualList`)

The hook maintains a `LayoutState` containing an `offsets` array and `totalHeight`. On mount and whenever the row count changes, it builds the offset array by summing row heights from the cache — defaulting to `56px` for unmeasured rows.

On each scroll event, `scrollTop` is stored in state which triggers a `useMemo` recalculation. The memo uses binary search to find the first visible row index, then walks forward until the visible window is filled, adding `OVERSCAN = 5` rows on each side as a buffer.

When a row reports its measured height via `onMeasure`, the layout is rebuilt from that index forward — only the affected portion of the offset array is recomputed.

### Variable Heights via ResizeObserver

Each `LogRow` component attaches a `ResizeObserver` to its own DOM node. When the observed height differs from the cached value, it calls `onMeasure(index, height)` back to the engine. This handles initial measurement, font changes, content reflow, and anything else that affects row height.

### Web Worker Architecture

The worker handles two message types: `GENERATE` (builds the full 100k dataset once) and `FILTER` (scans the full dataset against a query string). It retains the full dataset in memory between filter calls so regeneration is never needed. Each response includes a `timing` field measured with `performance.now()` inside the worker.

---

## Key Numbers

| Metric               | Value                  |
| -------------------- | ---------------------- |
| Total rows           | 100,000                |
| DOM nodes rendered   | ~15–20                 |
| Scroll calculation   | O(log n) binary search |
| Search debounce      | 300ms                  |
| FPS target           | 60fps                  |
| Runtime dependencies | 0                      |

---

## Scripts

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # ESLint
```

---

## What I Learned

The trickiest part was satisfying React's rules around ref access during render. The natural instinct is to store the offset cache in a ref for performance — avoiding re-renders on every measurement — but React's strict mode linter correctly flags ref access inside `useMemo` and anywhere in the render path. The solution was storing `offsets` and `totalHeight` together as a `LayoutState` object in proper React state, updated via `setLayout`. This means measurement triggers a re-render, but since only the layout state changes and the virtual window recalculates via `useMemo`, the performance impact is minimal.

The Web Worker debounce pattern also required some iteration. Standard approaches like `useRef(...).current` and `useMemo` both ran into the same linter rule. The final pattern — creating the debounced function inside `useEffect` alongside the worker, capturing the worker instance directly, and exposing a stable `useCallback` wrapper — is cleaner than the initial approach and avoids the ref-in-render problem entirely.

---

## Related Projects

This is part of a series of frontend experiment projects exploring real tradeoffs in the React ecosystem:

- **Virtual List Renderer** ← you are here
- State Management Comparison — Zustand vs. Jotai vs. Redux Toolkit
- UI Design Systems Comparison — shadcn/ui vs. Radix vs. Material UI
