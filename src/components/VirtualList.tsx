import { useRef } from 'react';
import type { LogEntry } from '../types';
import { useVirtualList } from '../hooks/useVirtualList';
import { LogRow } from './LogRow';

const CONTAINER_HEIGHT = 600;

interface Props {
  data: LogEntry[];
}

export function VirtualList({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { virtualItems, totalHeight, onScroll, measureRow } = useVirtualList({
    count: data.length,
    containerHeight: CONTAINER_HEIGHT,
  });

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className='relative overflow-auto bg-zinc-950'
      style={{ height: CONTAINER_HEIGHT }}
    >
      {/* Spacer that gives the scrollbar its full range */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map(({ index, offsetTop }) => (
          <LogRow
            key={data[index].id}
            entry={data[index]}
            offsetTop={offsetTop}
            onMeasure={measureRow}
          />
        ))}
      </div>
    </div>
  );
}
