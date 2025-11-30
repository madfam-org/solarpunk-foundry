/**
 * @madfam/sentry - Shared Sentry configuration for the MADFAM/Solarpunk ecosystem
 *
 * This package provides unified Sentry error tracking and performance monitoring
 * configuration for both Node.js (NestJS, Express) and React (Next.js) applications.
 *
 * @example Node.js / NestJS
 * ```typescript
 * import { initSentryNode } from '@madfam/sentry/node';
 *
 * await initSentryNode({
 *   dsn: process.env.SENTRY_DSN,
 *   environment: 'production',
 * });
 * ```
 *
 * @example React / Next.js
 * ```typescript
 * import { initSentryReact } from '@madfam/sentry/react';
 *
 * await initSentryReact({
 *   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
 *   enableReplay: true,
 * });
 * ```
 */

export type {
  SentryConfig,
  UserContext,
  ErrorContext,
  BreadcrumbData,
  SanitizationOptions,
} from './types';

export {
  sanitizeErrorData,
  createUserContext,
  createErrorContext,
  createBreadcrumb,
  shouldIgnoreError,
  shouldEnableSentry,
  getRelease,
  getEnvironment,
  createDefaultTags,
  getTracesSampleRate,
  getSampleRate,
  COMMON_IGNORED_ERRORS,
} from './utils';
