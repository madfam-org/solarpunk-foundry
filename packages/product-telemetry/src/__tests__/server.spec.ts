import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { pseudonym, type Catalog, type GateBatch } from '../index';
import { createTelemetryHandler, type TelemetryHandlerOptions } from '../server';

const contracts = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'contracts');
const fixtures = JSON.parse(readFileSync(join(contracts, 'telemetry-event.v1.fixtures.json'), 'utf8')) as {
  catalog: Catalog;
};
const catalog = fixtures.catalog;

const KEY = 'test-hmac-key';
const event = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  kind: 'view',
  ts: '2026-11-12T18:00:00.000Z',
  screen: '/',
  ctx: { viewport: 'lg', input: 'mouse' },
  release: 'r1',
  page: 'pAg3Id_01',
  seq: 0,
  ...over,
});
const post = (body: unknown, raw = false): Request =>
  new Request('https://app.example/api/t', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: raw ? (body as string) : JSON.stringify(body),
  });

function setup(over: Partial<TelemetryHandlerOptions> = {}) {
  const fetchImpl = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(null, { status: 202 }));
  const onDrop = vi.fn();
  const onForward = vi.fn();
  const opts: TelemetryHandlerOptions = {
    product: 'example-app',
    surface: 'app',
    env: 'staging',
    catalog,
    enabled: () => true,
    identify: async () => ({ accountId: 'acc-1', sessionId: 'sess-1', role: 'staff', tenant: 'acme-co' }),
    hmacKey: KEY,
    gate: { url: 'https://gate.example/v1/events', token: 'gate-token' },
    fetchImpl: fetchImpl as unknown as typeof fetch,
    now: () => new Date('2026-11-12T18:00:09.000Z'),
    onDrop,
    onForward,
    ...over,
  };
  return { handler: createTelemetryHandler(opts), fetchImpl, onDrop, onForward };
}

function sentBatch(fetchImpl: ReturnType<typeof setup>['fetchImpl']): GateBatch {
  const init = fetchImpl.mock.calls[0][1] as RequestInit;
  return JSON.parse(init.body as string) as GateBatch;
}

describe('createTelemetryHandler', () => {
  it('refuses methods other than POST', async () => {
    const { handler } = setup();
    const res = await handler(new Request('https://app.example/api/t'));
    expect(res.status).toBe(405);
  });

  it('answers 204 without reading the body or forwarding when disabled', async () => {
    const { handler, fetchImpl, onDrop } = setup({ enabled: () => false });
    const res = await handler(post('this is not json', true));
    expect(res.status).toBe(204);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(onDrop).toHaveBeenCalledWith('disabled', 1);
  });

  it('answers 401 JSON (never a redirect) without identity', async () => {
    const { handler, fetchImpl } = setup({ identify: async () => null });
    const res = await handler(post({ v: 1, events: [event()] }));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'no_session' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('treats a throwing identify as no identity', async () => {
    const { handler } = setup({
      identify: async () => {
        throw new Error('boom');
      },
    });
    expect((await handler(post({ v: 1, events: [event()] }))).status).toBe(401);
  });

  it('drops an opted-out batch with 204 and no forward', async () => {
    const { handler, fetchImpl, onDrop } = setup({ identify: async () => ({ accountId: 'acc-1', optedOut: true }) });
    const res = await handler(post({ v: 1, events: [event(), event({ seq: 1 })] }));
    expect(res.status).toBe(204);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(onDrop).toHaveBeenCalledWith('opted_out', 2);
  });

  it('drops everything when the HMAC key is missing', async () => {
    const { handler, fetchImpl, onDrop } = setup({ hmacKey: undefined });
    const res = await handler(post({ v: 1, events: [event()] }));
    expect(res.status).toBe(204);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(onDrop).toHaveBeenCalledWith('no_key', 1);
  });

  it('stamps identity on the server and forwards a GateBatch with the bearer token', async () => {
    const { handler, fetchImpl, onForward } = setup();
    const res = await handler(post({ v: 1, events: [event({ from: '/settings' })] }));
    expect(res.status).toBe(204);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://gate.example/v1/events');
    expect((init?.headers as Record<string, string>).authorization).toBe('Bearer gate-token');
    const batch = sentBatch(fetchImpl);
    expect(batch).toMatchObject({ v: 1, product: 'example-app' });
    const [sent] = batch.events;
    expect(sent.actor).toMatch(/^[a-f0-9]{32}$/);
    expect(sent.actor).toBe(await pseudonym(KEY, 'example-app', 'acc-1'));
    expect(sent.session).toBe(await pseudonym(KEY, 'example-app', 'sess-1'));
    expect(sent).toMatchObject({
      product: 'example-app',
      surface: 'app',
      env: 'staging',
      screen_class: 'standard',
      role: 'staff',
      tenant: 'acme-co',
      received_at: '2026-11-12T18:00:09.000Z',
      from: '/settings',
    });
    expect(JSON.stringify(batch)).not.toContain('acc-1');
    expect(onForward).toHaveBeenCalledWith({ sent: 1, status: 202 });
  });

  it('stamps no role the catalogue does not declare', async () => {
    const { handler, fetchImpl } = setup({ identify: async () => ({ accountId: 'acc-1', role: 'ghost' }) });
    await handler(post({ v: 1, events: [event()] }));
    expect(sentBatch(fetchImpl).events[0].role).toBeUndefined();
  });

  it('refuses identity sent by a browser at the schema', async () => {
    const { handler, fetchImpl, onDrop } = setup();
    const res = await handler(post({ v: 1, events: [event({ actor: '0123456789abcdef0123456789abcdef' })] }));
    expect(res.status).toBe(204);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(onDrop).toHaveBeenCalledWith('schema', 1);
  });

  it('keeps the valid events of a mixed batch and counts the rest by reason', async () => {
    const { handler, fetchImpl, onDrop } = setup();
    await handler(
      post({
        v: 1,
        events: [event(), event({ seq: 1, screen: '/reports' }), event({ seq: 2, screen: '/invite/[token]' })],
      }),
    );
    expect(sentBatch(fetchImpl).events).toHaveLength(1);
    expect(onDrop).toHaveBeenCalledWith('catalog:screen', 1);
    expect(onDrop).toHaveBeenCalledWith('catalog:excluded', 1);
  });

  it('strips props on a restricted screen', async () => {
    const { handler, fetchImpl } = setup();
    await handler(
      post({ v: 1, events: [event({ kind: 'action', screen: '/records/[id]', name: 'session.save', props: { mode: 'new' } })] }),
    );
    const [sent] = sentBatch(fetchImpl).events;
    expect(sent.screen_class).toBe('restricted');
    expect(sent.props).toBeUndefined();
  });

  it('still answers 204 when the gate times out', async () => {
    const hanging = vi.fn(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    const { handler, onForward } = setup({
      fetchImpl: hanging as unknown as typeof fetch,
      gate: { url: 'https://gate.example/v1/events', token: 't', timeoutMs: 20 },
    });
    const res = await handler(post({ v: 1, events: [event()] }));
    expect(res.status).toBe(204);
    expect(onForward).toHaveBeenCalledWith({ sent: 0, status: 'timeout' });
  });

  it('still answers 204 when the gate errors', async () => {
    const failing = vi.fn(async () => {
      throw new Error('down');
    });
    const { handler, onForward } = setup({ fetchImpl: failing as unknown as typeof fetch });
    expect((await handler(post({ v: 1, events: [event()] }))).status).toBe(204);
    expect(onForward).toHaveBeenCalledWith({ sent: 0, status: 'error' });
  });

  it('skips forwarding when the gate is not configured', async () => {
    const { handler, fetchImpl, onForward } = setup({ gate: { url: undefined, token: undefined } });
    expect((await handler(post({ v: 1, events: [event()] }))).status).toBe(204);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(onForward).toHaveBeenCalledWith({ sent: 0, status: 'skipped' });
  });

  it('accepts anonymous batches when identity is not required', async () => {
    const { handler, fetchImpl } = setup({ identify: async () => null, requireIdentity: false, hmacKey: undefined });
    expect((await handler(post({ v: 1, events: [event()] }))).status).toBe(204);
    const [sent] = sentBatch(fetchImpl).events;
    expect(sent.actor).toBeUndefined();
    expect(sent.session).toBeUndefined();
  });

  it('answers 413 over 32 KiB', async () => {
    const { handler } = setup();
    expect((await handler(post('x'.repeat(33 * 1024), true))).status).toBe(413);
  });

  it('never throws on garbage, and answers 400 bad_batch for anything that is not a ClientBatch', async () => {
    const { handler } = setup({
      onDrop: () => {
        throw new Error('observer bug');
      },
    });
    const garbage = ['', 'null', '[]', '{}', '{"v":1,"events":[]}', '{"v":2,"events":[{}]}', '{"v":1,"events":"x"}', '\u0000'];
    for (const body of garbage) {
      const res = await handler(post(body, true));
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'bad_batch' });
    }
    const tooMany = { v: 1, events: Array.from({ length: 51 }, (_, i) => event({ seq: i })) };
    expect((await handler(post(tooMany))).status).toBe(400);
  });

  it('answers 204 for a valid envelope whose events are all garbage', async () => {
    const { handler, fetchImpl } = setup();
    const res = await handler(post({ v: 1, events: [1, 'x', null, [], { kind: 'view' }] }));
    expect(res.status).toBe(204);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
