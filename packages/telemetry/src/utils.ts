/**
 * Environment + config helpers shared between Node and browser entrypoints.
 */

/**
 * Resolve OTLP endpoint from explicit config or standard OTel env vars.
 * Returns `undefined` if nothing is configured (caller should no-op).
 */
export function resolveOtlpEndpoint(explicit?: string): string | undefined {
  if (explicit && explicit.length > 0) return explicit;

  if (typeof process !== 'undefined' && process.env) {
    const fromEnv =
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    if (fromEnv && fromEnv.length > 0) return fromEnv;
  }

  return undefined;
}

/**
 * Detect environment for default sampling rate decisions.
 */
export function getEnvironment(explicit?: string): string {
  if (explicit && explicit.length > 0) return explicit;

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
 * Default sampling ratio per environment. Production samples at 10% to
 * keep collector load bounded; non-prod at 100% for full visibility.
 */
export function defaultSamplingRatio(environment: string): number {
  switch (environment) {
    case 'production':
      return 0.1;
    case 'staging':
      return 0.5;
    default:
      return 1.0;
  }
}
