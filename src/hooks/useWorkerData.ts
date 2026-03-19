import { useCallback, useEffect, useRef, useState } from 'react';
import type { LogEntry, WorkerResponse } from '../types';
import { debounce } from '../utils/debounce';

export function useWorkerData() {
  const [data, setData] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTiming, setFilterTiming] = useState<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const debouncedSearchRef = useRef<((query: unknown) => void) | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL('../data/generate.worker.ts', import.meta.url),
      { type: 'module' },
    );
    workerRef.current = worker;

    debouncedSearchRef.current = debounce((query: unknown) => {
      worker.postMessage({ type: 'FILTER', query });
    }, 300);

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.type === 'GENERATED') {
        setData(e.data.data);
        setLoading(false);
        setFilterTiming(e.data.timing);
      }
      if (e.data.type === 'FILTERED') {
        setData(e.data.data);
        setFilterTiming(e.data.timing);
      }
    };

    worker.postMessage({ type: 'GENERATE' });
    return () => worker.terminate();
  }, []);

  const search = useCallback((query: unknown) => {
    debouncedSearchRef.current?.(query);
  }, []);

  return { data, loading, filterTiming, search };
}
