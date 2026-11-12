# @madfam/product-telemetry

> **Boundary checkpoint (2026-11-12, platform ops):** public package surface.
> Public-safe API and usage detail only; no private topology, node identities,
> credentials or cost data.
> Policy: [`docs/PUBLIC_REPO_BOUNDARY.md`](../../docs/PUBLIC_REPO_BOUNDARY.md)

Privacy-first product telemetry: which screens people use, which actions they take, where they
get stuck, and how fast the pages are, without collecting who they are or what they typed.

It implements the `telemetry.event/v1` and `telemetry-catalog/v1` contracts. The three contract
files ship with the package, byte-identical to the canonical copies, in
[`contracts/`](./contracts/):

| File | What it is |
|---|---|
| `telemetry-event.v1.json` | JSON Schema (2020-12): `ClientBatch` (browser → product server) and `GateBatch` (product server → gate) |
| `telemetry-catalog.v1.json` | JSON Schema for a product's `telemetry.catalog.json` |
| `telemetry-event.v1.fixtures.json` | Shared conformance samples; this package's tests run against them |

Not to be confused with [`@madfam/telemetry`](../telemetry/README.md), which is OpenTelemetry
tracing for services. This package is about how people use a product.

Status (2026-11-12): version 0.1.0, not yet published. Tested in CI only, against the fixtures
and unit tests in `src/__tests__/`. No product runs it yet.

## How it flows

```text
browser ──ClientBatch──► product server (same origin) ──GateBatch──► gate
           no identity     checks schema + catalogue,                checks again, drops and counts,
                           drops props / pos per screen class,       stores
                           stamps product, surface, env, class,
                           actor and session (HMAC), role, tenant
```

## The five rules

1. **Closed objects.** A field that is not in the schema is refused.
2. **Catalogue first.** Every screen, action, target and prop must be declared in the product's
   catalogue (reserved action names such as `ui.rage` are always allowed). Anything else is
   dropped and counted by reason. A screen under an `excluded` prefix carries nothing at all.
3. **Screen class.** On a `restricted` screen the server removes `props`, and removes click
   positions unless the catalogue allows positions on that screen.
4. **Identity is the server's.** The browser never sends who the person is. The product's server
   stamps pseudonyms: `hex(HMAC-SHA-256(key, product + ":" + id))[0:32]`, with a key only that
   product holds. The receive time is the server's clock.
5. **Never carried:** IP address, user-agent string, cookie, account id, name, e-mail, record id,
   URL, query string, title, page content, form value, free text.

## Install

```bash
pnpm add @madfam/product-telemetry --registry=https://npm.madfam.io
```

Zero runtime dependencies. The browser entry point targets evergreen browsers; the server and
gate entry points need a runtime with Web-standard `Request`, `Response`, `fetch` and
`crypto.subtle` (Node 20+, or an edge runtime).

| Entry point | Use it in |
|---|---|
| `@madfam/product-telemetry` | Anywhere: types, constants, `checkClientEvent`, `applyCatalog`, `matchScreen`, `checkGateBatch`, `pseudonym` |
| `@madfam/product-telemetry/browser` | The product's client bundle |
| `@madfam/product-telemetry/server` | The product's own route handler |
| `@madfam/product-telemetry/gate` | The gate service |

## Browser

```ts
import { createTelemetryClient } from '@madfam/product-telemetry/browser';
import catalog from '../telemetry.catalog.json';

export const telemetry = createTelemetryClient({
  release: process.env.NEXT_PUBLIC_RELEASE ?? 'dev',
  screens: catalog.screens.map((s) => s.template),
  // endpoint: '/api/t',  // default; other origins are refused
});

// On every route change (for example in a Next.js layout effect):
telemetry.view(window.location.pathname);

// A declared action. Pass the element to add its data-tm target and the click position inside it.
<button data-tm="session.save_button" onClick={(e) => telemetry.action('session.save', {
  outcome: 'ok', props: { mode: 'edit' }, element: e.currentTarget,
})}>Save</button>
```

What the client does on its own (each can be turned off):

- **Signals** (`autoSignals`): `ui.rage` (3 clicks within 700 ms and 24 px), `ui.dead` (a click
  on nothing interactive), `nav.back_quick` (back within 5 s of a view). The dead-click check is a
  heuristic over tag names, roles, `tabindex`, inline `onclick` and `data-tm`: an element made
  clickable only by a framework handler counts as dead until it gets a role or a `data-tm`.
- **Errors** (`autoErrors`): uncaught errors and unhandled rejections as `chunk_load` or
  `unhandled`. Messages and stacks are never sent; the message is only read to tell the two apart.
- **Vitals** (`autoVitals`): LCP, FCP and TTFB for the first screen; CLS and INP (approximate:
  the slowest interaction at or over 40 ms) for the screen in view when the page is hidden.
  Values are milliseconds. **CLS is a unitless score, so it is sent as score × 1000, rounded**
  (a CLS of 0.1 arrives as `100`).
- **Scroll depth**: attached to every action event as `scroll`, the deepest decile (0..10) of the
  page reached so far on the current screen.

It batches events (every 5 s, at 50 events, and when the page is hidden) and sends them with
`navigator.sendBeacon`, falling back to `fetch` with `keepalive`. Failures are dropped silently.
It sets no cookie and uses no `localStorage` or `sessionStorage`; the product's own session
cookie travels with the same-origin request as it would with any other. The page id is random
per page load. Outside a browser, `createTelemetryClient` returns a no-op client, so importing
it during server rendering is safe.

## Product server (Next.js App Router)

```ts
// app/api/t/route.ts
import type { Catalog } from '@madfam/product-telemetry';
import { createTelemetryHandler } from '@madfam/product-telemetry/server';
import catalogJson from '@/telemetry.catalog.json';
import { getSession } from '@/lib/auth';

export const POST = createTelemetryHandler({
  product: 'example-app',
  surface: 'app',
  env: 'production',
  catalog: catalogJson as Catalog,
  enabled: () => process.env.TELEMETRY_ENABLED === 'true',
  identify: async (req) => {
    const s = await getSession(req);
    return s ? { accountId: s.userId, sessionId: s.id, role: s.roleClass, optedOut: s.telemetryOptOut } : null;
  },
  hmacKey: process.env.TELEMETRY_HMAC_KEY,
  gate: { url: process.env.TELEMETRY_GATE_URL, token: process.env.TELEMETRY_GATE_TOKEN },
});
```

Behaviour, in order: not `POST` → 405; disabled → 204 without reading the body; body over
32 KiB → 413; not a `ClientBatch` → 400 `{"error":"bad_batch"}`; no identity (when required) →
401 `{"error":"no_session"}`, never a redirect; opted out → 204, dropped; identity but no HMAC
key → 204, dropped. Each event is checked and the catalogue applied; the kept ones are stamped
and forwarded with a bearer token, aborting after 1.5 s. After a valid batch the answer is
**always 204**, whatever the gate did; the handler never throws. `onDrop(reason, count)` and
`onForward({ sent, status })` report what happened, for metrics.

## Gate

```ts
import { createGateHandler } from '@madfam/product-telemetry/gate';
export const POST = createGateHandler({ catalogs, tokens, killed: () => killSwitch, store: saveEvents });
```

`tokens` maps each product to the SHA-256 hex of its bearer token (compared in constant time).
A token for another product is 401; a killed product is 202 and dropped; the body cap is 256 KiB;
`store` failing answers 503. Event contents are never logged or echoed.

## What it never collects

IP addresses, user-agent strings, cookies (it reads none and sets none), account ids, names,
e-mail addresses, record ids, URLs, query strings, page titles, page text, attribute values other
than `data-tm`, form values and free text. Prop values are short lowercase tokens checked against
the catalogue, so free text cannot pass.

## Development

```bash
pnpm -C packages/product-telemetry typecheck
pnpm -C packages/product-telemetry lint
pnpm -C packages/product-telemetry test
pnpm -C packages/product-telemetry build
```

The vendored contract files are not edited here. A contract change lands in its canonical home
first and is copied here byte-identical in the same change set.
