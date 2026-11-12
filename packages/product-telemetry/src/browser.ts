/**
 * @madfam/product-telemetry/browser: the browser client.
 *
 * Sends ClientBatch bodies to the product's own origin only. It sets no cookie,
 * uses no localStorage or sessionStorage, reads no user-agent string, and never
 * puts a URL, query string, title, text, attribute value (other than `data-tm`)
 * or form value into an event. Every event is checked with `checkClientEvent`
 * before it is queued, and nothing here ever throws into the host page.
 *
 * Importing this module outside a browser is safe: nothing touches `window`
 * until `createTelemetryClient` runs, and there it returns a no-op client.
 */

import {
  BODY_MAX_BYTES,
  CLIENT_BATCH_MAX_EVENTS,
  MAX_SEQ,
  type ClientEvent,
  type ErrorClass,
  type EventKind,
  type InputKind,
  type Outcome,
  type PropValue,
} from './contract';
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
} from './browser-helpers';
import { matchScreen } from './match';
import { checkClientEvent, RELEASE_RE } from './validate';

export interface TelemetryClientOptions {
  /** Same-origin endpoint (default `/api/t`). Other origins are refused. */
  endpoint?: string;
  /** Build identifier, `[A-Za-z0-9._-]{1,64}`. */
  release: string;
  /** Route templates; an event on a path that matches none is not sent. */
  screens: readonly string[];
  /** Report LCP, CLS, INP, TTFB and FCP (default true). */
  autoVitals?: boolean;
  /** Report uncaught errors as `chunk_load` or `unhandled` (default true). */
  autoErrors?: boolean;
  /** Report `ui.rage`, `ui.dead` and `nav.back_quick` (default true). */
  autoSignals?: boolean;
  /** Flush interval in ms (default 5000). */
  flushIntervalMs?: number;
  /** Queue cap; the oldest event is dropped beyond it (default 50). */
  maxQueue?: number;
}

export interface ActionOptions {
  /** A declared target name. Defaults to the `data-tm` of `element` or its nearest ancestor. */
  target?: string;
  outcome?: Outcome;
  value?: number;
  props?: Record<string, PropValue>;
  /** The element acted on; used for `target` and the click position inside it. */
  element?: Element;
}

export interface TelemetryClient {
  /** Records a view of `pathname` (mapped to its template; query and hash are ignored). */
  view(pathname: string): void;
  action(name: string, o?: ActionOptions): void;
  error(cls: ErrorClass): void;
  flush(): void;
  /** Flushes, then removes every listener, timer and observer. */
  stop(): void;
}

export type { ClientEvent, ErrorClass, Outcome, PropValue };

const NOOP: TelemetryClient = {
  view() {},
  action() {},
  error() {},
  flush() {},
  stop() {},
};

const MAX_ERRORS_PER_PAGE = 25;
const MAX_SIGNALS_PER_PAGE = 100;
const BACK_QUICK_MS = 5000;
const POINTER_FRESH_MS = 1500;

interface ShiftEntry {
  value: number;
  hadRecentInput: boolean;
  startTime: number;
}

interface InteractionEntry {
  duration: number;
  interactionId?: number;
}

function guard<A extends unknown[]>(fn: (...args: A) => void): (...args: A) => void {
  return (...args: A) => {
    try {
      fn(...args);
    } catch {
      // Telemetry never breaks the host page.
    }
  };
}

/** Creates the client. Outside a browser, or with an invalid option, it returns a no-op client. */
export function createTelemetryClient(opts: TelemetryClientOptions): TelemetryClient {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return NOOP;
    return createBrowserClient(opts);
  } catch {
    return NOOP;
  }
}

function createBrowserClient(opts: TelemetryClientOptions): TelemetryClient {
  const endpoint = opts.endpoint ?? '/api/t';
  if (!isSameOriginEndpoint(endpoint, window.location.origin)) return NOOP;
  if (typeof opts.release !== 'string' || !RELEASE_RE.test(opts.release)) return NOOP;
  if (!Array.isArray(opts.screens)) return NOOP;
  if (!window.crypto || typeof window.crypto.getRandomValues !== 'function') return NOOP;

  const screens = opts.screens;
  const release = opts.release;
  const maxQueue = Math.max(1, Math.floor(opts.maxQueue ?? 50));
  const flushIntervalMs = Math.max(250, opts.flushIntervalMs ?? 5000);
  const page = randomPageId((a) => window.crypto.getRandomValues(a));

  let seq = 0;
  let current: string | null = null;
  let firstScreen: string | null = null;
  let lastViewAt = 0;
  let maxScroll = 0;
  let lastScrollRead = 0;
  let input: InputKind = 'unknown';
  let lastPointer: { x: number; y: number; t: number } | null = null;
  let errors = 0;
  let signals = 0;
  let stopped = false;
  let vitalsReported = false;
  const queue: ClientEvent[] = [];
  const cleanups: (() => void)[] = [];

  const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  function on(target: EventTarget, type: string, handler: (e: never) => void, capture = false): void {
    const wrapped = guard(handler) as unknown as EventListener;
    const options: AddEventListenerOptions = { capture, passive: true };
    target.addEventListener(type, wrapped, options);
    cleanups.push(() => target.removeEventListener(type, wrapped, options));
  }
  const onWindow = <K extends keyof WindowEventMap>(
    type: K,
    handler: (e: WindowEventMap[K]) => void,
    capture = false,
  ): void => on(window, type, handler, capture);
  const onDocument = <K extends keyof DocumentEventMap>(
    type: K,
    handler: (e: DocumentEventMap[K]) => void,
    capture = false,
  ): void => on(document, type, handler, capture);

  function emit(kind: EventKind, extra: Partial<ClientEvent>, screen: string | null = current): void {
    if (stopped || !screen || seq > MAX_SEQ) return;
    const event = {
      kind,
      ts: new Date().toISOString(),
      screen,
      ...extra,
      ctx: { viewport: viewportClass(window.innerWidth), input },
      release,
      page,
      seq,
    };
    seq += 1;
    const checked = checkClientEvent(event);
    if (!checked.ok) return;
    queue.push(checked.event);
    while (queue.length > maxQueue) queue.shift();
    if (queue.length >= CLIENT_BATCH_MAX_EVENTS) flush();
  }

  function readScroll(): void {
    const t = now();
    if (t - lastScrollRead < 200) return;
    lastScrollRead = t;
    const doc = document.documentElement;
    const decile = scrollDecile(window.scrollY, window.innerHeight, doc ? doc.scrollHeight : 0);
    if (decile > maxScroll) maxScroll = decile;
  }

  function send(body: string): void {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        if (navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }))) return;
      }
    } catch {
      // Fall through to fetch.
    }
    try {
      if (typeof fetch !== 'function') return;
      fetch(endpoint, {
        method: 'POST',
        body,
        keepalive: true,
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
      }).catch(() => undefined);
    } catch {
      // Dropped silently.
    }
  }

  function flush(): void {
    if (queue.length === 0) return;
    const events = queue.splice(0, queue.length);
    for (const body of splitBatches(events, CLIENT_BATCH_MAX_EVENTS, BODY_MAX_BYTES)) send(body);
  }

  function action(name: string, o: ActionOptions = {}): void {
    const extra: Partial<ClientEvent> = { name };
    let target = o.target;
    if (o.element) {
      const found = findTarget(o.element);
      if (found) {
        if (target === undefined) target = found.name;
        if (lastPointer && now() - lastPointer.t <= POINTER_FRESH_MS) {
          const pos = relativePosition(lastPointer.x, lastPointer.y, found.element.getBoundingClientRect());
          if (pos) extra.pos = pos;
        }
      }
    }
    if (target !== undefined) extra.target = target;
    if (o.outcome !== undefined) extra.outcome = o.outcome;
    if (o.value !== undefined) extra.value = o.value;
    if (o.props !== undefined) extra.props = { ...o.props };
    readScroll();
    extra.scroll = maxScroll;
    emit('action', extra);
  }

  function signal(name: string, o?: ActionOptions): void {
    if (signals >= MAX_SIGNALS_PER_PAGE) return;
    signals += 1;
    action(name, o);
  }

  function view(pathname: string): void {
    const template = matchScreen(screens, pathname);
    const previous = current;
    current = template;
    lastViewAt = now();
    maxScroll = 0;
    lastScrollRead = 0;
    if (!template) return;
    if (firstScreen === null) firstScreen = template;
    emit('view', previous ? { from: previous } : {});
  }

  function error(cls: ErrorClass): void {
    if (errors >= MAX_ERRORS_PER_PAGE) return;
    errors += 1;
    emit('error', { name: cls });
  }

  // ── input, pointer and scroll (always on: they feed ctx, pos and scroll) ──
  onDocument('pointerdown', (e) => {
    input = inputFromPointerType(e.pointerType);
    lastPointer = { x: e.clientX, y: e.clientY, t: now() };
  }, true);
  onDocument('keydown', () => {
    input = 'key';
  }, true);
  onWindow('scroll', () => readScroll());

  // ── signals ──
  if (opts.autoSignals !== false) {
    const rage = createRageDetector();
    onDocument('click', (e) => {
      if (e.detail === 0) return; // keyboard-activated click: no pointer, no signal
      const el = e.target instanceof Element ? e.target : null;
      if (!el) return;
      lastPointer = { x: e.clientX, y: e.clientY, t: now() };
      if (rage.push(e.clientX, e.clientY, now())) {
        signal('ui.rage', { element: el });
      } else if (!isInteractive(el)) {
        signal('ui.dead');
      }
    }, true);
    onWindow('popstate', () => {
      if (current && lastViewAt > 0 && now() - lastViewAt <= BACK_QUICK_MS) signal('nav.back_quick');
    });
  }

  // ── errors ──
  if (opts.autoErrors !== false) {
    onWindow('error', (e) => {
      const err: unknown = e.error;
      const name = err instanceof Error ? err.name : undefined;
      error(isChunkLoadError(name, e.message) ? 'chunk_load' : 'unhandled');
    });
    onWindow('unhandledrejection', (e) => {
      const reason: unknown = e.reason;
      const chunk =
        reason instanceof Error ? isChunkLoadError(reason.name, reason.message) : isChunkLoadError(undefined, reason);
      error(chunk ? 'chunk_load' : 'unhandled');
    });
  }

  // ── vitals ──
  let lcp: number | null = null;
  let inp: number | null = null;
  const cls = createClsAccumulator();
  let clsSeen = false;

  function observe(type: string, onEntries: (entries: PerformanceEntryList) => void, extra: Record<string, number> = {}): void {
    try {
      if (typeof PerformanceObserver === 'undefined') return;
      const supported = PerformanceObserver.supportedEntryTypes;
      if (Array.isArray(supported) && !supported.includes(type)) return;
      const po = new PerformanceObserver(guard((list: PerformanceObserverEntryList) => onEntries(list.getEntries())));
      const init: PerformanceObserverInit & Record<string, unknown> = { type, buffered: true, ...extra };
      po.observe(init);
      cleanups.push(() => po.disconnect());
    } catch {
      // Unsupported entry type.
    }
  }

  function reportVitals(): void {
    if (vitalsReported) return;
    vitalsReported = true;
    const loadScreen = firstScreen ?? current;
    const vital = (name: string, raw: number | null, screen: string | null): void => {
      if (raw === null) return;
      const value = vitalValue(raw);
      if (value !== null) emit('vital', { name, value }, screen);
    };
    try {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (nav && nav.responseStart > 0) vital('TTFB', nav.responseStart, loadScreen);
      const fcp = performance.getEntriesByType('paint').find((p) => p.name === 'first-contentful-paint');
      if (fcp) vital('FCP', fcp.startTime, loadScreen);
    } catch {
      // Navigation and paint timing unavailable.
    }
    vital('LCP', lcp, loadScreen);
    // CLS is a unitless score; the contract carries it as score × 1000, rounded.
    if (clsSeen) vital('CLS', cls.value() * 1000, current);
    vital('INP', inp, current);
  }

  if (opts.autoVitals !== false) {
    observe('largest-contentful-paint', (entries) => {
      const last = entries[entries.length - 1];
      if (last) lcp = last.startTime;
    });
    observe('layout-shift', (entries) => {
      for (const entry of entries) {
        const shift = entry as unknown as ShiftEntry;
        if (shift.hadRecentInput) continue;
        clsSeen = true;
        cls.add(shift.value, shift.startTime);
      }
    });
    observe(
      'event',
      (entries) => {
        for (const entry of entries) {
          const ev = entry as unknown as InteractionEntry;
          if (!ev.interactionId) continue;
          if (inp === null || ev.duration > inp) inp = ev.duration;
        }
      },
      { durationThreshold: 40 },
    );
  }

  // ── flushing ──
  const onHidden = (): void => {
    if (opts.autoVitals !== false) reportVitals();
    flush();
  };
  onDocument('visibilitychange', () => {
    if (document.visibilityState === 'hidden') onHidden();
  });
  onWindow('pagehide', onHidden);
  const timer = window.setInterval(guard(flush), flushIntervalMs);
  cleanups.push(() => window.clearInterval(timer));

  return {
    view: guard(view),
    action: guard((name: string, o?: ActionOptions) => action(name, o)),
    error: guard(error),
    flush: guard(flush),
    stop: guard(() => {
      if (stopped) return;
      flush();
      stopped = true;
      for (const cleanup of cleanups.splice(0)) {
        try {
          cleanup();
        } catch {
          // Keep tearing down.
        }
      }
    }),
  };
}
