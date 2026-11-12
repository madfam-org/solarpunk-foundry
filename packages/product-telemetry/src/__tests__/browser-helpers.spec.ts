import { describe, expect, it } from 'vitest';
import {
  createClsAccumulator,
  createRageDetector,
  findTarget,
  inputFromPointerType,
  isChunkLoadError,
  isInteractive,
  isSameOriginEndpoint,
  randomPageId,
  relativePosition,
  scrollDecile,
  splitBatches,
  viewportClass,
  vitalValue,
  type ElementLike,
} from '../browser-helpers';
import { checkClientEvent, type ClientEvent } from '../index';
import { createTelemetryClient } from '../browser';

function el(tagName: string, attrs: Record<string, string> = {}, parent: ElementLike | null = null): ElementLike {
  return {
    tagName,
    getAttribute: (n) => (n in attrs ? attrs[n] : null),
    hasAttribute: (n) => n in attrs,
    parentElement: parent,
  };
}

describe('viewportClass', () => {
  it.each([
    [320, 'xs'],
    [575, 'xs'],
    [576, 'sm'],
    [767, 'sm'],
    [768, 'md'],
    [991, 'md'],
    [992, 'lg'],
    [1199, 'lg'],
    [1200, 'xl'],
    [2560, 'xl'],
  ])('%i px → %s', (w, cls) => {
    expect(viewportClass(w)).toBe(cls);
  });
});

describe('inputFromPointerType', () => {
  it('maps pen to mouse', () => {
    expect(inputFromPointerType('pen')).toBe('mouse');
    expect(inputFromPointerType('mouse')).toBe('mouse');
    expect(inputFromPointerType('touch')).toBe('touch');
    expect(inputFromPointerType('')).toBe('unknown');
  });
});

describe('isSameOriginEndpoint', () => {
  const origin = 'https://app.example';
  it.each([
    ['/api/t', true],
    ['https://app.example/api/t', true],
    ['https://other.example/api/t', false],
    ['//other.example/api/t', false],
    ['http://app.example/api/t', false],
    ['javascript:alert(1)', false],
    ['', false],
  ])('%s → %s', (endpoint, ok) => {
    expect(isSameOriginEndpoint(endpoint, origin)).toBe(ok);
  });
});

describe('createRageDetector', () => {
  it('fires on the third click within 700 ms and 24 px', () => {
    const d = createRageDetector();
    expect(d.push(100, 100, 0)).toBe(false);
    expect(d.push(105, 102, 200)).toBe(false);
    expect(d.push(110, 98, 600)).toBe(true);
  });

  it('does not fire when the clicks are spread over more than 700 ms', () => {
    const d = createRageDetector();
    d.push(100, 100, 0);
    d.push(100, 100, 400);
    expect(d.push(100, 100, 800)).toBe(false);
  });

  it('does not fire when the clicks are far apart', () => {
    const d = createRageDetector();
    d.push(100, 100, 0);
    d.push(200, 100, 100);
    expect(d.push(300, 100, 200)).toBe(false);
  });

  it('resets after firing', () => {
    const d = createRageDetector();
    d.push(1, 1, 0);
    d.push(1, 1, 10);
    expect(d.push(1, 1, 20)).toBe(true);
    expect(d.push(1, 1, 30)).toBe(false);
  });
});

describe('isInteractive and findTarget', () => {
  it('finds interactive ancestors', () => {
    const button = el('BUTTON');
    expect(isInteractive(el('SPAN', {}, button))).toBe(true);
    expect(isInteractive(el('DIV', { role: 'tab' }))).toBe(true);
    expect(isInteractive(el('DIV', { tabindex: '0' }))).toBe(true);
    expect(isInteractive(el('DIV', { onclick: 'x()' }))).toBe(true);
    expect(isInteractive(el('DIV', { 'data-tm': 'settings.optout' }))).toBe(true);
    expect(isInteractive(el('summary'))).toBe(true);
  });

  it('calls plain text dead', () => {
    expect(isInteractive(el('P', {}, el('DIV', { role: 'presentation' }, el('BODY'))))).toBe(false);
    expect(isInteractive(null)).toBe(false);
  });

  it('finds the nearest data-tm', () => {
    const host = el('DIV', { 'data-tm': 'session.save_button' });
    const found = findTarget(el('SPAN', {}, host));
    expect(found?.name).toBe('session.save_button');
    expect(found?.element).toBe(host);
    expect(findTarget(el('SPAN'))).toBeNull();
  });
});

describe('relativePosition', () => {
  it('rounds to 3 decimals', () => {
    expect(relativePosition(133.3333, 50, { left: 100, top: 0, width: 100, height: 100 })).toEqual({ rx: 0.333, ry: 0.5 });
  });

  it('is null outside the box or for an empty box', () => {
    expect(relativePosition(99, 50, { left: 100, top: 0, width: 100, height: 100 })).toBeNull();
    expect(relativePosition(100, 0, { left: 100, top: 0, width: 0, height: 100 })).toBeNull();
  });
});

describe('scrollDecile', () => {
  it('computes the deepest decile seen', () => {
    expect(scrollDecile(0, 500, 5000)).toBe(1);
    expect(scrollDecile(2000, 500, 5000)).toBe(5);
    expect(scrollDecile(4500, 500, 5000)).toBe(10);
    expect(scrollDecile(0, 800, 600)).toBe(10);
  });
});

describe('isChunkLoadError', () => {
  it('recognises chunk failures without sending anything', () => {
    expect(isChunkLoadError('ChunkLoadError', '')).toBe(true);
    expect(isChunkLoadError('Error', 'Loading chunk 123 failed.')).toBe(true);
    expect(isChunkLoadError('TypeError', 'Failed to fetch dynamically imported module: /x.js')).toBe(true);
    expect(isChunkLoadError('TypeError', 'x is undefined')).toBe(false);
  });
});

describe('randomPageId', () => {
  it('is 16 base64url characters and passes the contract pattern', () => {
    const id = randomPageId((a) => globalThis.crypto.getRandomValues(a));
    expect(id).toMatch(/^[A-Za-z0-9_-]{16}$/);
    expect(randomPageId(() => new Uint8Array(12).fill(255))).toBe('________________');
  });
});

describe('createClsAccumulator', () => {
  it('keeps the largest session window', () => {
    const cls = createClsAccumulator();
    cls.add(0.1, 0);
    cls.add(0.1, 500);
    cls.add(0.05, 3000); // gap > 1 s: new window
    expect(cls.value()).toBeCloseTo(0.2);
  });
});

describe('vitalValue', () => {
  it('rounds and clamps', () => {
    expect(vitalValue(12.6)).toBe(13);
    expect(vitalValue(-1)).toBeNull();
    expect(vitalValue(9e9)).toBe(3600000);
  });
});

describe('splitBatches', () => {
  const ev = (seq: number): ClientEvent => ({
    kind: 'view',
    ts: '2026-11-12T18:00:00.000Z',
    screen: '/',
    ctx: { viewport: 'lg', input: 'mouse' },
    release: 'r1',
    page: 'pAg3Id_01',
    seq,
  });

  it('splits by count and keeps every body a valid ClientBatch', () => {
    const bodies = splitBatches(Array.from({ length: 120 }, (_, i) => ev(i)), 50, 32 * 1024);
    expect(bodies).toHaveLength(3);
    for (const body of bodies) {
      const parsed = JSON.parse(body) as { v: number; events: unknown[] };
      expect(parsed.v).toBe(1);
      expect(parsed.events.length).toBeLessThanOrEqual(50);
      for (const e of parsed.events) expect(checkClientEvent(e).ok).toBe(true);
    }
  });

  it('splits by size', () => {
    const bodies = splitBatches(Array.from({ length: 10 }, (_, i) => ev(i)), 50, 600);
    expect(bodies.length).toBeGreaterThan(1);
    for (const body of bodies) expect(body.length).toBeLessThanOrEqual(600);
  });
});

describe('createTelemetryClient outside a browser', () => {
  it('returns a no-op client and never throws', () => {
    const client = createTelemetryClient({ release: 'r1', screens: ['/'] });
    expect(() => {
      client.view('/');
      client.action('ui.dead');
      client.error('unhandled');
      client.flush();
      client.stop();
    }).not.toThrow();
  });
});
