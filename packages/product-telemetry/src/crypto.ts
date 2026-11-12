/**
 * Web Crypto helpers. Only `globalThis.crypto.subtle` is used, so this runs in
 * browsers and in Node 20+ without importing `node:crypto`.
 */

const encoder = new TextEncoder();

function subtle(): SubtleCrypto {
  const s = globalThis.crypto?.subtle;
  if (!s) throw new Error('@madfam/product-telemetry: Web Crypto (globalThis.crypto.subtle) is not available');
  return s;
}

function toHex(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

let cachedKey: { secret: string; key: Promise<CryptoKey> } | null = null;

function hmacKey(secret: string): Promise<CryptoKey> {
  if (cachedKey && cachedKey.secret === secret) return cachedKey.key;
  const key = subtle().importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  cachedKey = { secret, key };
  key.catch(() => {
    if (cachedKey?.key === key) cachedKey = null;
  });
  return key;
}

/**
 * The contract's pseudonym: lowercase hex of HMAC-SHA-256(key, `${product}:${id}`),
 * first 32 characters. Meant for the product's server only; the key never
 * reaches a browser.
 */
export async function pseudonym(key: string, product: string, id: string): Promise<string> {
  const k = await hmacKey(key);
  const sig = await subtle().sign('HMAC', k, encoder.encode(`${product}:${id}`));
  return toHex(new Uint8Array(sig)).slice(0, 32);
}

/** Lowercase hex SHA-256 of a UTF-8 string. */
export async function sha256Hex(text: string): Promise<string> {
  const digest = await subtle().digest('SHA-256', encoder.encode(text));
  return toHex(new Uint8Array(digest));
}

/** Compares two strings in time that depends only on their lengths. */
export function timingSafeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}
