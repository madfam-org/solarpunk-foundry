/**
 * Pure helpers behind the browser client. Nothing here touches `window`,
 * `document` or `navigator`; each takes its inputs as arguments so it can be
 * tested in Node.
 */

import type { ClientEvent, EventPosition, InputKind, Viewport } from './contract';

/** Bootstrap-style breakpoints: xs <576, sm <768, md <992, lg <1200, else xl. */
export function viewportClass(width: number): Viewport {
  if (!Number.isFinite(width) || width < 576) return 'xs';
  if (width < 768) return 'sm';
  if (width < 992) return 'md';
  if (width < 1200) return 'lg';
  return 'xl';
}

/** Pointer type to the contract's input class (pen counts as mouse). */
export function inputFromPointerType(pointerType: string): InputKind {
  if (pointerType === 'touch') return 'touch';
  if (pointerType === 'mouse' || pointerType === 'pen') return 'mouse';
  return 'unknown';
}

/**
 * True when `endpoint` is a same-origin path or an absolute URL on `origin`.
 * Protocol-relative (`//host`) and other-origin URLs are refused.
 */
export function isSameOriginEndpoint(endpoint: string, origin: string): boolean {
  if (typeof endpoint !== 'string' || endpoint === '') return false;
  if (endpoint.startsWith('/') && !endpoint.startsWith('//') && !endpoint.startsWith('/\\')) return true;
  try {
    const url = new URL(endpoint);
    return url.origin === origin && (url.protocol === 'https:' || url.protocol === 'http:');
  } catch {
    return false;
  }
}

export interface RageDetectorOptions {
  /** Clicks needed (default 3). */
  count?: number;
  /** Window in ms (default 700). */
  windowMs?: number;
  /** Radius in CSS px (default 24). */
  radiusPx?: number;
}

export interface RageDetector {
  /** Records a click; true when it completes a rage burst (the burst is then reset). */
  push(x: number, y: number, t: number): boolean;
  reset(): void;
}

/** Detects `count` or more clicks within `windowMs` and `radiusPx` of each other. */
export function createRageDetector(opts: RageDetectorOptions = {}): RageDetector {
  const count = opts.count ?? 3;
  const windowMs = opts.windowMs ?? 700;
  const radius = opts.radiusPx ?? 24;
  let clicks: { x: number; y: number; t: number }[] = [];
  return {
    push(x, y, t) {
      clicks = clicks.filter((c) => t - c.t <= windowMs && t >= c.t);
      clicks.push({ x, y, t });
      const near = clicks.filter((c) => Math.hypot(c.x - x, c.y - y) <= radius);
      if (near.length >= count) {
        clicks = [];
        return true;
      }
      return false;
    },
    reset() {
      clicks = [];
    },
  };
}

/** The part of an Element the interactivity check reads. */
export interface ElementLike {
  tagName: string;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  parentElement: ElementLike | null;
}

const INTERACTIVE_TAGS = new Set(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL', 'SUMMARY']);
const INTERACTIVE_ROLES = new Set(['button', 'link', 'tab', 'menuitem', 'checkbox', 'switch']);

/**
 * True when the element or an ancestor is interactive: a, button, input,
 * select, textarea, label, summary, an interactive role, `tabindex`, an inline
 * `onclick`, or a `data-tm` name. Reads tag names and those attributes only.
 */
export function isInteractive(el: ElementLike | null, maxDepth = 25): boolean {
  let node = el;
  for (let depth = 0; node && depth < maxDepth; depth += 1) {
    if (INTERACTIVE_TAGS.has(node.tagName.toUpperCase())) return true;
    const role = node.getAttribute('role');
    if (role && INTERACTIVE_ROLES.has(role.trim().toLowerCase())) return true;
    if (node.hasAttribute('tabindex') || node.hasAttribute('onclick') || node.hasAttribute('data-tm')) return true;
    node = node.parentElement;
  }
  return false;
}

/** The nearest element (self or ancestor) carrying `data-tm`, and its value. */
export function findTarget<T extends ElementLike>(el: T | null, maxDepth = 25): { element: T; name: string } | null {
  let node: ElementLike | null = el;
  for (let depth = 0; node && depth < maxDepth; depth += 1) {
    const name = node.getAttribute('data-tm');
    if (name) return { element: node as T, name };
    node = node.parentElement;
  }
  return null;
}

export interface RectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

const round3 = (n: number): number => Math.round(n * 1000) / 1000;

/** Position of (x, y) inside `rect`, each axis 0..1 rounded to 3 decimals; null when outside. */
export function relativePosition(x: number, y: number, rect: RectLike): EventPosition | null {
  if (!(rect.width > 0) || !(rect.height > 0)) return null;
  const rx = (x - rect.left) / rect.width;
  const ry = (y - rect.top) / rect.height;
  if (!Number.isFinite(rx) || !Number.isFinite(ry) || rx < 0 || rx > 1 || ry < 0 || ry > 1) return null;
  return { rx: round3(rx), ry: round3(ry) };
}

/** Deepest decile (0..10) of the document seen so far. A page that fits the viewport is 10. */
export function scrollDecile(scrollTop: number, viewportHeight: number, scrollHeight: number): number {
  if (!(scrollHeight > 0) || scrollHeight <= viewportHeight) return 10;
  const seen = Math.min(1, Math.max(0, (scrollTop + viewportHeight) / scrollHeight));
  return Math.floor(seen * 10);
}

/** Recognises a failed code-split chunk load from its error name or message (never sent). */
export function isChunkLoadError(name: unknown, message: unknown): boolean {
  if (name === 'ChunkLoadError') return true;
  if (typeof message !== 'string') return false;
  return (
    /Loading (CSS )?chunk [\w-]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message)
  );
}

/** 16-character base64url id from 12 random bytes. */
export function randomPageId(getRandomValues: (a: Uint8Array) => Uint8Array): string {
  const bytes = getRandomValues(new Uint8Array(12));
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let out = '';
  for (let i = 0; i < 12; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out += alphabet[(n >> 18) & 63] + alphabet[(n >> 12) & 63] + alphabet[(n >> 6) & 63] + alphabet[n & 63];
  }
  return out;
}

/** Cumulative Layout Shift with session windows (gap < 1 s, window < 5 s); keeps the largest window. */
export interface ClsAccumulator {
  add(value: number, startTime: number): void;
  value(): number;
}

export function createClsAccumulator(): ClsAccumulator {
  let max = 0;
  let current = 0;
  let windowStart = -Infinity;
  let last = -Infinity;
  return {
    add(value, startTime) {
      if (startTime - last < 1000 && startTime - windowStart < 5000) {
        current += value;
      } else {
        current = value;
        windowStart = startTime;
      }
      last = startTime;
      if (current > max) max = current;
    },
    value() {
      return max;
    },
  };
}

/** A vital's value as the contract carries it: a rounded number in 0..3600000. */
export function vitalValue(n: number): number | null {
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(3600000, Math.round(n));
}

/**
 * Serialises events into ClientBatch bodies of at most `maxEvents` events and
 * `maxBytes` bytes each. Event JSON is ASCII by contract, so length is bytes.
 * An event that alone exceeds `maxBytes` is dropped.
 */
export function splitBatches(events: readonly ClientEvent[], maxEvents: number, maxBytes: number): string[] {
  const out: string[] = [];
  const head = '{"v":1,"events":[';
  const tail = ']}';
  let parts: string[] = [];
  let size = head.length + tail.length;
  const close = (): void => {
    if (parts.length > 0) out.push(head + parts.join(',') + tail);
    parts = [];
    size = head.length + tail.length;
  };
  for (const event of events) {
    const s = JSON.stringify(event);
    if (head.length + tail.length + s.length > maxBytes) continue;
    const extra = s.length + (parts.length > 0 ? 1 : 0);
    if (parts.length >= maxEvents || size + extra > maxBytes) close();
    size += s.length + (parts.length > 0 ? 1 : 0);
    parts.push(s);
  }
  close();
  return out;
}
