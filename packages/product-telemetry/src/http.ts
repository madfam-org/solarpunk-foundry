/** Small Web-standard Request/Response helpers shared by the server and gate handlers. */

export type ReadBodyResult = { ok: true; text: string } | { ok: false; reason: 'too_large' | 'unreadable' };

/** Reads a request body as UTF-8, refusing anything over `maxBytes` without buffering it all. */
export async function readCappedBody(req: Request, maxBytes: number): Promise<ReadBodyResult> {
  const declared = req.headers.get('content-length');
  if (declared !== null && Number(declared) > maxBytes) return { ok: false, reason: 'too_large' };
  if (!req.body) return { ok: true, text: '' };

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, reason: 'too_large' };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, reason: 'unreadable' };
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { ok: true, text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, reason: 'unreadable' };
  }
}

/** JSON.parse that returns `undefined` instead of throwing. */
export function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

const NO_STORE = { 'cache-control': 'no-store' };

export function empty(status: number, headers: Record<string, string> = {}): Response {
  return new Response(null, { status, headers: { ...NO_STORE, ...headers } });
}

export function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...NO_STORE, 'content-type': 'application/json' },
  });
}

/** Calls an observer callback; an observer that throws never breaks the handler. */
export function safeCall<A extends unknown[]>(fn: ((...args: A) => void) | undefined, ...args: A): void {
  if (!fn) return;
  try {
    fn(...args);
  } catch {
    // Observers are best-effort.
  }
}
