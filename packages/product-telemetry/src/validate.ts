/**
 * Hand-written validators for telemetry.event/v1. They follow the JSON Schema in
 * `../contracts/telemetry-event.v1.json` rule for rule (closed objects, every
 * pattern, enum and range, the per-kind rules for `name`), with no dependency.
 * The shared fixtures in `../contracts/telemetry-event.v1.fixtures.json` are the
 * conformance test.
 */

import {
  CLIENT_BATCH_MAX_EVENTS,
  CONTRACT_VERSION,
  ENVS,
  ERROR_CLASSES,
  EVENT_KINDS,
  GATE_BATCH_MAX_EVENTS,
  INPUTS,
  MAX_PROPS,
  MAX_SEQ,
  MAX_VALUE,
  OUTCOMES,
  RESERVED_ACTIONS,
  SCREEN_CLASSES,
  SURFACES,
  VIEWPORTS,
  VITAL_NAMES,
  type ClientEvent,
  type GateEvent,
  type PropValue,
} from './contract';

export type Rec = Record<string, unknown>;

export const ROUTE_TEMPLATE_RE =
  /^\/([a-z0-9][a-z0-9_.-]*|\[{1,2}(\.\.\.)?[a-zA-Z0-9_]+\]{1,2})?(\/([a-z0-9][a-z0-9_.-]*|\[{1,2}(\.\.\.)?[a-zA-Z0-9_]+\]{1,2}))*$/;
export const CATALOGUE_NAME_RE = /^[a-z][a-z0-9_]{0,31}(\.[a-z0-9_]{1,32}){0,3}$/;
export const PROP_KEY_RE = /^[a-z][a-z0-9_]{0,31}$/;
export const PROP_STRING_RE = /^[a-z0-9][a-z0-9_-]{0,31}$/;
export const SLUG_RE = /^[a-z][a-z0-9-]{1,40}$/;
export const PSEUDONYM_RE = /^[a-f0-9]{32}$/;
export const ROLE_RE = /^[a-z][a-z0-9_]{0,31}$/;
export const RELEASE_RE = /^[A-Za-z0-9._-]{1,64}$/;
export const PAGE_RE = /^[A-Za-z0-9_-]{8,32}$/;
const DATE_TIME_RE =
  /^(\d{4})-(\d{2})-(\d{2})[Tt ](\d{2}):(\d{2}):(\d{2})(\.\d+)?([Zz]|[+-](\d{2}):(\d{2}))$/;

const CLIENT_KEYS = [
  'kind',
  'ts',
  'screen',
  'from',
  'name',
  'target',
  'value',
  'outcome',
  'pos',
  'scroll',
  'props',
  'ctx',
  'release',
  'page',
  'seq',
] as const;
const STAMPED_KEYS = [
  'product',
  'surface',
  'env',
  'screen_class',
  'actor',
  'session',
  'role',
  'tenant',
  'received_at',
] as const;

const CLIENT_KEY_SET: ReadonlySet<string> = new Set(CLIENT_KEYS);
const GATE_KEY_SET: ReadonlySet<string> = new Set([...CLIENT_KEYS, ...STAMPED_KEYS]);
const POS_KEYS: ReadonlySet<string> = new Set(['rx', 'ry']);
const CTX_KEYS: ReadonlySet<string> = new Set(['viewport', 'input']);
const CLIENT_BATCH_KEYS: ReadonlySet<string> = new Set(['v', 'events']);
const GATE_BATCH_KEYS: ReadonlySet<string> = new Set(['v', 'product', 'events']);

const has = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);

/** A plain JSON object: not null, not an array, no exotic prototype. */
export function isRecord(x: unknown): x is Rec {
  if (typeof x !== 'object' || x === null || Array.isArray(x)) return false;
  const proto: unknown = Object.getPrototypeOf(x);
  return proto === Object.prototype || proto === null;
}

function onlyKeys(o: Rec, allowed: ReadonlySet<string>): boolean {
  for (const k of Object.keys(o)) if (!allowed.has(k)) return false;
  return true;
}

function inEnum<T extends string>(list: readonly T[], x: unknown): x is T {
  return typeof x === 'string' && (list as readonly string[]).includes(x);
}

function isNum(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}

function isInt(x: unknown, min: number, max: number): x is number {
  return isNum(x) && Number.isInteger(x) && x >= min && x <= max;
}

function matches(x: unknown, re: RegExp, maxLength?: number): x is string {
  if (typeof x !== 'string') return false;
  if (maxLength !== undefined && [...x].length > maxLength) return false;
  return re.test(x);
}

/** RFC 3339 date-time, as the JSON Schema `format: date-time` asserts it. */
export function isDateTime(x: unknown): x is string {
  if (typeof x !== 'string' || x.length > 32) return false;
  const m = DATE_TIME_RE.exec(x);
  if (!m) return false;
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  const second = Number(m[6]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  if (hour > 23 || minute > 59 || second > 60) return false;
  if (m[9] !== undefined && (Number(m[9]) > 23 || Number(m[10]) > 59)) return false;
  return true;
}

export function isRouteTemplate(x: unknown): x is string {
  return matches(x, ROUTE_TEMPLATE_RE, 160);
}

export function isCatalogueName(x: unknown): x is string {
  return matches(x, CATALOGUE_NAME_RE, 64);
}

export function isReservedAction(x: unknown): boolean {
  return inEnum(RESERVED_ACTIONS, x);
}

export function isPropValue(x: unknown): x is PropValue {
  if (typeof x === 'boolean') return true;
  if (typeof x === 'string') return PROP_STRING_RE.test(x);
  return isNum(x) && x >= -1000000 && x <= 1000000;
}

function isPos(x: unknown): boolean {
  if (!isRecord(x) || !onlyKeys(x, POS_KEYS) || !has(x, 'rx') || !has(x, 'ry')) return false;
  return isNum(x.rx) && x.rx >= 0 && x.rx <= 1 && isNum(x.ry) && x.ry >= 0 && x.ry <= 1;
}

function isProps(x: unknown): boolean {
  if (!isRecord(x)) return false;
  const keys = Object.keys(x);
  if (keys.length > MAX_PROPS) return false;
  for (const k of keys) {
    if (!PROP_KEY_RE.test(k) || !isPropValue(x[k])) return false;
  }
  return true;
}

function isCtx(x: unknown): boolean {
  if (!isRecord(x) || !onlyKeys(x, CTX_KEYS)) return false;
  return inEnum(VIEWPORTS, x.viewport) && inEnum(INPUTS, x.input);
}

/** The ClientEvent rules, without the closed-object rule (the caller applies it). */
function clientRulesHold(o: Rec): boolean {
  for (const k of ['kind', 'ts', 'screen', 'ctx', 'release', 'page', 'seq']) {
    if (!has(o, k)) return false;
  }
  if (!inEnum(EVENT_KINDS, o.kind)) return false;
  if (!isDateTime(o.ts)) return false;
  if (!isRouteTemplate(o.screen)) return false;
  if (has(o, 'from') && !isRouteTemplate(o.from)) return false;
  if (has(o, 'name') && !(typeof o.name === 'string' && [...o.name].length <= 64)) return false;
  if (has(o, 'target') && !isCatalogueName(o.target)) return false;
  if (has(o, 'value') && !(isNum(o.value) && o.value >= 0 && o.value <= MAX_VALUE)) return false;
  if (has(o, 'outcome') && !inEnum(OUTCOMES, o.outcome)) return false;
  if (has(o, 'pos') && !isPos(o.pos)) return false;
  if (has(o, 'scroll') && !isInt(o.scroll, 0, 10)) return false;
  if (has(o, 'props') && !isProps(o.props)) return false;
  if (!isCtx(o.ctx)) return false;
  if (!matches(o.release, RELEASE_RE)) return false;
  if (!matches(o.page, PAGE_RE)) return false;
  if (!isInt(o.seq, 0, MAX_SEQ)) return false;

  switch (o.kind) {
    case 'view':
      return !has(o, 'name');
    case 'action':
      return has(o, 'name') && (isCatalogueName(o.name) || isReservedAction(o.name));
    case 'vital':
      return has(o, 'name') && has(o, 'value') && inEnum(VITAL_NAMES, o.name);
    case 'error':
      return has(o, 'name') && inEnum(ERROR_CLASSES, o.name);
    default:
      return false;
  }
}

/** Copies the client part of an already-validated object, deep enough to own it. */
function copyClientPart(o: Rec): ClientEvent {
  const out: Rec = {};
  for (const k of CLIENT_KEYS) {
    if (!has(o, k)) continue;
    const v = o[k];
    out[k] = isRecord(v) ? { ...v } : v;
  }
  return out as unknown as ClientEvent;
}

export type CheckClientEventResult = { ok: true; event: ClientEvent } | { ok: false; reason: 'schema' };

/** Validates one browser event against `$defs/ClientEvent`. Returns an owned copy. */
export function checkClientEvent(input: unknown): CheckClientEventResult {
  if (!isRecord(input) || !onlyKeys(input, CLIENT_KEY_SET) || !clientRulesHold(input)) {
    return { ok: false, reason: 'schema' };
  }
  return { ok: true, event: copyClientPart(input) };
}

export type CheckGateEventResult = { ok: true; event: GateEvent } | { ok: false; reason: 'schema' };

/** Validates one stamped event against `$defs/GateEvent`. Returns an owned copy. */
export function checkGateEvent(input: unknown): CheckGateEventResult {
  const bad = { ok: false, reason: 'schema' } as const;
  if (!isRecord(input) || !onlyKeys(input, GATE_KEY_SET) || !clientRulesHold(input)) return bad;
  for (const k of ['product', 'surface', 'env', 'screen_class', 'received_at']) {
    if (!has(input, k)) return bad;
  }
  if (!matches(input.product, SLUG_RE)) return bad;
  if (!inEnum(SURFACES, input.surface)) return bad;
  if (!inEnum(ENVS, input.env)) return bad;
  if (!inEnum(SCREEN_CLASSES, input.screen_class)) return bad;
  if (has(input, 'actor') && !matches(input.actor, PSEUDONYM_RE)) return bad;
  if (has(input, 'session') && !matches(input.session, PSEUDONYM_RE)) return bad;
  if (has(input, 'role') && !matches(input.role, ROLE_RE)) return bad;
  if (has(input, 'tenant') && !matches(input.tenant, SLUG_RE)) return bad;
  if (!isDateTime(input.received_at)) return bad;
  if (input.screen_class === 'restricted' && has(input, 'props')) return bad;

  const event = copyClientPart(input) as GateEvent;
  for (const k of STAMPED_KEYS) {
    if (has(input, k)) (event as unknown as Rec)[k] = input[k];
  }
  return { ok: true, event };
}

export type CheckClientBatchResult = { ok: true; events: readonly unknown[] } | { ok: false; reason: 'schema' };

/**
 * Checks the `$defs/ClientBatch` envelope only (`v`, a 1..50 `events` array, no
 * other field). Each event is checked separately with `checkClientEvent`, so one
 * bad event does not cost the rest of the batch.
 */
export function checkClientBatch(input: unknown): CheckClientBatchResult {
  if (!isRecord(input) || !onlyKeys(input, CLIENT_BATCH_KEYS)) return { ok: false, reason: 'schema' };
  if (input.v !== CONTRACT_VERSION) return { ok: false, reason: 'schema' };
  const events = input.events;
  if (!Array.isArray(events) || events.length < 1 || events.length > CLIENT_BATCH_MAX_EVENTS) {
    return { ok: false, reason: 'schema' };
  }
  return { ok: true, events };
}

export type CheckGateEnvelopeResult =
  | { ok: true; product: string; events: readonly unknown[] }
  | { ok: false; reason: 'schema' };

/** Checks the `$defs/GateBatch` envelope only (`v`, `product`, a 1..200 `events` array). */
export function checkGateEnvelope(input: unknown): CheckGateEnvelopeResult {
  if (!isRecord(input) || !onlyKeys(input, GATE_BATCH_KEYS)) return { ok: false, reason: 'schema' };
  if (input.v !== CONTRACT_VERSION || !matches(input.product, SLUG_RE)) return { ok: false, reason: 'schema' };
  const events = input.events;
  if (!Array.isArray(events) || events.length < 1 || events.length > GATE_BATCH_MAX_EVENTS) {
    return { ok: false, reason: 'schema' };
  }
  return { ok: true, product: input.product, events };
}
