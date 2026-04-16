/**
 * Ambient type declaration for @madfam/sentry.
 * This package is an optional peer dependency -- dynamic imports
 * are always wrapped in .catch() for graceful fallback.
 */
declare module '@madfam/sentry' {
  export function captureError(error: Error, context?: Record<string, unknown>): void;
  export function captureException(error: Error, context?: Record<string, unknown>): void;
}
