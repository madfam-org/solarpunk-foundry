/**
 * @madfam/product-telemetry: the shared core of telemetry.event/v1.
 *
 * No DOM access and no Node-only API here, so it is safe in a browser bundle, a
 * Node 20+ server and an edge runtime. The browser client, the product-side
 * route handler and the gate handler live in the `./browser`, `./server` and
 * `./gate` entry points.
 */

export {
  BODY_MAX_BYTES,
  CLIENT_BATCH_MAX_EVENTS,
  CONTRACT_VERSION,
  ENVS,
  ERROR_CLASSES,
  EVENT_KINDS,
  GATE_BATCH_MAX_EVENTS,
  GATE_BODY_MAX_BYTES,
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
} from './contract';
export type {
  Catalog,
  CatalogAction,
  CatalogPropDecl,
  CatalogScreen,
  ClientBatch,
  ClientEvent,
  DropReason,
  Env,
  ErrorClass,
  EventContext,
  EventKind,
  EventPosition,
  GateBatch,
  GateEvent,
  InputKind,
  Outcome,
  PropValue,
  ReservedAction,
  ScreenClass,
  StampedFields,
  Surface,
  Viewport,
  VitalName,
} from './contract';

export { checkClientBatch, checkClientEvent, checkGateEnvelope, checkGateEvent } from './validate';
export type {
  CheckClientBatchResult,
  CheckClientEventResult,
  CheckGateEnvelopeResult,
  CheckGateEventResult,
} from './validate';

export { applyCatalog, checkGateBatch, isExcluded } from './catalog';
export type { ApplyCatalogResult, CheckGateBatchResult, GateDropReason } from './catalog';

export { matchScreen } from './match';
export { pseudonym } from './crypto';
