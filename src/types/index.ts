export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  duration: number; // ms
}

export type SortKey = 'timestamp' | 'level' | 'duration';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export interface WorkerRequest {
  type: 'GENERATE' | 'FILTER';
  query?: string;
}

export interface WorkerResponse {
  type: 'GENERATED' | 'FILTERED';
  data: LogEntry[];
  timing: number;
}
