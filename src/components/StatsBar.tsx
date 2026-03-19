interface Props {
  total: number;
  filtered: number;
  rendered: number;
  loading: boolean;
}

export function StatsBar({ total, filtered, rendered, loading }: Props) {
  return (
    <div className='flex items-center gap-6 px-4 py-2 bg-zinc-900 border-t border-zinc-800 text-xs font-mono text-zinc-600 shrink-0'>
      <span>
        <span className='text-zinc-400'>{total.toLocaleString()}</span> total
        rows
      </span>
      {filtered !== total && (
        <span>
          <span className='text-zinc-400'>{filtered.toLocaleString()}</span>{' '}
          matched
        </span>
      )}
      <span>
        <span className='text-zinc-400'>{rendered}</span> DOM nodes
      </span>
      {loading && (
        <span className='text-zinc-600 animate-pulse'>
          generating 100k rows...
        </span>
      )}
    </div>
  );
}
