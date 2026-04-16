import pino from 'pino';

const LOG_LEVEL =
  process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

/**
 * Creates a structured JSON logger with base context fields.
 *
 * In development, output is pretty-printed via pino-pretty (must be installed
 * as a devDependency in the consuming project). In production, output is
 * newline-delimited JSON suitable for log aggregation pipelines.
 *
 * @param name  - Logical service name (e.g. "worker:lead-scoring", "web:webhook")
 * @param opts  - Optional overrides (currently just `level`)
 * @returns A pino logger instance with service/environment context
 */
export function createLogger(
  name: string,
  opts?: { level?: string },
): pino.Logger {
  return pino({
    name,
    level: opts?.level || LOG_LEVEL,
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(process.env.NODE_ENV !== 'production' && {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    }),
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    base: {
      service: name,
      env: process.env.NODE_ENV || 'development',
    },
  });
}

export type Logger = pino.Logger;
export { pino };
