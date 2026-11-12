/**
 * telemetry.event/v1 and telemetry-catalog/v1: types, enums and limits.
 *
 * The JSON Schemas in `../contracts/` are the source of truth. Everything here
 * mirrors them; a change to one is a change to both, tested by the fixtures.
 */

export const CONTRACT_VERSION = 1 as const;

/** A browser batch carries at most this many events. */
export const CLIENT_BATCH_MAX_EVENTS = 50;
/** A gate batch carries at most this many events. */
export const GATE_BATCH_MAX_EVENTS = 200;
/** Largest request body the product's server accepts from a browser (32 KiB). */
export const BODY_MAX_BYTES = 32 * 1024;
/** Largest request body the gate accepts from a product's server (256 KiB). */
export const GATE_BODY_MAX_BYTES = 256 * 1024;
/** Most props one event may carry. */
export const MAX_PROPS = 6;
/** Largest `seq` value the contract allows. */
export const MAX_SEQ = 100000;
/** Largest `value` the contract allows (one hour in milliseconds). */
export const MAX_VALUE = 3600000;

/** Action names every product accepts without declaring them. */
export const RESERVED_ACTIONS = [
  'ui.rage',
  'ui.dead',
  'nav.back_quick',
  'nav.not_found',
  'access.denied',
  'search.empty',
  'help.opened',
  'form.abandon',
] as const;
export type ReservedAction = (typeof RESERVED_ACTIONS)[number];

export const VITAL_NAMES = ['LCP', 'INP', 'CLS', 'TTFB', 'FCP', 'nav'] as const;
export type VitalName = (typeof VITAL_NAMES)[number];

export const ERROR_CLASSES = [
  'hydration',
  'chunk_load',
  'unhandled',
  'boundary',
  'server_action',
  'http_4xx',
  'http_5xx',
] as const;
export type ErrorClass = (typeof ERROR_CLASSES)[number];

export const EVENT_KINDS = ['view', 'action', 'error', 'vital'] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export const OUTCOMES = ['ok', 'error', 'cancelled', 'denied', 'empty'] as const;
export type Outcome = (typeof OUTCOMES)[number];

export const VIEWPORTS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type Viewport = (typeof VIEWPORTS)[number];

export const INPUTS = ['mouse', 'touch', 'key', 'unknown'] as const;
export type InputKind = (typeof INPUTS)[number];

export const SURFACES = ['app', 'public', 'portal', 'admin'] as const;
export type Surface = (typeof SURFACES)[number];

export const ENVS = ['production', 'staging', 'sim', 'development'] as const;
export type Env = (typeof ENVS)[number];

export const SCREEN_CLASSES = ['public', 'standard', 'restricted'] as const;
export type ScreenClass = (typeof SCREEN_CLASSES)[number];

/** Why the catalogue refused an event. */
export type DropReason =
  | 'catalog:excluded'
  | 'catalog:screen'
  | 'catalog:action'
  | 'catalog:target'
  | 'catalog:props';

export type PropValue = string | number | boolean;

export interface EventPosition {
  /** Horizontal position inside the declared target, 0..1. */
  rx: number;
  /** Vertical position inside the declared target, 0..1. */
  ry: number;
}

export interface EventContext {
  viewport: Viewport;
  input: InputKind;
}

/** One event as a browser sends it. It never carries identity. */
export interface ClientEvent {
  kind: EventKind;
  ts: string;
  screen: string;
  from?: string;
  name?: string;
  target?: string;
  value?: number;
  outcome?: Outcome;
  pos?: EventPosition;
  scroll?: number;
  props?: Record<string, PropValue>;
  ctx: EventContext;
  release: string;
  page: string;
  seq: number;
}

export interface ClientBatch {
  v: typeof CONTRACT_VERSION;
  events: ClientEvent[];
}

/** The fields only the product's server stamps. */
export interface StampedFields {
  product: string;
  surface: Surface;
  env: Env;
  screen_class: ScreenClass;
  actor?: string;
  session?: string;
  role?: string;
  tenant?: string;
  received_at: string;
}

/** A client event after the product's server checked and stamped it. */
export interface GateEvent extends ClientEvent, StampedFields {}

export interface GateBatch {
  v: typeof CONTRACT_VERSION;
  product: string;
  events: GateEvent[];
}

export type CatalogPropDecl =
  | { enum: readonly string[] }
  | { type: 'number'; min?: number; max?: number }
  | { type: 'boolean' };

export interface CatalogScreen {
  template: string;
  class: ScreenClass;
  positions?: boolean;
}

export interface CatalogAction {
  name: string;
  props?: Readonly<Record<string, CatalogPropDecl>>;
}

/** A product's `telemetry.catalog.json` (telemetry-catalog/v1). */
export interface Catalog {
  contract: 'telemetry-catalog/v1';
  product: string;
  roles: readonly string[];
  excluded?: readonly string[];
  screens: readonly CatalogScreen[];
  actions: readonly CatalogAction[];
  targets: readonly string[];
}
