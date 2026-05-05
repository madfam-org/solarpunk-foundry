/**
 * Browser telemetry initialization.
 *
 * Intentionally minimal: just W3C `traceparent` propagation + a manual span
 * helper. This package does NOT bundle `@opentelemetry/instrumentation-fetch`
 * or document-load auto-instrumentation — frontend teams that want those can
 * layer them in themselves. Keeping the bundle small matters more than
 * autoplay convenience for client-side code.
 */

import {
  trace,
  context,
  propagation,
  type Span,
  type SpanOptions,
} from '@opentelemetry/api';
import type { TelemetryConfig, TelemetryHandle } from './types';
import {
  resolveOtlpEndpoint,
  getEnvironment,
  defaultSamplingRatio,
} from './utils';

/**
 * Initialize OTel for a browser app.
 *
 * Wires the W3C trace context propagator and (if an OTLP endpoint is set)
 * a web tracer provider that exports spans via OTLP/HTTP.
 *
 * @example
 * ```ts
 * import { initTelemetry } from '@madfam/telemetry/browser';
 *
 * await initTelemetry({
 *   serviceName: 'pravara-ui',
 *   serviceVersion: process.env.NEXT_PUBLIC_GIT_SHA,
 *   otlpEndpoint: process.env.NEXT_PUBLIC_OTEL_ENDPOINT,
 * });
 * ```
 */
export async function initTelemetry(
  config: TelemetryConfig
): Promise<TelemetryHandle> {
  const endpoint = resolveOtlpEndpoint(config.otlpEndpoint);
  const environment = getEnvironment(config.environment);

  if (!endpoint) {
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log(
        `[@madfam/telemetry] No OTLP endpoint for "${config.serviceName}" (browser). Tracing disabled.`
      );
    }
    return {
      enabled: false,
      shutdown: async () => {
        /* no-op */
      },
    };
  }

  let sdkWeb: typeof import('@opentelemetry/sdk-trace-web');
  let resourcesModule: typeof import('@opentelemetry/resources');
  let semconvModule: typeof import('@opentelemetry/semantic-conventions');
  let exporterModule: typeof import('@opentelemetry/exporter-trace-otlp-http');
  let traceBaseModule: typeof import('@opentelemetry/sdk-trace-base');

  try {
    sdkWeb = await import('@opentelemetry/sdk-trace-web');
    resourcesModule = await import('@opentelemetry/resources');
    semconvModule = await import('@opentelemetry/semantic-conventions');
    exporterModule = await import('@opentelemetry/exporter-trace-otlp-http');
    traceBaseModule = await import('@opentelemetry/sdk-trace-base');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      '[@madfam/telemetry] Browser OTel deps missing. Install ' +
        '@opentelemetry/sdk-trace-web @opentelemetry/sdk-trace-base ' +
        '@opentelemetry/exporter-trace-otlp-http @opentelemetry/resources ' +
        '@opentelemetry/semantic-conventions to enable. ' +
        `Original error: ${(err as Error).message}`
    );
    return {
      enabled: false,
      shutdown: async () => {
        /* no-op */
      },
    };
  }

  const { WebTracerProvider } = sdkWeb;
  const { Resource } = resourcesModule;
  const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = semconvModule;
  const { OTLPTraceExporter } = exporterModule;
  const {
    BatchSpanProcessor,
    ParentBasedSampler,
    TraceIdRatioBasedSampler,
  } = traceBaseModule;

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

  const provider = new WebTracerProvider({
    resource,
    sampler: new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(samplingRatio),
    }),
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });

  provider.register();

  // eslint-disable-next-line no-console
  console.log(
    `[@madfam/telemetry] OTel started for "${config.serviceName}" (browser) → ${endpoint}`
  );

  return {
    enabled: true,
    shutdown: async () => {
      try {
        await provider.shutdown();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(
          `[@madfam/telemetry] Browser shutdown error: ${(err as Error).message}`
        );
      }
    },
  };
}

/**
 * Run `fn` inside an active span. Mirrors the Node-side helper.
 */
export async function withSpan<T>(
  name: string,
  fn: () => Promise<T> | T,
  attributes: Record<string, string | number | boolean> = {},
  options?: SpanOptions
): Promise<T> {
  const tracer = trace.getTracer('@madfam/telemetry');
  return tracer.startActiveSpan(name, options ?? {}, async (span: Span) => {
    try {
      for (const [k, v] of Object.entries(attributes)) {
        span.setAttribute(k, v);
      }
      const result = await fn();
      span.end();
      return result;
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: 2, message: (err as Error).message });
      span.end();
      throw err;
    }
  });
}

export { trace, context, propagation };
