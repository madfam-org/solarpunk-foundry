import { randomUUID } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';

const requestIdStorage = new AsyncLocalStorage<string>();

/**
 * Returns the correlation/request ID for the current async context,
 * or '-' if called outside a `withRequestId` scope.
 */
export function getRequestId(): string {
  return requestIdStorage.getStore() || '-';
}

/**
 * Runs `fn` inside an async context that carries a correlation ID.
 *
 * Use in Express/Next.js middleware to propagate a request ID through
 * the entire call chain without passing it explicitly:
 *
 * ```ts
 * app.use((req, res, next) => {
 *   const id = req.headers['x-request-id'] as string | undefined;
 *   withRequestId(() => next(), id);
 * });
 * ```
 *
 * @param fn        - The function to execute inside the scoped context
 * @param requestId - Optional explicit ID; a UUID v4 is generated when omitted
 */
export function withRequestId<T>(fn: () => T, requestId?: string): T {
  return requestIdStorage.run(requestId || randomUUID(), fn);
}
