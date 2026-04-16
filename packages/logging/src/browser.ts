type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (typeof window !== 'undefined' && (window as any).__LOG_LEVEL__) ||
  (process.env.NODE_ENV === 'production' ? 'warn' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

/**
 * Lightweight browser-safe logger that writes to the console.
 *
 * Log level defaults to 'warn' in production, 'debug' otherwise.
 * Override at runtime by setting `window.__LOG_LEVEL__` before first import.
 *
 * @param name - Prefix shown in every log line, e.g. "[MyComponent]"
 */
export function createBrowserLogger(name: string) {
  const prefix = `[${name}]`;
  return {
    debug: (...args: unknown[]) =>
      shouldLog('debug') && console.debug(prefix, ...args),
    info: (...args: unknown[]) =>
      shouldLog('info') && console.info(prefix, ...args),
    warn: (...args: unknown[]) =>
      shouldLog('warn') && console.warn(prefix, ...args),
    error: (...args: unknown[]) =>
      shouldLog('error') && console.error(prefix, ...args),
  };
}

export type BrowserLogger = ReturnType<typeof createBrowserLogger>;
