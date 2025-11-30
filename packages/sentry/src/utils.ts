/**
 * Shared utility functions for Sentry operations
 */

import type {
  SanitizationOptions,
  UserContext,
  ErrorContext,
  BreadcrumbData,
} from './types';

/**
 * Default sensitive field names to redact
 */
const DEFAULT_SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'api_key',
  'secret',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'authorization',
  'cookie',
  'csrf',
  'xsrf',
  'auth',
  'session',
  'sessionId',
  'session_id',
  'ssn',
  'creditCard',
  'credit_card',
  'cardNumber',
  'card_number',
  'cvv',
  'pin',
];

/**
 * Sanitize error data by removing sensitive information
 */
export function sanitizeErrorData(
  data: unknown,
  options: SanitizationOptions = {}
): unknown {
  const {
    sensitiveFields = DEFAULT_SENSITIVE_FIELDS,
    maxDepth = 10,
    maxStringLength = 1000,
  } = options;

  const seen = new WeakSet();

  function sanitize(value: unknown, depth: number): unknown {
    if (depth > maxDepth) {
      return '[Max Depth Exceeded]';
    }

    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'object' && seen.has(value as object)) {
      return '[Circular Reference]';
    }

    if (typeof value === 'string') {
      if (value.length > maxStringLength) {
        return value.substring(0, maxStringLength) + '... [truncated]';
      }
      return value;
    }

    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint'
    ) {
      return value;
    }

    if (Array.isArray(value)) {
      seen.add(value);
      return value.map((item) => sanitize(item, depth + 1));
    }

    if (typeof value === 'object') {
      seen.add(value);
      const sanitized: Record<string, unknown> = {};

      for (const [key, val] of Object.entries(value)) {
        if (
          sensitiveFields.some((field) =>
            key.toLowerCase().includes(field.toLowerCase())
          )
        ) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitize(val, depth + 1);
        }
      }

      return sanitized;
    }

    return String(value);
  }

  return sanitize(data, 0);
}

/**
 * Create a standardized user context object
 */
export function createUserContext(user: UserContext): UserContext {
  const sanitized: UserContext = {};

  if (user.id) sanitized.id = String(user.id);
  if (user.email) sanitized.email = user.email;
  if (user.username) sanitized.username = user.username;

  const allowedKeys = Object.keys(user).filter(
    (key) =>
      !['password', 'token', 'secret', 'apiKey'].includes(key) &&
      !['id', 'email', 'username', 'ip_address'].includes(key)
  );

  for (const key of allowedKeys) {
    sanitized[key] = user[key];
  }

  return sanitized;
}

/**
 * Create error context with sanitized data
 */
export function createErrorContext(
  context: ErrorContext,
  options?: SanitizationOptions
): ErrorContext {
  return sanitizeErrorData(context, options) as ErrorContext;
}

/**
 * Create a breadcrumb for tracking user actions
 */
export function createBreadcrumb(data: BreadcrumbData): BreadcrumbData {
  return {
    message: data.message,
    category: data.category || 'custom',
    level: data.level || 'info',
    data: data.data ? sanitizeErrorData(data.data) : undefined,
  } as BreadcrumbData;
}

/**
 * Check if error should be ignored based on message patterns
 */
export function shouldIgnoreError(error: Error, ignorePatterns: RegExp[]): boolean {
  const errorMessage = error.message?.toLowerCase() || '';
  const errorName = error.name?.toLowerCase() || '';

  return ignorePatterns.some(
    (pattern) => pattern.test(errorMessage) || pattern.test(errorName)
  );
}

/**
 * Common error patterns to ignore
 */
export const COMMON_IGNORED_ERRORS = [
  /network error/i,
  /failed to fetch/i,
  /load failed/i,
  /cancelled/i,
  /aborted/i,
  /timeout/i,
  /script error/i,
  /extension context invalidated/i,
  /non-error promise rejection/i,
];

/**
 * Extract release version from package.json or environment
 */
export function getRelease(fallback?: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return (
      process.env.NEXT_PUBLIC_APP_VERSION ||
      process.env.APP_VERSION ||
      process.env.npm_package_version ||
      fallback
    );
  }
  return fallback;
}

/**
 * Get current environment
 */
export function getEnvironment(): string {
  if (typeof process !== 'undefined' && process.env) {
    return (
      process.env.NEXT_PUBLIC_ENVIRONMENT ||
      process.env.NODE_ENV ||
      process.env.ENVIRONMENT ||
      'development'
    );
  }
  return 'development';
}

/**
 * Check if Sentry should be enabled
 */
export function shouldEnableSentry(dsn?: string): boolean {
  const environment = getEnvironment();

  if (environment === 'test') {
    return false;
  }

  if (!dsn || dsn === '') {
    return false;
  }

  return true;
}

/**
 * Create tags object from environment
 */
export function createDefaultTags(): Record<string, string> {
  const tags: Record<string, string> = {
    environment: getEnvironment(),
  };

  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NEXT_PUBLIC_APP_NAME) {
      tags.app = process.env.NEXT_PUBLIC_APP_NAME;
    }
    if (process.env.NEXT_PUBLIC_REGION) {
      tags.region = process.env.NEXT_PUBLIC_REGION;
    }
    if (process.env.VERCEL_ENV) {
      tags.vercel_env = process.env.VERCEL_ENV;
    }
  }

  return tags;
}

/**
 * Performance sampling based on environment
 */
export function getTracesSampleRate(environment: string): number {
  switch (environment) {
    case 'production':
      return 0.1;
    case 'staging':
      return 0.5;
    case 'development':
      return 1.0;
    default:
      return 0.1;
  }
}

/**
 * Error sampling based on environment
 */
export function getSampleRate(environment: string): number {
  switch (environment) {
    case 'production':
      return 1.0;
    case 'staging':
      return 1.0;
    case 'development':
      return 1.0;
    default:
      return 1.0;
  }
}
