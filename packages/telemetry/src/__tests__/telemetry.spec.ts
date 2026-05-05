import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  context,
  defaultTextMapGetter,
  defaultTextMapSetter,
  propagation,
  trace,
} from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { initTelemetry, withSpan } from '../node';
import {
  defaultSamplingRatio,
  getEnvironment,
  resolveOtlpEndpoint,
} from '../utils';

describe('@madfam/telemetry — utils', () => {
  it('resolveOtlpEndpoint returns explicit value when provided', () => {
    expect(resolveOtlpEndpoint('https://otel.madfam.io/v1/traces')).toBe(
      'https://otel.madfam.io/v1/traces'
    );
  });

  it('resolveOtlpEndpoint falls back to OTEL_EXPORTER_OTLP_ENDPOINT', () => {
    const prev = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'https://from-env.example/v1';
    try {
      expect(resolveOtlpEndpoint(undefined)).toBe(
        'https://from-env.example/v1'
      );
    } finally {
      if (prev === undefined) delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
      else process.env.OTEL_EXPORTER_OTLP_ENDPOINT = prev;
    }
  });

  it('resolveOtlpEndpoint returns undefined when nothing is set', () => {
    const prev1 = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    const prev2 = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    delete process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
    try {
      expect(resolveOtlpEndpoint(undefined)).toBeUndefined();
      expect(resolveOtlpEndpoint('')).toBeUndefined();
    } finally {
      if (prev1 !== undefined) process.env.OTEL_EXPORTER_OTLP_ENDPOINT = prev1;
      if (prev2 !== undefined)
        process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = prev2;
    }
  });

  it('defaultSamplingRatio is environment-aware', () => {
    expect(defaultSamplingRatio('production')).toBe(0.1);
    expect(defaultSamplingRatio('staging')).toBe(0.5);
    expect(defaultSamplingRatio('development')).toBe(1.0);
    expect(defaultSamplingRatio('something-else')).toBe(1.0);
  });

  it('getEnvironment prefers explicit value', () => {
    expect(getEnvironment('production')).toBe('production');
  });
});

describe('@madfam/telemetry — initTelemetry no-op path', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('returns disabled handle when no OTLP endpoint is configured', async () => {
    const prev1 = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    const prev2 = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    delete process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;

    try {
      const handle = await initTelemetry({ serviceName: 'unit-test' });
      expect(handle.enabled).toBe(false);
      // shutdown must be safe to call in no-op mode
      await expect(handle.shutdown()).resolves.toBeUndefined();
    } finally {
      if (prev1 !== undefined) process.env.OTEL_EXPORTER_OTLP_ENDPOINT = prev1;
      if (prev2 !== undefined)
        process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = prev2;
    }
  });

  it('does not crash on init with empty endpoint string', async () => {
    const handle = await initTelemetry({
      serviceName: 'unit-test',
      otlpEndpoint: '',
    });
    expect(handle.enabled).toBe(false);
  });
});

describe('@madfam/telemetry — withSpan', () => {
  it('returns the wrapped function value', async () => {
    const result = await withSpan('test.span', async () => 42);
    expect(result).toBe(42);
  });

  it('propagates synchronous return value', async () => {
    const result = await withSpan('test.sync', () => 'ok');
    expect(result).toBe('ok');
  });

  it('re-throws errors from the wrapped function', async () => {
    await expect(
      withSpan('test.error', async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');
  });

  it('passes attributes without throwing (no-op tracer accepts setAttribute)', async () => {
    const result = await withSpan(
      'test.attrs',
      async () => 'value',
      { 'http.method': 'GET', 'http.status_code': 200 }
    );
    expect(result).toBe('value');
  });
});

describe('@madfam/telemetry — W3C trace context propagation', () => {
  beforeEach(() => {
    propagation.setGlobalPropagator(new W3CTraceContextPropagator());
  });

  it('inject + extract round-trips a traceparent across the carrier', () => {
    // Build a context that holds a non-recording span with a known span context
    const spanContext = {
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
      spanId: '00f067aa0ba902b7',
      traceFlags: 1,
      isRemote: false,
    };
    const ctx = trace.setSpanContext(context.active(), spanContext);

    const carrier: Record<string, string> = {};
    propagation.inject(ctx, carrier, defaultTextMapSetter);

    expect(carrier.traceparent).toBeDefined();
    expect(carrier.traceparent).toMatch(
      /^00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01$/
    );

    const extractedCtx = propagation.extract(
      context.active(),
      carrier,
      defaultTextMapGetter
    );
    const extractedSpan = trace.getSpanContext(extractedCtx);
    expect(extractedSpan?.traceId).toBe(spanContext.traceId);
    expect(extractedSpan?.spanId).toBe(spanContext.spanId);
  });

  it('extract from missing carrier yields no span context', () => {
    const ctx = propagation.extract(
      context.active(),
      {},
      defaultTextMapGetter
    );
    expect(trace.getSpanContext(ctx)).toBeUndefined();
  });
});
