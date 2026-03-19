import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_ROW_HEIGHT = 56;
const OVERSCAN = 5;

interface UseVirtualListOptions {
  count: number;
  containerHeight: number;
}

interface LayoutState {
  offsets: number[];
  totalHeight: number;
}

function buildLayout(
  count: number,
  heightCache: Map<number, number>,
): LayoutState {
  const offsets: number[] = [];
  let total = 0;
  for (let i = 0; i < count; i++) {
    offsets[i] = total;
    total += heightCache.get(i) ?? DEFAULT_ROW_HEIGHT;
  }
  return { offsets, totalHeight: total };
}

export function useVirtualList({
  count,
  containerHeight,
}: UseVirtualListOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const heightCacheRef = useRef<Map<number, number>>(new Map());
  const [layout, setLayout] = useState<LayoutState>(() => ({
    offsets: [],
    totalHeight: count * DEFAULT_ROW_HEIGHT,
  }));

  useEffect(() => {
    setLayout(buildLayout(count, heightCacheRef.current));
  }, [count]);

  const measureRow = useCallback(
    (index: number, height: number) => {
      const cache = heightCacheRef.current;
      if (cache.get(index) === height) return;
      cache.set(index, height);
      setLayout((prev) => {
        const offsets = [...prev.offsets];
        let total = index === 0 ? 0 : offsets[index];
        for (let i = index; i < count; i++) {
          offsets[i] = total;
          total += cache.get(i) ?? DEFAULT_ROW_HEIGHT;
        }
        return { offsets, totalHeight: total };
      });
    },
    [count],
  );

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  }, []);

  const virtualItems = useMemo(() => {
    const { offsets } = layout;

    // Binary search for first visible row
    let low = 0;
    let high = count - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if ((offsets[mid] ?? mid * DEFAULT_ROW_HEIGHT) < scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    const startIndex = Math.max(0, low - 1 - OVERSCAN);

    let endIndex = startIndex;
    while (
      endIndex < count - 1 &&
      (offsets[endIndex] ?? endIndex * DEFAULT_ROW_HEIGHT) <
        scrollTop + containerHeight
    ) {
      endIndex++;
    }
    endIndex = Math.min(count - 1, endIndex + OVERSCAN);

    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        offsetTop: offsets[i] ?? i * DEFAULT_ROW_HEIGHT,
      });
    }
    return items;
  }, [scrollTop, count, containerHeight, layout]);

  return {
    virtualItems,
    totalHeight: layout.totalHeight,
    onScroll,
    measureRow,
  };
}
