import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import type { Catalog, GateEvent } from '../index';
import { createGateHandler, type GateHandlerOptions } from '../gate';

const contracts = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'contracts');
const fixtures = JSON.parse(readFileSync(join(contracts, 'telemetry-event.v1.fixtures.json'), 'utf8')) as {
  catalog: Catalog;
  valid: { shape: string; doc: { v: number; product: string; events: Record<string, unknown>[] } }[];
};
const catalog = fixtures.catalog;
const gateDoc = fixtures.valid.find((v) => v.shape === 'GateBatch')!.doc;
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

function setup(over: Partial<GateHandlerOptions> = {}) {
  const store = vi.fn(async (_events: GateEvent[]) => undefined);
  const onAccepted = vi.fn();
  const onDropped = vi.fn();
  const opts: GateHandlerOptions = {
    catalogs: { 'example-app': catalog, 'other-app': { ...catalog, product: 'other-app' } },
    tokens: { 'example-app': sha('token-a'), 'other-app': sha('token-b') },
    killed: () => new Set<string>(),
    store,
    onAccepted,
    onDropped,
    ...over,
  };
  return { handler: createGateHandler(opts), store, onAccepted, onDropped };
}

const post = (body: unknown, token?: string): Request =>
  new Request('https://gate.example/v1/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

describe('createGateHandler', () => {
  it('accepts a valid batch and stores it', async () => {
    const { handler, store, onAccepted } = setup();
    const res = await handler(post(gateDoc, 'token-a'));
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ accepted: 1, dropped: {} });
    expect(store).toHaveBeenCalledTimes(1);
    expect(store.mock.calls[0][0]).toHaveLength(1);
    expect(onAccepted).toHaveBeenCalledWith('example-app', 1);
  });

  it('answers 401 without a token, with a wrong token, and with another product\'s token', async () => {
    const { handler, store } = setup();
    expect((await handler(post(gateDoc))).status).toBe(401);
    expect((await handler(post(gateDoc, 'nope'))).status).toBe(401);
    expect((await handler(post(gateDoc, 'token-b'))).status).toBe(401);
    expect(store).not.toHaveBeenCalled();
  });

  it('answers 202 and drops everything for a killed product', async () => {
    const { handler, store, onDropped } = setup({ killed: () => new Set(['example-app']) });
    const res = await handler(post(gateDoc, 'token-a'));
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ accepted: 0, dropped: { killed: 1 } });
    expect(store).not.toHaveBeenCalled();
    expect(onDropped).toHaveBeenCalledWith('example-app', 'killed', 1);
  });

  it('answers 503 when the store fails, without echoing contents', async () => {
    const { handler } = setup({
      store: async () => {
        throw new Error('db down');
      },
    });
    const res = await handler(post(gateDoc, 'token-a'));
    expect(res.status).toBe(503);
    const text = await res.text();
    expect(text).not.toContain('db down');
    expect(text).not.toContain('example-app');
  });

  it('counts dropped events by reason', async () => {
    const { handler, onDropped } = setup();
    const doc = {
      ...gateDoc,
      events: [gateDoc.events[0], { ...gateDoc.events[0], screen: '/reports' }, { ...gateDoc.events[0], title: 'x' }],
    };
    const res = await handler(post(doc, 'token-a'));
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ accepted: 1, dropped: { 'catalog:screen': 1, schema: 1 } });
    expect(onDropped).toHaveBeenCalledWith('example-app', 'catalog:screen', 1);
    expect(onDropped).toHaveBeenCalledWith('example-app', 'schema', 1);
  });

  it('answers 400 for a malformed batch and 405 for other methods', async () => {
    const { handler } = setup();
    expect((await handler(post('not json', 'token-a'))).status).toBe(400);
    expect((await handler(post({ v: 1, product: 'example-app', events: [] }, 'token-a'))).status).toBe(400);
    expect((await handler(new Request('https://gate.example/v1/events'))).status).toBe(405);
  });

  it('answers 413 over 256 KiB', async () => {
    const { handler } = setup();
    expect((await handler(post('x'.repeat(257 * 1024), 'token-a'))).status).toBe(413);
  });
});
