import { useCallback, useState } from 'react';
import { useWorkerData } from './hooks/useWorkerData';
import { useSort } from './hooks/useSort';
import { VirtualList } from './components/VirtualList';
import { TableHeader } from './components/TableHeader';
import { SearchBar } from './components/SearchBar';
import { StatsBar } from './components/StatsBar';
import { FPSOverlay } from './components/FPSOverlay';
import { BenchmarkDrawer } from './components/benchmark/BenchmarkDrawer';

const TOTAL_ROWS = 100_000;

export default function App() {
  const { data, loading, filterTiming, search } = useWorkerData();
  const { sorted, sort, toggle } = useSort(data);
  const [benchmarkOpen, setBenchmarkOpen] = useState(false);

  const handleSearch = useCallback(
    (query: string) => {
      search(query);
    },
    [search],
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-200 flex flex-col font-sans'>
      {/* Header */}
      <header className='px-6 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0'>
        <div>
          <h1 className='text-lg font-bold text-zinc-100 tracking-tight'>
            Virtual List Renderer
          </h1>
          <p className='text-xs text-zinc-500 mt-0.5'>
            Built from scratch · no react-window · {TOTAL_ROWS.toLocaleString()}{' '}
            rows
          </p>
        </div>
        <div className='flex items-center gap-3 text-xs font-mono'>
          <span className='px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-400'>
            Variable heights
          </span>
          <span className='px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-400'>
            Binary search scroll
          </span>
          <span className='px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-400'>
            Web Worker data
          </span>
          <button
            onClick={() => setBenchmarkOpen(true)}
            className='px-3 py-1.5 text-xs font-medium rounded-lg border bg-blue-950 text-blue-300 border-blue-800 hover:bg-blue-900 transition-all cursor-pointer'
          >
            Run Benchmark
          </button>
        </div>
      </header>

      {/* Search */}
      <SearchBar
        onChange={handleSearch}
        resultCount={data.length}
        totalCount={TOTAL_ROWS}
        timing={filterTiming}
      />

      {/* Table */}
      <div className='flex-1 flex flex-col min-h-0 border-b border-zinc-800'>
        <TableHeader sort={sort} onSort={toggle} />
        {loading ? (
          <div className='flex-1 flex items-center justify-center text-zinc-600 text-sm font-mono animate-pulse'>
            Generating 100,000 log entries in Web Worker...
          </div>
        ) : (
          <VirtualList data={sorted} />
        )}
      </div>

      {/* Stats */}
      <StatsBar
        total={TOTAL_ROWS}
        filtered={data.length}
        rendered={Math.min(data.length, 20)}
        loading={loading}
      />

      {/* FPS Overlay */}
      <FPSOverlay />

      {/* Benchmark Drawer */}
      <BenchmarkDrawer
        open={benchmarkOpen}
        onClose={() => setBenchmarkOpen(false)}
      />
    </div>
  );
}
