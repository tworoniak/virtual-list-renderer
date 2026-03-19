import { useEffect } from 'react';
import { useBenchmark } from '../../hooks/useBenchmark';

interface Props {
  open: boolean;
  onClose: () => void;
}

const NAIVE_ROW_HEIGHT = 56;

function renderNaive(container: HTMLElement, count: number) {
  const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
  const sources = ['auth-service', 'api-gateway', 'db-pool', 'cache-layer'];

  container.style.overflowY = 'auto';
  container.style.height = '600px';
  container.style.position = 'relative';

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const row = document.createElement('div');
    row.setAttribute('data-row', String(i));
    row.style.cssText = `
      display: flex; gap: 16px; padding: 10px 16px;
      border-bottom: 1px solid rgba(63,63,70,0.6);
      font-size: 13px; color: #d4d4d8;
    `;
    row.innerHTML = `
      <span style="width:192px;font-family:monospace;font-size:11px;color:#71717a;flex-shrink:0">
        ${new Date(Date.now() - i * 200).toISOString()}
      </span>
      <span style="width:80px;flex-shrink:0;font-size:10px;font-weight:700;font-family:monospace;color:#60a5fa">
        ${levels[i % 4]}
      </span>
      <span style="width:144px;flex-shrink:0;font-family:monospace;font-size:11px;color:#a1a1aa;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
        ${sources[i % 4]}
      </span>
      <span style="flex:1">Log entry message number ${i}</span>
      <span style="width:96px;text-align:right;font-family:monospace;font-size:11px;color:#71717a;flex-shrink:0">
        ${Math.floor(Math.random() * 500)}ms
      </span>
    `;
    fragment.appendChild(row);
  }
  container.appendChild(fragment);
}

function renderVirtual(container: HTMLElement, count: number) {
  const VISIBLE = Math.ceil(600 / NAIVE_ROW_HEIGHT) + 10; // overscan
  const totalHeight = count * NAIVE_ROW_HEIGHT;
  const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
  const sources = ['auth-service', 'api-gateway', 'db-pool', 'cache-layer'];

  container.style.overflowY = 'auto';
  container.style.height = '600px';
  container.style.position = 'relative';

  const inner = document.createElement('div');
  inner.style.cssText = `height:${totalHeight}px;position:relative;`;

  for (let i = 0; i < Math.min(VISIBLE, count); i++) {
    const row = document.createElement('div');
    row.setAttribute('data-row', String(i));
    row.style.cssText = `
      position:absolute; left:0; right:0; top:${i * NAIVE_ROW_HEIGHT}px;
      display:flex; gap:16px; padding:10px 16px;
      border-bottom:1px solid rgba(63,63,70,0.6);
      font-size:13px; color:#d4d4d8;
    `;
    row.innerHTML = `
      <span style="width:192px;font-family:monospace;font-size:11px;color:#71717a;flex-shrink:0">
        ${new Date(Date.now() - i * 200).toISOString()}
      </span>
      <span style="width:80px;flex-shrink:0;font-size:10px;font-weight:700;font-family:monospace;color:#60a5fa">
        ${levels[i % 4]}
      </span>
      <span style="width:144px;flex-shrink:0;font-family:monospace;font-size:11px;color:#a1a1aa;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
        ${sources[i % 4]}
      </span>
      <span style="flex:1">Log entry message number ${i}</span>
      <span style="width:96px;text-align:right;font-family:monospace;font-size:11px;color:#71717a;flex-shrink:0">
        ${Math.floor(Math.random() * 500)}ms
      </span>
    `;
    inner.appendChild(row);
  }

  container.appendChild(inner);
}

function MetricCard({
  label,
  naive,
  virtual,
  unit,
  lowerIsBetter = true,
  format,
}: {
  label: string;
  naive: number | null;
  virtual: number | null;
  unit: string;
  lowerIsBetter?: boolean;
  format?: (n: number) => string;
}) {
  const fmt = format ?? ((n: number) => n.toLocaleString());
  const naiveWins =
    naive !== null &&
    virtual !== null &&
    (lowerIsBetter ? naive < virtual : naive > virtual);
  const virtualWins =
    naive !== null &&
    virtual !== null &&
    (lowerIsBetter ? virtual < naive : virtual > naive);

  return (
    <div className='flex flex-col gap-3 p-4 bg-zinc-900 rounded-xl border border-zinc-800'>
      <span className='text-xs font-semibold text-zinc-500 uppercase tracking-wider'>
        {label}
      </span>
      <div className='grid grid-cols-2 gap-3'>
        <div
          className={`flex flex-col gap-1 p-3 rounded-lg border ${naiveWins ? 'border-emerald-800 bg-emerald-950/30' : 'border-zinc-700 bg-zinc-800/40'}`}
        >
          <span className='text-[10px] text-zinc-500 font-mono uppercase'>
            Naïve
          </span>
          <span
            className={`text-xl font-bold font-mono tabular-nums ${naiveWins ? 'text-emerald-400' : 'text-zinc-300'}`}
          >
            {naive !== null ? fmt(naive) : '—'}
            <span className='text-xs font-normal text-zinc-500 ml-1'>
              {unit}
            </span>
          </span>
        </div>
        <div
          className={`flex flex-col gap-1 p-3 rounded-lg border ${virtualWins ? 'border-blue-800 bg-blue-950/30' : 'border-zinc-700 bg-zinc-800/40'}`}
        >
          <span className='text-[10px] text-zinc-500 font-mono uppercase'>
            Virtual
          </span>
          <span
            className={`text-xl font-bold font-mono tabular-nums ${virtualWins ? 'text-blue-400' : 'text-zinc-300'}`}
          >
            {virtual !== null ? fmt(virtual) : '—'}
            <span className='text-xs font-normal text-zinc-500 ml-1'>
              {unit}
            </span>
          </span>
        </div>
      </div>
      {naive !== null && virtual !== null && (
        <div className='text-xs text-zinc-500 font-mono'>
          {lowerIsBetter ? (
            naive > virtual ? (
              <span className='text-blue-400'>
                Virtual is {(naive / virtual).toFixed(1)}× faster
              </span>
            ) : (
              <span className='text-emerald-400'>
                Naïve is {(virtual / naive).toFixed(1)}× faster
              </span>
            )
          ) : virtual > naive ? (
            <span className='text-blue-400'>
              Virtual scores {(virtual / naive).toFixed(1)}× higher
            </span>
          ) : (
            <span className='text-emerald-400'>
              Naïve scores {(naive / virtual).toFixed(1)}× higher
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function BenchmarkDrawer({ open, onClose }: Props) {
  const {
    state,
    setRowCount,
    run,
    reset,
    naiveContainerRef,
    virtualContainerRef,
    rowCounts,
  } = useBenchmark();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const isRunning =
    state.status === 'running-naive' || state.status === 'running-virtual';

  return (
    <div className='fixed inset-0 z-50 flex'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Drawer */}
      <div className='relative ml-auto w-full max-w-2xl h-full bg-zinc-950 flex flex-col shadow-2xl border-l border-zinc-800 overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0 sticky top-0 bg-zinc-950 z-10'>
          <div>
            <h2 className='text-sm font-bold text-zinc-100'>Benchmark</h2>
            <p className='text-xs text-zinc-500 mt-0.5'>
              Naïve rendering vs. virtual rendering
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-zinc-500 hover:text-zinc-300 transition-colors text-xl leading-none cursor-pointer'
          >
            ×
          </button>
        </div>

        <div className='flex flex-col gap-6 p-6'>
          {/* Row count selector */}
          <div className='flex flex-col gap-3'>
            <span className='text-xs font-semibold text-zinc-500 uppercase tracking-wider'>
              Row Count
            </span>
            <div className='flex gap-2'>
              {rowCounts.map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    setRowCount(count);
                    reset();
                  }}
                  disabled={isRunning}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer
                    ${
                      state.rowCount === count
                        ? 'bg-blue-950 border-blue-700 text-blue-300'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {count.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className='text-xs text-zinc-500 leading-relaxed bg-zinc-900/60 rounded-xl p-4 border border-zinc-800'>
            <p>
              <span className='text-zinc-300 font-semibold'>Naïve</span> renders
              all {state.rowCount.toLocaleString()} rows directly into the DOM
              using a document fragment.
            </p>
            <p className='mt-1'>
              <span className='text-zinc-300 font-semibold'>Virtual</span>{' '}
              renders only the ~{Math.ceil(600 / 56) + 10} visible rows using
              the engine built for this project.
            </p>
            <p className='mt-1'>
              Both use identical vanilla DOM construction — no React — to
              isolate the rendering strategy as the only variable.
            </p>
          </div>

          {/* Run button */}
          <button
            onClick={() => run(renderNaive, renderVirtual)}
            disabled={isRunning}
            className='w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed'
          >
            {isRunning
              ? state.status === 'running-naive'
                ? '⏱ Running naïve render...'
                : '⏱ Running virtual render...'
              : state.status === 'complete'
                ? 'Run Again'
                : 'Run Benchmark'}
          </button>

          {/* Progress indicator */}
          {isRunning && (
            <div className='flex items-center gap-3'>
              <div className='flex gap-1.5'>
                <div
                  className={`w-2 h-2 rounded-full ${state.status === 'running-naive' ? 'bg-blue-400 animate-pulse' : state.naive ? 'bg-emerald-400' : 'bg-zinc-700'}`}
                />
                <div
                  className={`w-2 h-2 rounded-full ${state.status === 'running-virtual' ? 'bg-blue-400 animate-pulse' : state.virtual ? 'bg-emerald-400' : 'bg-zinc-700'}`}
                />
              </div>
              <span className='text-xs text-zinc-500 font-mono'>
                {state.status === 'running-naive'
                  ? 'Step 1/2 — naïve render + scroll test'
                  : 'Step 2/2 — virtual render + scroll test'}
              </span>
            </div>
          )}

          {/* Results */}
          {(state.naive || state.virtual) && (
            <div className='flex flex-col gap-3'>
              <span className='text-xs font-semibold text-zinc-500 uppercase tracking-wider'>
                Results — {state.rowCount.toLocaleString()} rows
              </span>
              <MetricCard
                label='Render Time'
                naive={state.naive?.renderTime ?? null}
                virtual={state.virtual?.renderTime ?? null}
                unit='ms'
                lowerIsBetter
                format={(n) => n.toFixed(1)}
              />
              <MetricCard
                label='DOM Nodes'
                naive={state.naive?.domNodes ?? null}
                virtual={state.virtual?.domNodes ?? null}
                unit='nodes'
                lowerIsBetter
              />
              <MetricCard
                label='Scroll FPS'
                naive={state.naive?.scrollFPS ?? null}
                virtual={state.virtual?.scrollFPS ?? null}
                unit='fps'
                lowerIsBetter={false}
              />
              {(state.naive?.memoryMB || state.virtual?.memoryMB) && (
                <MetricCard
                  label='JS Heap (Chrome only)'
                  naive={state.naive?.memoryMB ?? null}
                  virtual={state.virtual?.memoryMB ?? null}
                  unit='MB'
                  lowerIsBetter
                />
              )}
            </div>
          )}

          {/* Hidden render containers */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs text-zinc-600 font-mono'>
              Render containers (benchmark runs here)
            </span>
            <div className='grid grid-cols-2 gap-2'>
              <div className='flex flex-col gap-1'>
                <span className='text-[10px] text-zinc-600 font-mono uppercase'>
                  Naïve
                </span>
                <div
                  ref={naiveContainerRef}
                  className='border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950'
                  style={{ height: 200 }}
                />
              </div>
              <div className='flex flex-col gap-1'>
                <span className='text-[10px] text-zinc-600 font-mono uppercase'>
                  Virtual
                </span>
                <div
                  ref={virtualContainerRef}
                  className='border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950'
                  style={{ height: 200 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
