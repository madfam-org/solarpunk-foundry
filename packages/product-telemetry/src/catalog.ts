/**
 * Catalogue rules (telemetry-catalog/v1) and the gate-side batch check.
 *
 * Order of checks, matching rule 2 then rule 3 of the contract:
 *   excluded prefix → declared screen → declared or reserved action →
 *   declared target → declared props → screen-class stripping.
 */

import type {
  Catalog,
  CatalogAction,
  CatalogPropDecl,
  CatalogScreen,
  ClientEvent,
  DropReason,
  GateEvent,
  ScreenClass,
} from './contract';
import { checkGateEnvelope, checkGateEvent, isRecord, isReservedAction, ROLE_RE } from './validate';

interface CatalogIndex {
  screens: Map<string, CatalogScreen>;
  actions: Map<string, CatalogAction>;
  targets: Set<string>;
  roles: Set<string>;
  excluded: readonly string[];
}

const indexes = new WeakMap<Catalog, CatalogIndex>();

function indexOf(catalog: Catalog): CatalogIndex {
  let idx = indexes.get(catalog);
  if (!idx) {
    idx = {
      screens: new Map((catalog.screens ?? []).map((s) => [s.template, s])),
      actions: new Map((catalog.actions ?? []).map((a) => [a.name, a])),
      targets: new Set(catalog.targets ?? []),
      roles: new Set(catalog.roles ?? []),
      excluded: catalog.excluded ?? [],
    };
    indexes.set(catalog, idx);
  }
  return idx;
}

/** True when `screen` equals an excluded prefix or sits under one. */
export function isExcluded(screen: string, excluded: readonly string[]): boolean {
  for (const prefix of excluded) {
    if (screen === prefix) return true;
    const base = prefix.endsWith('/') ? prefix : `${prefix}/`;
    if (screen.startsWith(base)) return true;
  }
  return false;
}

function propMatches(decl: CatalogPropDecl, value: unknown): boolean {
  if ('enum' in decl) return typeof value === 'string' && decl.enum.includes(value);
  if (decl.type === 'boolean') return typeof value === 'boolean';
  if (decl.type === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) return false;
    if (decl.min !== undefined && value < decl.min) return false;
    if (decl.max !== undefined && value > decl.max) return false;
    return true;
  }
  return false;
}

export type ApplyCatalogResult<T extends ClientEvent = ClientEvent> =
  | { ok: true; event: T; screenClass: ScreenClass }
  | { ok: false; reason: DropReason };

/**
 * Applies a product's catalogue to one schema-valid event. Returns a copy with
 * `props` removed on a restricted screen, `pos` removed unless the screen allows
 * positions (and always when there is no declared `target` to be relative to),
 * and `from` removed when it is not a declared, non-excluded screen.
 */
export function applyCatalog<T extends ClientEvent>(event: T, catalog: Catalog): ApplyCatalogResult<T> {
  const idx = indexOf(catalog);

  if (isExcluded(event.screen, idx.excluded)) return { ok: false, reason: 'catalog:excluded' };
  const screen = idx.screens.get(event.screen);
  if (!screen) return { ok: false, reason: 'catalog:screen' };

  let action: CatalogAction | undefined;
  if (event.kind === 'action') {
    const name = event.name ?? '';
    action = idx.actions.get(name);
    if (!action && !isReservedAction(name)) return { ok: false, reason: 'catalog:action' };
  }

  if (event.target !== undefined && !idx.targets.has(event.target)) {
    return { ok: false, reason: 'catalog:target' };
  }

  if (event.props !== undefined) {
    const decls = action?.props;
    if (!decls) return { ok: false, reason: 'catalog:props' };
    for (const [key, value] of Object.entries(event.props)) {
      const decl = Object.prototype.hasOwnProperty.call(decls, key) ? decls[key] : undefined;
      if (!decl || !propMatches(decl, value)) return { ok: false, reason: 'catalog:props' };
    }
  }

  const out: T = { ...event };
  if (out.ctx) out.ctx = { ...out.ctx };
  if (out.props) out.props = { ...out.props };
  if (out.pos) out.pos = { ...out.pos };

  if (out.from !== undefined && (!idx.screens.has(out.from) || isExcluded(out.from, idx.excluded))) {
    delete out.from;
  }
  if (screen.class === 'restricted') {
    delete out.props;
    if (screen.positions !== true) delete out.pos;
  }
  if (out.target === undefined) delete out.pos;

  return { ok: true, event: out, screenClass: screen.class };
}

/** Whether a role class may be stamped for this catalogue. */
export function isDeclaredRole(catalog: Catalog, role: unknown): role is string {
  return typeof role === 'string' && ROLE_RE.test(role) && indexOf(catalog).roles.has(role);
}

export type GateDropReason = DropReason | 'schema' | 'product';

export interface CheckGateBatchResult {
  /** False when the envelope itself is not a GateBatch; every event is then counted as `schema`. */
  valid: boolean;
  /** The product the envelope names, when it is readable. */
  product: string | null;
  accepted: GateEvent[];
  dropped: Record<GateDropReason, number>;
}

function emptyDropped(): Record<GateDropReason, number> {
  return {
    schema: 0,
    product: 0,
    'catalog:excluded': 0,
    'catalog:screen': 0,
    'catalog:action': 0,
    'catalog:target': 0,
    'catalog:props': 0,
  };
}

/**
 * The gate's check of a GateBatch: the schema rules for every stamped event,
 * each event's `product` equal to the batch's, and the product's catalogue
 * applied again (the stamped `screen_class` is replaced by the catalogue's, and
 * a role the catalogue does not declare is removed).
 */
export function checkGateBatch(input: unknown, catalogs: Record<string, Catalog>): CheckGateBatchResult {
  const dropped = emptyDropped();
  const envelope = checkGateEnvelope(input);
  if (!envelope.ok) {
    const events = isRecord(input) && Array.isArray(input.events) ? input.events.length : 0;
    dropped.schema = Math.max(1, events);
    return { valid: false, product: null, accepted: [], dropped };
  }

  const { product, events } = envelope;
  const catalog = Object.prototype.hasOwnProperty.call(catalogs, product) ? catalogs[product] : undefined;
  const accepted: GateEvent[] = [];

  for (const raw of events) {
    const checked = checkGateEvent(raw);
    if (!checked.ok) {
      dropped.schema += 1;
      continue;
    }
    if (!catalog || checked.event.product !== product || catalog.product !== product) {
      dropped.product += 1;
      continue;
    }
    const applied = applyCatalog(checked.event, catalog);
    if (!applied.ok) {
      dropped[applied.reason] += 1;
      continue;
    }
    const event = applied.event;
    event.screen_class = applied.screenClass;
    if (event.role !== undefined && !isDeclaredRole(catalog, event.role)) delete event.role;
    accepted.push(event);
  }

  return { valid: true, product, accepted, dropped };
}
