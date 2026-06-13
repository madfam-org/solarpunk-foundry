import { describe, expect, it } from 'vitest';
import {
  DEFAULT_REPLAY_TOLERANCE_SECONDS,
  InMemoryIdempotencyStore,
  computeSignature,
  ensureFirstDelivery,
  parseSignatureHeader,
  signPayload,
  verifySignature,
} from '../index';

const SECRET = 'whsec_test_dhanam_2026';
const BODY = JSON.stringify({ event_id: 'evt_123', type: 'payment.succeeded', amount: 129900 });
const T = 1_700_000_000;

describe('parseSignatureHeader', () => {
  it('parses timestamp and one or more v1 signatures', () => {
    expect(parseSignatureHeader('t=1700000000,v1=abc')).toEqual({
      timestamp: 1_700_000_000,
      signatures: ['abc'],
    });
    expect(parseSignatureHeader('t=1700000000,v1=abc,v1=def')).toEqual({
      timestamp: 1_700_000_000,
      signatures: ['abc', 'def'],
    });
  });

  it('returns null for missing/malformed headers', () => {
    expect(parseSignatureHeader(undefined)).toBeNull();
    expect(parseSignatureHeader('')).toBeNull();
    expect(parseSignatureHeader('v1=abc')).toBeNull(); // no timestamp
    expect(parseSignatureHeader('t=abc,v1=def')).toBeNull(); // non-integer t
    expect(parseSignatureHeader('t=1700000000')).toBeNull(); // no signature
  });
});

describe('signPayload / verifySignature roundtrip', () => {
  it('verifies a freshly signed payload', () => {
    const header = signPayload({ secret: SECRET, body: BODY, timestamp: T });
    expect(header).toBe(`t=${T},v1=${computeSignature(SECRET, T, BODY)}`);
    const result = verifySignature({ secret: SECRET, body: BODY, header, now: T });
    expect(result).toEqual({ valid: true, timestamp: T });
  });

  it('rejects a tampered body', () => {
    const header = signPayload({ secret: SECRET, body: BODY, timestamp: T });
    const result = verifySignature({
      secret: SECRET,
      body: BODY + ' ',
      header,
      now: T,
    });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('no_match');
  });

  it('rejects a wrong secret', () => {
    const header = signPayload({ secret: SECRET, body: BODY, timestamp: T });
    const result = verifySignature({ secret: 'whsec_wrong', body: BODY, header, now: T });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('no_match');
  });
});

describe('replay window', () => {
  it('accepts timestamps inside the tolerance', () => {
    const header = signPayload({ secret: SECRET, body: BODY, timestamp: T });
    const result = verifySignature({
      secret: SECRET,
      body: BODY,
      header,
      now: T + DEFAULT_REPLAY_TOLERANCE_SECONDS,
    });
    expect(result.valid).toBe(true);
  });

  it('rejects timestamps outside the tolerance', () => {
    const header = signPayload({ secret: SECRET, body: BODY, timestamp: T });
    const result = verifySignature({
      secret: SECRET,
      body: BODY,
      header,
      now: T + DEFAULT_REPLAY_TOLERANCE_SECONDS + 1,
    });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('timestamp_out_of_tolerance');
  });
});

describe('secret rotation', () => {
  it('verifies against any of several secrets', () => {
    const header = signPayload({ secret: 'whsec_new', body: BODY, timestamp: T });
    const result = verifySignature({
      secret: ['whsec_old', 'whsec_new'],
      body: BODY,
      header,
      now: T,
    });
    expect(result.valid).toBe(true);
  });
});

describe('missing / malformed headers', () => {
  it('flags a missing header', () => {
    expect(verifySignature({ secret: SECRET, body: BODY, header: undefined, now: T })).toEqual({
      valid: false,
      reason: 'missing_header',
    });
  });

  it('flags a malformed header', () => {
    expect(verifySignature({ secret: SECRET, body: BODY, header: 'garbage', now: T })).toEqual({
      valid: false,
      reason: 'malformed_header',
    });
  });
});

describe('idempotency', () => {
  it('processes the first delivery and skips duplicates', async () => {
    const store = new InMemoryIdempotencyStore();
    expect(await ensureFirstDelivery(store, 'evt_123')).toBe(true);
    expect(await ensureFirstDelivery(store, 'evt_123')).toBe(false);
    expect(await ensureFirstDelivery(store, 'evt_456')).toBe(true);
  });

  it('throws when the event id is empty', async () => {
    const store = new InMemoryIdempotencyStore();
    await expect(ensureFirstDelivery(store, '')).rejects.toThrow();
  });
});
