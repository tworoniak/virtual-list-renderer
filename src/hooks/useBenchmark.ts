import { useCallback, useRef, useState } from 'react';
import type { BenchmarkResult, BenchmarkState } from '../types';

const ROW_COUNTS = [1_000, 5_000, 10_000, 25_000];
const SCROLL_DURATION_MS = 2000;

function getMemoryMB(): number | null {
  const mem = (
    performance as unknown as { memory?: { usedJSHeapSize: number } }
  ).memory;
  return mem ? Math.round(mem.usedJSHeapSize / 1024 / 1024) : null;
}

async function measureRenderTime(fn: () => void): Promise<number> {
  return new Promise((resolve) => {
    const start = performance.now();
    fn();
    // rAF gives the browser a chance to actually paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve(performance.now() - start);
      });
    });
  });
}

async function measureScrollFPS(
  container: HTMLElement,
  totalHeight: number,
): Promise<number> {
  return new Promise((resolve) => {
    let frames = 0;
    let scrollPos = 0;
    const scrollStep = totalHeight / (SCROLL_DURATION_MS / 16);
    const start = performance.now();

    const animate = () => {
      frames++;
      scrollPos += scrollStep;
      container.scrollTop = scrollPos;

      if (
        scrollPos < totalHeight &&
        performance.now() - start < SCROLL_DURATION_MS
      ) {
        requestAnimationFrame(animate);
      } else {
        const elapsed = performance.now() - start;
        resolve(Math.round((frames / elapsed) * 1000));
      }
    };

    requestAnimationFrame(animate);
  });
}

export function useBenchmark() {
  const [state, setState] = useState<BenchmarkState>({
    status: 'idle',
    rowCount: ROW_COUNTS[0],
    naive: null,
    virtual: null,
  });

  const naiveContainerRef = useRef<HTMLDivElement>(null);
  const virtualContainerRef = useRef<HTMLDivElement>(null);

  const setRowCount = useCallback((count: number) => {
    setState((prev) => ({
      ...prev,
      rowCount: count,
      naive: null,
      virtual: null,
      status: 'idle',
    }));
  }, []);

  const run = useCallback(
    async (
      renderNaive: (container: HTMLElement, count: number) => void,
      renderVirtual: (container: HTMLElement, count: number) => void,
    ) => {
      if (!naiveContainerRef.current || !virtualContainerRef.current) return;

      const rowCount = state.rowCount;

      // --- Naive ---
      setState((prev) => ({ ...prev, status: 'running-naive' }));
      await new Promise((r) => setTimeout(r, 100)); // let UI update

      const naiveContainer = naiveContainerRef.current;
      naiveContainer.innerHTML = '';

      const naiveRenderTime = await measureRenderTime(() => {
        renderNaive(naiveContainer, rowCount);
      });

      const naiveDOMNodes =
        naiveContainer.querySelectorAll('[data-row]').length;
      const naiveMemory = getMemoryMB();
      const naiveTotalHeight = naiveContainer.scrollHeight;

      const naiveScrollFPS = await measureScrollFPS(
        naiveContainer,
        naiveTotalHeight,
      );

      const naiveResult: BenchmarkResult = {
        renderTime: naiveRenderTime,
        domNodes: naiveDOMNodes,
        scrollFPS: naiveScrollFPS,
        memoryMB: naiveMemory,
      };

      // --- Virtual ---
      setState((prev) => ({
        ...prev,
        status: 'running-virtual',
        naive: naiveResult,
      }));
      await new Promise((r) => setTimeout(r, 100));

      const virtualContainer = virtualContainerRef.current;
      virtualContainer.innerHTML = '';

      const virtualRenderTime = await measureRenderTime(() => {
        renderVirtual(virtualContainer, rowCount);
      });

      const virtualDOMNodes =
        virtualContainer.querySelectorAll('[data-row]').length;
      const virtualMemory = getMemoryMB();
      const virtualTotalHeight = virtualContainer.scrollHeight;

      const virtualScrollFPS = await measureScrollFPS(
        virtualContainer,
        virtualTotalHeight,
      );

      const virtualResult: BenchmarkResult = {
        renderTime: virtualRenderTime,
        domNodes: virtualDOMNodes,
        scrollFPS: virtualScrollFPS,
        memoryMB: virtualMemory,
      };

      naiveContainerRef.current.scrollTop = 0;
      virtualContainerRef.current.scrollTop = 0;

      setState((prev) => ({
        ...prev,
        status: 'complete',
        virtual: virtualResult,
      }));
    },
    [state.rowCount],
  );

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'idle',
      naive: null,
      virtual: null,
    }));
    if (naiveContainerRef.current) naiveContainerRef.current.innerHTML = '';
    if (virtualContainerRef.current) virtualContainerRef.current.innerHTML = '';
  }, []);

  return {
    state,
    setRowCount,
    run,
    reset,
    naiveContainerRef,
    virtualContainerRef,
    rowCounts: ROW_COUNTS,
  };
}
