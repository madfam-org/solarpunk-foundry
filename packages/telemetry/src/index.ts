/**
 * @madfam/telemetry — Shared OpenTelemetry tracing for the MADFAM ecosystem.
 *
 * Default entrypoint targets Node services (the dominant consumer). Browser
 * apps should `import` from `@madfam/telemetry/browser` instead.
 *
 * @example Node / NestJS / Express / Fastify
 * ```ts
 * import { initTelemetry } from '@madfam/telemetry';
 *
 * const t = await initTelemetry({
 *   serviceName: 'phyne-crm-api',
 *   environment: process.env.NODE_ENV,
 *   otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
 * });
 *
 * process.on('SIGTERM', () => t.shutdown());
 * ```
 *
 * @example Next.js (instrumentation.ts)
 * ```ts
 * export async function register() {
 *   if (process.env.NEXT_RUNTIME === 'nodejs') {
 *     const { initTelemetry } = await import('@madfam/telemetry');
 *     await initTelemetry({
 *       serviceName: 'pravara-landing',
 *       otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
 *     });
 *   }
 * }
 * ```
 */

export type { TelemetryConfig, TelemetryHandle } from './types';
export { initTelemetry, withSpan, trace, context, propagation } from './node';
