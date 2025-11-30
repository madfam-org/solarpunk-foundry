/**
 * Node.js and NestJS Sentry configuration
 */

import type { SentryConfig } from './types';
import {
  shouldEnableSentry,
  getEnvironment,
  getRelease,
  createDefaultTags,
  getTracesSampleRate,
  getSampleRate,
  sanitizeErrorData,
  COMMON_IGNORED_ERRORS,
} from './utils';

let sentryInstance: typeof import('@sentry/node') | null = null;

/**
 * Dynamically import Sentry for Node.js
 */
async function getSentryNode() {
  if (!sentryInstance) {
    try {
      sentryInstance = await import('@sentry/node');
    } catch {
      console.warn('[@madfam/sentry] @sentry/node not installed');
      return null;
    }
  }
  return sentryInstance;
}

/**
 * Initialize Sentry for Node.js applications (NestJS, Express, etc.)
 */
export async function initSentryNode(config: Partial<SentryConfig> = {}): Promise<void> {
  const dsn =
    config.dsn ||
    (typeof process !== 'undefined' ? process.env.SENTRY_DSN : undefined);

  if (!shouldEnableSentry(dsn)) {
    console.log('[@madfam/sentry] Sentry disabled - no DSN or test environment');
    return;
  }

  const Sentry = await getSentryNode();
  if (!Sentry) {
    return;
  }

  const environment = config.environment || getEnvironment();
  const release = config.release || getRelease();

  const defaultConfig: Partial<SentryConfig> = {
    dsn,
    environment,
    release,
    sampleRate: config.sampleRate ?? getSampleRate(environment),
    tracesSampleRate: config.tracesSampleRate ?? getTracesSampleRate(environment),
    enablePerformance: config.enablePerformance ?? true,
    debug: config.debug ?? environment === 'development',
    maxBreadcrumbs: config.maxBreadcrumbs ?? 100,
    attachStacktrace: config.attachStacktrace ?? true,
    autoSessionTracking: config.autoSessionTracking ?? true,
    normalizeDepth: config.normalizeDepth ?? 5,
    tags: {
      ...createDefaultTags(),
      ...(config.tags || {}),
    },
    ignoreErrors: [
      ...(config.ignoreErrors || []),
      ...COMMON_IGNORED_ERRORS,
    ],
  };

  Sentry.init({
    ...defaultConfig,
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      Sentry.nodeProfilingIntegration(),
      ...(config.integrations || []),
    ],
    beforeSend: (event, hint) => {
      if (config.beforeSend) {
        event = config.beforeSend(event, hint) as typeof event;
      }

      if (event.request?.data) {
        event.request.data = sanitizeErrorData(event.request.data);
      }
      if (event.contexts) {
        event.contexts = sanitizeErrorData(event.contexts);
      }

      return event;
    },
    beforeSendTransaction: config.beforeSendTransaction,
  } as Parameters<typeof Sentry.init>[0]);

  console.log(
    `[@madfam/sentry] Initialized for Node.js (${environment}${release ? ` - ${release}` : ''})`
  );
}

/**
 * Get the Sentry instance for Node.js (for advanced usage)
 */
export async function getSentry() {
  return getSentryNode();
}

export {
  createUserContext,
  createErrorContext,
  createBreadcrumb,
  sanitizeErrorData,
} from './utils';
