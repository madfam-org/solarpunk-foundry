import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  applyCatalog,
  checkClientBatch,
  checkClientEvent,
  checkGateBatch,
  ERROR_CLASSES,
  RESERVED_ACTIONS,
  VITAL_NAMES,
  type Catalog,
} from '../index';

const contracts = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'contracts');
const load = (file: string): unknown => JSON.parse(readFileSync(join(contracts, file), 'utf8'));

interface Fixtures {
  catalog: Catalog;
  valid: { case: string; shape: 'ClientBatch' | 'GateBatch'; doc: { events: unknown[] } }[];
  invalid: { case: string; shape: 'ClientBatch' | 'GateBatch'; reason: string; doc: { events: unknown[] } }[];
  server_rules: {
    case: string;
    input: unknown;
    expect: { kept: boolean; screen_class: string; has_props: boolean; has_pos: boolean };
  }[];
}

const fixtures = load('telemetry-event.v1.fixtures.json') as Fixtures;
const schema = load('telemetry-event.v1.json') as {
  $id: string;
  $defs: Record<string, { enum?: string[] }>;
};
const catalog = fixtures.catalog;
const catalogs = { [catalog.product]: catalog };

describe('vendored contract files', () => {
  it('all three parse and carry the expected ids', () => {
    expect(schema.$id).toBe('https://madfam.io/contracts/telemetry-event.v1.json');
    const catalogSchema = load('telemetry-catalog.v1.json') as { $id: string };
    expect(catalogSchema.$id).toBe('https://madfam.io/contracts/telemetry-catalog.v1.json');
    expect(fixtures.valid.length).toBeGreaterThan(0);
    expect(fixtures.invalid.length).toBeGreaterThan(0);
  });

  it('enums in code equal the enums in the schema', () => {
    expect([...RESERVED_ACTIONS]).toEqual(schema.$defs.reservedActionName.enum);
    expect([...VITAL_NAMES]).toEqual(schema.$defs.vitalName.enum);
    expect([...ERROR_CLASSES]).toEqual(schema.$defs.errorClass.enum);
  });
});

describe('fixture conformance: valid', () => {
  for (const item of fixtures.valid) {
    it(item.case, () => {
      if (item.shape === 'ClientBatch') {
        expect(checkClientBatch(item.doc).ok).toBe(true);
        for (const raw of item.doc.events) {
          const checked = checkClientEvent(raw);
          expect(checked.ok).toBe(true);
          if (!checked.ok) return;
          expect(applyCatalog(checked.event, catalog).ok).toBe(true);
        }
      } else {
        const result = checkGateBatch(item.doc, catalogs);
        expect(result.valid).toBe(true);
        expect(result.accepted).toHaveLength(item.doc.events.length);
        expect(Object.values(result.dropped).every((n) => n === 0)).toBe(true);
      }
    });
  }
});

describe('fixture conformance: invalid', () => {
  for (const item of fixtures.invalid) {
    it(`${item.case} → ${item.reason}`, () => {
      if (item.shape === 'GateBatch') {
        const result = checkGateBatch(item.doc, catalogs);
        expect(result.accepted).toHaveLength(0);
        expect(result.dropped[item.reason as keyof typeof result.dropped]).toBe(item.doc.events.length);
        return;
      }
      const outcomes = item.doc.events.map((raw) => {
        const checked = checkClientEvent(raw);
        if (!checked.ok) return checked.reason;
        const applied = applyCatalog(checked.event, catalog);
        return applied.ok ? 'kept' : applied.reason;
      });
      expect(outcomes).toEqual(item.doc.events.map(() => item.reason));
    });
  }
});

describe('fixture conformance: server rules', () => {
  for (const item of fixtures.server_rules) {
    it(item.case, () => {
      const checked = checkClientEvent(item.input);
      expect(checked.ok).toBe(true);
      if (!checked.ok) return;
      const applied = applyCatalog(checked.event, catalog);
      expect(applied.ok).toBe(item.expect.kept);
      if (!applied.ok) return;
      expect(applied.screenClass).toBe(item.expect.screen_class);
      expect(applied.event.props !== undefined).toBe(item.expect.has_props);
      expect(applied.event.pos !== undefined).toBe(item.expect.has_pos);
    });
  }
});

describe('checkClientEvent edge rules', () => {
  const base = {
    kind: 'view',
    ts: '2026-11-12T18:00:00.000Z',
    screen: '/',
    ctx: { viewport: 'lg', input: 'mouse' },
    release: 'r1',
    page: 'pAg3Id_01',
    seq: 0,
  };

  it('accepts the minimal view', () => {
    expect(checkClientEvent(base).ok).toBe(true);
  });

  it.each([
    ['a view with a name', { ...base, name: 'x' }],
    ['an action without a name', { ...base, kind: 'action' }],
    ['a vital without a value', { ...base, kind: 'vital', name: 'LCP' }],
    ['an unknown error class', { ...base, kind: 'error', name: 'oops' }],
    ['seven props', { ...base, kind: 'action', name: 'a.b', props: { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1, g: 1 } }],
    ['a prop key with uppercase', { ...base, kind: 'action', name: 'a.b', props: { Bad: 1 } }],
    ['a value over an hour', { ...base, kind: 'vital', name: 'LCP', value: 3600001 }],
    ['a fractional scroll', { ...base, scroll: 2.5 }],
    ['a scroll over 10', { ...base, scroll: 11 }],
    ['pos out of range', { ...base, pos: { rx: 1.2, ry: 0 } }],
    ['pos with an extra field', { ...base, pos: { rx: 0, ry: 0, z: 0 } }],
    ['ctx with an extra field', { ...base, ctx: { viewport: 'lg', input: 'mouse', ua: 'x' } }],
    ['a short page id', { ...base, page: 'abc' }],
    ['a release with spaces', { ...base, release: 'r 1' }],
    ['a non-date ts', { ...base, ts: 'yesterday' }],
    ['a seq over the limit', { ...base, seq: 100001 }],
    ['an array', [base]],
    ['null', null],
  ])('refuses %s', (_label, input) => {
    expect(checkClientEvent(input)).toEqual({ ok: false, reason: 'schema' });
  });

  it('returns a copy, not the input', () => {
    const input = { ...base, ctx: { ...base.ctx } };
    const checked = checkClientEvent(input);
    expect(checked.ok).toBe(true);
    if (!checked.ok) return;
    expect(checked.event).toEqual(input);
    expect(checked.event.ctx).not.toBe(input.ctx);
  });
});

describe('applyCatalog details', () => {
  const ev = {
    kind: 'action' as const,
    ts: '2026-11-12T18:00:00.000Z',
    screen: '/settings',
    ctx: { viewport: 'lg' as const, input: 'mouse' as const },
    release: 'r1',
    page: 'pAg3Id_01',
    seq: 0,
  };

  it('treats the excluded prefix itself and anything under it as excluded, but not a sibling', () => {
    const cat: Catalog = { ...catalog, screens: [...catalog.screens, { template: '/invitee', class: 'standard' }] };
    expect(applyCatalog({ ...ev, kind: 'view', screen: '/invite' }, cat)).toEqual({ ok: false, reason: 'catalog:excluded' });
    expect(applyCatalog({ ...ev, kind: 'view', screen: '/invitee' }, cat).ok).toBe(true);
  });

  it('always allows reserved actions, but not with props', () => {
    expect(applyCatalog({ ...ev, name: 'ui.dead' }, catalog).ok).toBe(true);
    expect(applyCatalog({ ...ev, name: 'ui.dead', props: { a: 1 } }, catalog)).toEqual({
      ok: false,
      reason: 'catalog:props',
    });
  });

  it('checks number ranges', () => {
    expect(applyCatalog({ ...ev, name: 'session.save', props: { items: 101 } }, catalog)).toEqual({
      ok: false,
      reason: 'catalog:props',
    });
    expect(applyCatalog({ ...ev, name: 'session.save', props: { items: 100 } }, catalog).ok).toBe(true);
  });

  it('drops pos without a target and an undeclared from', () => {
    const applied = applyCatalog({ ...ev, name: 'search.run', pos: { rx: 0.5, ry: 0.5 }, from: '/nowhere' }, catalog);
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    expect(applied.event.pos).toBeUndefined();
    expect(applied.event.from).toBeUndefined();
  });
});

describe('checkGateBatch details', () => {
  const gateDoc = fixtures.valid.find((v) => v.shape === 'GateBatch')!.doc as {
    v: number;
    product: string;
    events: Record<string, unknown>[];
  };

  it('drops events whose product differs from the batch', () => {
    const doc = { ...gateDoc, events: [{ ...gateDoc.events[0], product: 'other-app' }] };
    expect(checkGateBatch(doc, catalogs).dropped.product).toBe(1);
  });

  it('drops everything for a product without a catalogue', () => {
    const r = checkGateBatch(gateDoc, {});
    expect(r.accepted).toHaveLength(0);
    expect(r.dropped.product).toBe(1);
  });

  it('re-stamps the screen class from the catalogue and strips what it forbids', () => {
    const doc = {
      ...gateDoc,
      events: [{ ...gateDoc.events[0], screen: '/records/[id]', screen_class: 'standard', props: { mode: 'new' } }],
    };
    const r = checkGateBatch(doc, catalogs);
    expect(r.accepted).toHaveLength(1);
    expect(r.accepted[0].screen_class).toBe('restricted');
    expect(r.accepted[0].props).toBeUndefined();
    expect(r.accepted[0].pos).toBeUndefined();
  });

  it('removes a role the catalogue does not declare', () => {
    const doc = { ...gateDoc, events: [{ ...gateDoc.events[0], role: 'ghost' }] };
    const r = checkGateBatch(doc, catalogs);
    expect(r.accepted[0].role).toBeUndefined();
  });

  it('refuses a malformed envelope', () => {
    expect(checkGateBatch({ v: 2, product: 'example-app', events: [] }, catalogs).valid).toBe(false);
    expect(checkGateBatch('nope', catalogs).valid).toBe(false);
  });
});
