/**
 * Shared types for Sentry configuration across the ecosystem
 */

export interface SentryConfig {
  /** Sentry DSN (Data Source Name) */
  dsn: string;

  /** Application environment (development, staging, production) */
  environment: string;

  /** Application release version */
  release?: string;

  /** Sample rate for error events (0.0 to 1.0) */
  sampleRate?: number;

  /** Sample rate for transaction events (0.0 to 1.0) */
  tracesSampleRate?: number;

  /** Enable performance monitoring */
  enablePerformance?: boolean;

  /** Enable session replay */
  enableReplay?: boolean;

  /** Session replay sample rate for errors (0.0 to 1.0) */
  replaysOnErrorSampleRate?: number;

  /** Session replay sample rate for sessions (0.0 to 1.0) */
  replaysSessionSampleRate?: number;

  /** Enable debug mode */
  debug?: boolean;

  /** Tags to attach to all events */
  tags?: Record<string, string>;

  /** Maximum breadcrumbs to capture */
  maxBreadcrumbs?: number;

  /** Attach stack trace to messages */
  attachStacktrace?: boolean;

  /** Enable auto session tracking */
  autoSessionTracking?: boolean;

  /** Normalize URLs in error messages */
  normalizeDepth?: number;

  /** Integrations to enable/disable */
  integrations?: unknown[];

  /** Before send hook for error events */
  beforeSend?: (event: unknown, hint: unknown) => unknown | null;

  /** Before send hook for transaction events */
  beforeSendTransaction?: (event: unknown, hint: unknown) => unknown | null;

  /** Ignore specific errors */
  ignoreErrors?: (string | RegExp)[];

  /** Denied URLs for error tracking */
  denyUrls?: (string | RegExp)[];

  /** Allowed URLs for error tracking */
  allowUrls?: (string | RegExp)[];
}

export interface UserContext {
  /** Unique user identifier */
  id?: string;

  /** User email address */
  email?: string;

  /** Username */
  username?: string;

  /** IP address */
  ip_address?: string;

  /** Additional user data */
  [key: string]: unknown;
}

export interface ErrorContext {
  /** Additional context data */
  [key: string]: unknown;
}

export interface BreadcrumbData {
  /** Breadcrumb message */
  message?: string;

  /** Breadcrumb category */
  category?: string;

  /** Breadcrumb level */
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';

  /** Additional breadcrumb data */
  data?: Record<string, unknown>;
}

export interface SanitizationOptions {
  /** Fields to redact from error data */
  sensitiveFields?: string[];

  /** Maximum depth for error serialization */
  maxDepth?: number;

  /** Maximum string length before truncation */
  maxStringLength?: number;
}
