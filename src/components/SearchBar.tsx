interface Props {
  onChange: (query: string) => void;
  resultCount: number;
  totalCount: number;
  timing: number | null;
}

export function SearchBar({
  onChange,
  resultCount,
  totalCount,
  timing,
}: Props) {
  return (
    <div className='flex items-center gap-4 px-4 py-3 border-b border-zinc-800 bg-zinc-950'>
      <div className='relative flex-1 max-w-md'>
        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm'>
          ⌕
        </span>
        <input
          type='text'
          placeholder='Filter by message, source, or level...'
          onChange={(e) => onChange(e.target.value)}
          className='w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-8 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors'
        />
      </div>
      <div className='flex items-center gap-3 text-xs font-mono text-zinc-500 shrink-0'>
        <span>
          <span className='text-zinc-300'>{resultCount.toLocaleString()}</span>
          {' / '}
          <span>{totalCount.toLocaleString()}</span>
          {' rows'}
        </span>
        {timing !== null && (
          <span className='text-zinc-600'>
            {timing < 1 ? '<1' : timing.toFixed(1)}ms
          </span>
        )}
      </div>
    </div>
  );
}
