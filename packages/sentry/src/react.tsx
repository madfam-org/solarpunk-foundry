/**
 * React and Next.js Sentry configuration
 */

import React, { Component, type ReactNode, type ErrorInfo } from 'react';
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

let sentryInstance: typeof import('@sentry/react') | null = null;

/**
 * Dynamically import Sentry for React
 */
async function getSentryReact() {
  if (!sentryInstance) {
    try {
      sentryInstance = await import('@sentry/react');
    } catch {
      console.warn('[@madfam/sentry] @sentry/react not installed');
      return null;
    }
  }
  return sentryInstance;
}

/**
 * Initialize Sentry for React applications
 */
export async function initSentryReact(
  config: Partial<SentryConfig> = {}
): Promise<void> {
  const dsn =
    config.dsn ||
    (typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
      : undefined);

  if (!shouldEnableSentry(dsn)) {
    console.log('[@madfam/sentry] Sentry disabled - no DSN or test environment');
    return;
  }

  const Sentry = await getSentryReact();
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
    enableReplay: config.enableReplay ?? environment === 'production',
    replaysOnErrorSampleRate:
      config.replaysOnErrorSampleRate ?? (environment === 'production' ? 1.0 : 0),
    replaysSessionSampleRate:
      config.replaysSessionSampleRate ?? (environment === 'production' ? 0.1 : 0),
    debug: config.debug ?? environment === 'development',
    maxBreadcrumbs: config.maxBreadcrumbs ?? 100,
    attachStacktrace: config.attachStacktrace ?? true,
    autoSessionTracking: config.autoSessionTracking ?? true,
    normalizeDepth: config.normalizeDepth ?? 5,
    tags: {
      ...createDefaultTags(),
      ...(config.tags || {}),
    },
    ignoreErrors: [...(config.ignoreErrors || []), ...COMMON_IGNORED_ERRORS],
  };

  const integrations = [
    Sentry.browserTracingIntegration({
      tracePropagationTargets: ['localhost', /^https:\/\/.*\.madfam\.io/],
    }),
    ...(config.integrations || []),
  ];

  if (defaultConfig.enableReplay) {
    integrations.push(
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
        maskAllInputs: true,
      })
    );
  }

  Sentry.init({
    ...defaultConfig,
    integrations,
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
    `[@madfam/sentry] Initialized for React (${environment}${release ? ` - ${release}` : ''})`
  );
}

/**
 * Get the Sentry instance for React (for advanced usage)
 */
export async function getSentry() {
  return getSentryReact();
}

/**
 * Error Boundary Props
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDialog?: boolean;
  dialogOptions?: {
    title?: string;
    subtitle?: string;
    subtitle2?: string;
    labelName?: string;
    labelEmail?: string;
    labelComments?: string;
    labelClose?: string;
    labelSubmit?: string;
    errorGeneric?: string;
    errorFormEntry?: string;
    successMessage?: string;
  };
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary with Sentry integration
 */
export class SentryErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, showDialog, dialogOptions } = this.props;

    if (onError) {
      onError(error, errorInfo);
    }

    const Sentry = await getSentryReact();
    if (Sentry) {
      Sentry.withScope((scope) => {
        scope.setContext('react_error_info', {
          componentStack: errorInfo.componentStack,
        });
        const eventId = Sentry.captureException(error);

        if (showDialog) {
          Sentry.showReportDialog({
            eventId,
            ...dialogOptions,
          });
        }
      });
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (typeof fallback === 'function') {
        return fallback(error, this.resetError);
      }
      if (fallback) {
        return fallback;
      }

      return (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h2 style={{ color: '#dc2626' }}>Something went wrong</h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            {error.message}
          </p>
          <button
            onClick={this.resetError}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return children;
  }
}

export {
  createUserContext,
  createErrorContext,
  createBreadcrumb,
  sanitizeErrorData,
} from './utils';
