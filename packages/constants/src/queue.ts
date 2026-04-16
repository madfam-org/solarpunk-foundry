export const QUEUE_DEFAULTS = {
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
  maxStalledCount: 2,
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 1000 },
} as const;

export const QUEUE_CONCURRENCY = 5;
