import type { SortKey, SortState } from '../types';

interface Props {
  sort: SortState;
  onSort: (key: SortKey) => void;
}

interface Column {
  key: SortKey | null;
  label: string;
  width: string;
  sortable: boolean;
}

const COLUMNS: Column[] = [
  { key: 'timestamp', label: 'Timestamp', width: 'w-48', sortable: true },
  { key: 'level', label: 'Level', width: 'w-20', sortable: true },
  { key: null, label: 'Source', width: 'w-36', sortable: false },
  { key: null, label: 'Message', width: 'flex-1', sortable: false },
  { key: 'duration', label: 'Duration', width: 'w-24', sortable: true },
];

export function TableHeader({ sort, onSort }: Props) {
  return (
    <div className='flex items-center gap-4 px-4 py-2 border-b border-zinc-800 bg-zinc-900/60 text-xs font-semibold text-zinc-500 uppercase tracking-wider shrink-0'>
      {COLUMNS.map((col) => (
        <div
          key={col.label}
          className={`${col.width} flex items-center gap-1
            ${col.sortable ? 'cursor-pointer hover:text-zinc-300 select-none transition-colors' : ''}
            ${col.key && sort.key === col.key ? 'text-zinc-300' : ''}
          `}
          onClick={() => col.key && onSort(col.key)}
        >
          {col.label}
          {col.sortable && col.key && (
            <span className='text-zinc-600'>
              {sort.key === col.key
                ? sort.direction === 'asc'
                  ? ' ↑'
                  : ' ↓'
                : ' ↕'}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
