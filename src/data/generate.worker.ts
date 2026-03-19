import type {
  LogEntry,
  LogLevel,
  WorkerRequest,
  WorkerResponse,
} from '../types';

const LEVELS: LogLevel[] = ['INFO', 'WARN', 'ERROR', 'DEBUG'];

const SOURCES = [
  'auth-service',
  'api-gateway',
  'db-pool',
  'cache-layer',
  'queue-worker',
  'scheduler',
  'mailer',
  'cdn-proxy',
];

const MESSAGES = [
  'Request completed successfully',
  'Connection pool exhausted, retrying',
  'Cache miss — fetching from origin',
  'JWT validation failed for user',
  'Rate limit exceeded on endpoint',
  'Database query exceeded threshold',
  'Background job completed',
  'Health check passed',
  'Retrying failed request',
  'Unexpected null reference in handler',
  'TLS handshake timeout',
  'Memory usage above warning threshold',
  'Stale session evicted from cache',
  'Config reloaded from environment',
  'Upstream dependency unavailable',
  'Batch processed successfully',
  'Circuit breaker triggered',
  'Graceful shutdown initiated',
  'New deployment detected',
  'Feature flag evaluated',
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEntries(count: number): LogEntry[] {
  const now = Date.now();
  const entries: LogEntry[] = [];

  for (let i = 0; i < count; i++) {
    const level = LEVELS[randomBetween(0, 3)];
    const message = MESSAGES[randomBetween(0, MESSAGES.length - 1)];
    const suffix =
      level === 'ERROR'
        ? ` [code=${randomBetween(400, 503)}]`
        : level === 'WARN'
          ? ` [retries=${randomBetween(1, 5)}]`
          : '';

    entries.push({
      id: i,
      timestamp: new Date(
        now - (count - i) * randomBetween(80, 400),
      ).toISOString(),
      level,
      source: SOURCES[randomBetween(0, SOURCES.length - 1)],
      message: message + suffix,
      duration:
        level === 'ERROR'
          ? randomBetween(800, 5000)
          : level === 'WARN'
            ? randomBetween(200, 800)
            : randomBetween(1, 200),
    });
  }

  return entries;
}

let allEntries: LogEntry[] = [];

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const start = performance.now();

  if (e.data.type === 'GENERATE') {
    allEntries = generateEntries(100_000);
    const response: WorkerResponse = {
      type: 'GENERATED',
      data: allEntries,
      timing: performance.now() - start,
    };
    self.postMessage(response);
  }

  if (e.data.type === 'FILTER') {
    const query = (e.data.query ?? '').toLowerCase().trim();
    const filtered =
      query === ''
        ? allEntries
        : allEntries.filter(
            (entry) =>
              entry.message.toLowerCase().includes(query) ||
              entry.source.toLowerCase().includes(query) ||
              entry.level.toLowerCase().includes(query),
          );
    const response: WorkerResponse = {
      type: 'FILTERED',
      data: filtered,
      timing: performance.now() - start,
    };
    self.postMessage(response);
  }
};
