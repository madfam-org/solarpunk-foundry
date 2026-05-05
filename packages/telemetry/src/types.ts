/**
 * Shared types for @madfam/telemetry
 */

export interface TelemetryConfig {
  /**
   * Logical service name. Surfaces as `service.name` resource attribute.
   * @example "phyne-crm-api", "fortuna-worker"
   */
  serviceName: string;

  /**
   * Service version (semver, git sha, image tag — anything stable per release).
   * Surfaces as `service.version` resource attribute.
   */
  serviceVersion?: string;

  /**
   * Deployment environment. Surfaces as `deployment.environment` resource
   * attribute. Defaults to NODE_ENV or "development".
   */
  environment?: string;

  /**
   * OTLP/HTTP collector endpoint. Example:
   *   "https://otel.madfam.io/v1/traces"
   *
   * If unset and OTEL_EXPORTER_OTLP_ENDPOINT env var is also unset, the SDK
   * is **not** initialized. `withSpan` and helpers degrade to no-ops via the
   * @opentelemetry/api default tracer.
   */
  otlpEndpoint?: string;

  /**
   * Optional headers for the OTLP exporter (e.g. auth tokens).
   */
  otlpHeaders?: Record<string, string>;

  /**
   * Sampling ratio (0.0 - 1.0). Defaults to 1.0 in non-prod, 0.1 in prod.
   */
  samplingRatio?: number;

  /**
   * Extra resource attributes to attach to every span.
   */
  resourceAttributes?: Record<string, string>;
}

/**
 * Lightweight telemetry handle returned by `initTelemetry`.
 * Holds a `shutdown` for graceful drain on SIGTERM.
 */
export interface TelemetryHandle {
  /**
   * `true` if the SDK was actually started (i.e. an OTLP endpoint was
   * configured). `false` means we are in no-op mode and traces flow through
   * the default tracer (which discards spans).
   */
  enabled: boolean;

  /**
   * Drain pending spans and stop the SDK. Safe to call when `enabled` is
   * `false` (resolves immediately).
   */
  shutdown: () => Promise<void>;
}
