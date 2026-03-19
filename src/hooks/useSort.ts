import { useMemo, useState } from 'react';
import type { LogEntry, SortKey, SortState } from '../types';

export function useSort(data: LogEntry[]) {
  const [sort, setSort] = useState<SortState>({
    key: 'timestamp',
    direction: 'desc',
  });

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      let comparison = 0;
      if (sort.key === 'timestamp') {
        comparison = a.timestamp.localeCompare(b.timestamp);
      } else if (sort.key === 'level') {
        comparison = a.level.localeCompare(b.level);
      } else if (sort.key === 'duration') {
        comparison = a.duration - b.duration;
      }
      return sort.direction === 'asc' ? comparison : -comparison;
    });
    return copy;
  }, [data, sort]);

  const toggle = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'desc' },
    );
  };

  return { sorted, sort, toggle };
}
