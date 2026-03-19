import { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';

interface Props {
  entry: LogEntry;
  offsetTop: number;
  onMeasure: (index: number, height: number) => void;
}

const levelStyles: Record<LogEntry['level'], string> = {
  INFO: 'text-blue-400  bg-blue-950/40  border-blue-800/50',
  WARN: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/50',
  ERROR: 'text-red-400   bg-red-950/40   border-red-800/50',
  DEBUG: 'text-zinc-500  bg-zinc-900/40  border-zinc-700/50',
};

const rowAccent: Record<LogEntry['level'], string> = {
  INFO: '',
  WARN: 'bg-yellow-950/10',
  ERROR: 'bg-red-950/20',
  DEBUG: '',
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString('en-US', { hour12: false })}.${String(d.getMilliseconds()).padStart(3, '0')}`;
}

export function LogRow({ entry, offsetTop, onMeasure }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rowRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const e of entries) {
        onMeasure(entry.id, e.contentRect.height);
      }
    });
    observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, [entry.id, onMeasure]);

  return (
    <div
      ref={rowRef}
      className={`absolute left-0 right-0 flex items-start gap-4 px-4 py-2.5 border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors ${rowAccent[entry.level]}`}
      style={{ top: offsetTop }}
    >
      {/* Timestamp */}
      <div className='w-48 shrink-0 font-mono text-xs text-zinc-500 pt-0.5'>
        {formatTimestamp(entry.timestamp)}
      </div>

      {/* Level badge */}
      <div className='w-20 shrink-0'>
        <span
          className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${levelStyles[entry.level]}`}
        >
          {entry.level}
        </span>
      </div>

      {/* Source */}
      <div className='w-36 shrink-0 font-mono text-xs text-zinc-400 truncate pt-0.5'>
        {entry.source}
      </div>

      {/* Message — wraps to create variable height */}
      <div className='flex-1 text-sm text-zinc-300 leading-relaxed wrap-break-word min-w-0'>
        {entry.message}
      </div>

      {/* Duration */}
      <div
        className={`w-24 shrink-0 text-right font-mono text-xs pt-0.5
        ${
          entry.duration > 800
            ? 'text-red-400'
            : entry.duration > 200
              ? 'text-yellow-400'
              : 'text-zinc-500'
        }`}
      >
        {entry.duration.toLocaleString()}ms
      </div>
    </div>
  );
}
