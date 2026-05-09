# @madfam/telemetry

Shared OpenTelemetry tracing + W3C `traceparent` propagation for every MADFAM service. One `import`, one `init` call, every request gets a trace ID that follows it across service boundaries.

This package exists because the 2026-05-04 enclii provisioning audit scored telemetry at **1/5**: zero deployments propagated W3C trace context, despite §IV-3 of `solarpunk-foundry/CLAUDE.md` mandating it across every service.

## What this is

- **Single entry point** — `initTelemetry({ serviceName, otlpEndpoint })` and you're done.
- **Auto-instrumentation (Node)** — fetch, http, express, NestJS, pg, redis, ioredis, mysql2, undici (via `@opentelemetry/auto-instrumentations-node`).
- **W3C trace context propagation** — `traceparent` injected on every outbound request, extracted from every inbound one. This is what makes a single trace span Janua → service A → service B → Postgres.
- **OTLP/HTTP exporter** — points at any OTel collector (Tempo, Honeycomb, Datadog Agent, Grafana Cloud, your in-house collector).
- **Graceful no-op** — if `otlpEndpoint` is unset, the SDK never starts. Your code keeps working; spans simply discard.

## What this is NOT

- **Not metrics.** No counters, histograms, or gauges. If you need application metrics, use Prometheus/`prom-client` directly. That's a separate observability axis.
- **Not logging.** Use `@madfam/logging` (pino) for structured logs. Logs and traces correlate via the trace ID surfaced by the OTel API; you do not log through this package.
- **Not error tracking.** Use `@madfam/sentry` for that. OTel spans record exceptions for trace-level visibility, but Sentry is the canonical error sink.
- **Not browser auto-instrumentation.** The browser entrypoint deliberately ships only W3C propagation + a manual `withSpan` helper. Frontend teams that want fetch/document-load auto-instrumentation can layer in `@opentelemetry/instrumentation-fetch` themselves — keeping the bundle small matters more than autoplay convenience client-side.

## Install

```bash
pnpm add @madfam/telemetry --registry=https://npm.madfam.io
```

Plus the OTel SDK pieces you need (peer deps — declared optional so browser-only and Node-only consumers don't pull each other's stack):

```bash
# Node services (the dominant case)
pnpm add \
  @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/resources \
  @opentelemetry/sdk-trace-base \
  @opentelemetry/semantic-conventions

# Browser apps
pnpm add \
  @opentelemetry/sdk-trace-web \
  @opentelemetry/sdk-trace-base \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/resources \
  @opentelemetry/semantic-conventions
```

OpenTelemetry SDK packages **break across minor versions**. This package pins to the 1.30.x trace SDK line and 0.57.x exporter/SDK-Node line. Stay on those ranges unless you have a reason.

## Usage — Node / NestJS / Express

```ts
// main.ts (run BEFORE app bootstrap so auto-instrumentation hooks first)
import { initTelemetry } from '@madfam/telemetry';

const telemetry = await initTelemetry({
  serviceName: 'phynd-crm-api',
  serviceVersion: process.env.GIT_SHA,
  environment: process.env.NODE_ENV,
  otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
});

process.on('SIGTERM', () => telemetry.shutdown());

// ...then bootstrap NestFactory / express() / fastify() as normal.
```

That's it. Every inbound HTTP request now carries a span; every outbound `fetch` / `http` / `pg` query is a child span; `traceparent` is injected on every outbound HTTP request.

## Usage — Next.js (instrumentation.ts)

```ts
// instrumentation.ts at repo root
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initTelemetry } = await import('@madfam/telemetry');
    await initTelemetry({
      serviceName: 'pravara-landing',
      serviceVersion: process.env.NEXT_PUBLIC_GIT_SHA,
      otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    });
  }
}
```

Set `experimental.instrumentationHook = true` in `next.config.js` for Next 13. Next 14+ enables it by default.

## Usage — Browser

```ts
import { initTelemetry, withSpan } from '@madfam/telemetry/browser';

await initTelemetry({
  serviceName: 'pravara-ui',
  otlpEndpoint: process.env.NEXT_PUBLIC_OTEL_ENDPOINT,
});

// Manual span around a critical UI flow
await withSpan('checkout.submit', async () => {
  await fetch('/api/checkout', { method: 'POST', body: JSON.stringify(cart) });
});
```

## Usage — Manual spans (anywhere)

```ts
import { withSpan, trace } from '@madfam/telemetry';

const result = await withSpan(
  'payment.process',
  async () => processPayment(order),
  { 'payment.method': 'card', 'order.total_cents': order.totalCents }
);

// Or grab the tracer directly
const tracer = trace.getTracer('phynd-crm-api');
const span = tracer.startSpan('cleanup-task');
// ... work ...
span.end();
```

## API

### `initTelemetry(opts: TelemetryConfig): Promise<TelemetryHandle>`

| Option | Type | Description |
|---|---|---|
| `serviceName` | `string` (required) | Surfaces as `service.name` resource attribute. |
| `serviceVersion` | `string` | Git SHA / image tag / semver. `service.version`. |
| `environment` | `string` | `deployment.environment`. Defaults to `NODE_ENV`. |
| `otlpEndpoint` | `string` | OTLP/HTTP collector URL. If unset, falls back to `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` then `OTEL_EXPORTER_OTLP_ENDPOINT`. If still unset, no-op. |
| `otlpHeaders` | `Record<string, string>` | Auth headers etc. for the exporter. |
| `samplingRatio` | `number` | 0.0–1.0. Defaults to 0.1 in production, 0.5 in staging, 1.0 in development. |
| `resourceAttributes` | `Record<string, string>` | Extra resource attributes attached to every span. |

Returns a handle: `{ enabled: boolean; shutdown: () => Promise<void> }`. Always wire `shutdown` to SIGTERM.

### `withSpan(name, fn, attributes?): Promise<T>`

Wraps `fn` in an active span. Records exceptions and re-throws. Safe to use before `initTelemetry` resolves (spans flow into the no-op tracer until then).

### `trace`, `context`, `propagation`

Re-exports from `@opentelemetry/api` so consumers don't add it as a separate dep.

## Environment variables

This package honors the standard OTel env vars when config fields are not set explicitly:

| Var | Purpose |
|---|---|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Collector base URL. |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` | Per-signal override (preferred over the generic var). |
| `NODE_ENV` / `NEXT_PUBLIC_ENVIRONMENT` | Default environment. |
| `OTEL_LOG_LEVEL=none` | Silences the "tracing disabled" startup log in dev. |

## License

MIT - MADFAM
