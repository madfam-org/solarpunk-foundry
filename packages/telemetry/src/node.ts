/**
 * Node.js telemetry initialization.
 *
 * Wires the OpenTelemetry SDK with:
 *  - W3C `traceparent` propagation (inbound + outbound)
 *  - OTLP/HTTP trace exporter
 *  - Auto-instrumentation for fetch / http / express / nestjs / pg / redis
 *  - Graceful shutdown on SIGTERM/SIGINT
 *
 * If no OTLP endpoint is configured, this returns a `{ enabled: false }`
 * handle and does not load any SDK dependencies. Callers that use
 * `withSpan` or `trace.getTracer` still work — they fall back to the
 * default no-op tracer from `@opentelemetry/api`.
 */

import { trace, context, propagation } from '@opentelemetry/api';
import type { TelemetryConfig, TelemetryHandle } from './types';
import {
  resolveOtlpEndpoint,
  getEnvironment,
  defaultSamplingRatio,
} from './utils';

/**
 * Initialize OTel for a Node.js service.
 *
 * @example
 * ```ts
 * import { initTelemetry } from '@madfam/telemetry/node';
 *
 * const telemetry = await initTelemetry({
 *   serviceName: 'phyne-crm-api',
 *   serviceVersion: process.env.GIT_SHA,
 *   environment: process.env.NODE_ENV,
 *   otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
 * });
 *
 * process.on('SIGTERM', () => telemetry.shutdown());
 * ```
 */
export async function initTelemetry(
  config: TelemetryConfig
): Promise<TelemetryHandle> {
  const endpoint = resolveOtlpEndpoint(config.otlpEndpoint);
  const environment = getEnvironment(config.environment);

  if (!endpoint) {
    // No-op mode: default tracer from @opentelemetry/api discards spans.
    // We still log so operators can spot the gap in dev.
    if (typeof process !== 'undefined' && process.env?.OTEL_LOG_LEVEL !== 'none') {
      // eslint-disable-next-line no-console
      console.log(
        `[@madfam/telemetry] No OTLP endpoint configured for "${config.serviceName}". Tracing disabled (no-op).`
      );
    }
    return {
      enabled: false,
      shutdown: async () => {
        /* no-op */
      },
    };
  }

  // Lazy-load SDK pieces. Each is an optional peer dep — if any are missing
  // we surface a helpful error instead of a cryptic MODULE_NOT_FOUND.
  let sdkModule: typeof import('@opentelemetry/sdk-node');
  let resourcesModule: typeof import('@opentelemetry/resources');
  let semconvModule: typeof import('@opentelemetry/semantic-conventions');
  let exporterModule: typeof import('@opentelemetry/exporter-trace-otlp-http');
  let traceBaseModule: typeof import('@opentelemetry/sdk-trace-base');
  let autoInstrModule:
    | typeof import('@opentelemetry/auto-instrumentations-node')
    | undefined;

  try {
    sdkModule = await import('@opentelemetry/sdk-node');
    resourcesModule = await import('@opentelemetry/resources');
    semconvModule = await import('@opentelemetry/semantic-conventions');
    exporterModule = await import('@opentelemetry/exporter-trace-otlp-http');
    traceBaseModule = await import('@opentelemetry/sdk-trace-base');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      '[@madfam/telemetry] Required OTel SDK package missing. Install ' +
        '@opentelemetry/sdk-node @opentelemetry/exporter-trace-otlp-http ' +
        '@opentelemetry/resources @opentelemetry/semantic-conventions ' +
        '@opentelemetry/sdk-trace-base alongside @madfam/telemetry. ' +
        `Original error: ${(err as Error).message}`
    );
    return {
      enabled: false,
      shutdown: async () => {
        /* no-op */
      },
    };
  }

  // auto-instrumentation is genuinely optional
  try {
    autoInstrModule = await import('@opentelemetry/auto-instrumentations-node');
  } catch {
    autoInstrModule = undefined;
  }

  const { NodeSDK } = sdkModule;
  const { Resource } = resourcesModule;
  const {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
  } = semconvModule;
  const { OTLPTraceExporter } = exporterModule;
  const { TraceIdRatioBasedSampler, ParentBasedSampler } = traceBaseModule;

  const samplingRatio =
    config.samplingRatio ?? defaultSamplingRatio(environment);

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: config.serviceName,
    ...(config.serviceVersion
      ? { [ATTR_SERVICE_VERSION]: config.serviceVersion }
      : {}),
    'deployment.environment': environment,
    ...(config.resourceAttributes ?? {}),
  });

  const exporter = new OTLPTraceExporter({
    url: endpoint,
    ...(config.otlpHeaders ? { headers: config.otlpHeaders } : {}),
  });

  const sampler = new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(samplingRatio),
  });

  const sdk = new NodeSDK({
    resource,
    sampler,
    traceExporter: exporter,
    instrumentations: autoInstrModule
      ? [autoInstrModule.getNodeAutoInstrumentations()]
      : [],
  });

  sdk.start();

  // eslint-disable-next-line no-console
  console.log(
    `[@madfam/telemetry] OTel started for "${config.serviceName}" → ${endpoint} (env=${environment}, sampling=${samplingRatio})`
  );

  return {
    enabled: true,
    shutdown: async () => {
      try {
        await sdk.shutdown();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(
          `[@madfam/telemetry] Shutdown error: ${(err as Error).message}`
        );
      }
    },
  };
}

/**
 * Run `fn` inside a freshly-started span. Records exceptions on the span
 * and re-throws. Works whether or not the SDK has been initialized — the
 * default tracer simply discards spans.
 */
export async function withSpan<T>(
  name: string,
  fn: () => Promise<T> | T,
  attributes: Record<string, string | number | boolean> = {}
): Promise<T> {
  const tracer = trace.getTracer('@madfam/telemetry');
  return tracer.startActiveSpan(name, async (span) => {
    try {
      for (const [k, v] of Object.entries(attributes)) {
        span.setAttribute(k, v);
      }
      const result = await fn();
      span.end();
      return result;
    } catch (err) {
      span.recordException(err as Error);
      // SpanStatusCode.ERROR === 2, but we avoid pulling the enum import
      // to keep the surface tight.
      span.setStatus({ code: 2, message: (err as Error).message });
      span.end();
      throw err;
    }
  });
}

// Re-export the api symbols consumers most often need so they don't have
// to add @opentelemetry/api as a separate dep.
export { trace, context, propagation };
