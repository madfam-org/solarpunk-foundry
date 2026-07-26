# Self-Contained Services — position paper

**Status: ASPIRATIONAL / PARTLY SUPERSEDED.**
**Written: undated (2025 era). Reviewed and labelled: 2026-07-25.**

> ## Read this first
>
> This is a **position paper**, not a description of how the ecosystem works.
> It argues for eliminating cross-repo npm dependencies in favour of
> HTTP-first integration with copied types.
>
> **The ecosystem went partly the other way**, and that is worth knowing before
> you act on it:
>
> | This paper says | What actually happened |
> |---|---|
> | Don't distribute client SDKs as npm packages | Janua publishes **nine** SDK packages (TypeScript, Next.js, React, React Native, Vue, SvelteKit, Python, Go, Flutter) |
> | Don't create shared packages everything depends on | This repository publishes **13** `@madfam/*` packages |
> | "Don't publish to a private npm registry (Verdaccio)" | `npm.madfam.io` runs Verdaccio in production and is the ecosystem publish target |
> | Copy auth code into each service | The auth contract is a **shared, audited** verification pattern; divergent per-service implementations produced the 2026-04-23 audit findings H3/H4 |
> | Copy types rather than share them | [`MONETIZATION_PATH_READINESS.md`](../MONETIZATION_PATH_READINESS.md)'s headline recommendation is to **adopt** the shared `@madfam/webhook-attribution` package, precisely because two independent implementations had already drifted into byte-identical duplication |
>
> *All counts verified 2026-07-25 by reading `janua/packages/` and
> `solarpunk-foundry/packages/`.*
>
> **What survives.** The paper's core diagnosis is still correct and still
> useful: `file:../../../` links break Docker build context, unpublished
> packages break builds, and version coupling across repos is fragile. Its
> conclusion — *always duplicate* — is the part the ecosystem rejected.
>
> **The synthesis in current practice:** share what must not drift (auth
> verification, signed-event envelopes, cross-service types) as versioned
> published packages; own what is genuinely local (a thin fetch wrapper over
> another service's REST API). The dividing line is *"would two independent
> implementations be a security or correctness hazard?"* For HMAC verification
> and JWT validation the answer is yes; for `GET /materials/{id}` it is no.
>
> **The five-week timeline at the end has no anchor date and was never
> executed as written.** Treat it as illustrative.

---

## The problem it identified

Cross-repo npm dependencies coupled services together:

```
digifab-quoting ──depends on──> @forgesight/client
madfam-site     ──depends on──> @avala/client
multiple apps   ──depends on──> @janua/react-sdk
multiple apps   ──depends on──> @madfam/ui        (file: link)
```

Pain points, all real:

- Docker builds fail when a package is not published
- `file:../../../` links break Docker build-context isolation
- Services cannot be deployed independently
- Version coupling creates fragile chains

---

## The proposal: HTTP-first

**Principle: services communicate via APIs, not shared code.** Each client SDK
is a thin HTTP wrapper; instead of distributing it, each consuming app copies
the types it needs and owns its integration code.

### Step 1 — every service exposes an OpenAPI spec

```
GET /api/v1/openapi.json   # machine-readable
GET /api/v1/docs           # Swagger UI
```

**Still good advice, and still not universal.** An OpenAPI document is the
cheapest way to make an integration self-describing.

### Step 2 — consuming apps own their client code

```typescript
// <consumer>/src/integrations/forgesight/client.ts
export class ForgesightClient {
  constructor(private baseUrl: string, private apiKey?: string) {}

  async getMaterial(id: string): Promise<Material> {
    const res = await fetch(`${this.baseUrl}/api/v1/materials/${id}`, {
      headers: this.apiKey ? { 'X-API-Key': this.apiKey } : {},
    });
    if (!res.ok) throw new Error(`Forgesight error: ${res.status}`);
    return res.json();
  }
}
```

Or generate the client from the OpenAPI spec.

> **[Corrected 2026-07-25]** The original used a `forgesight-api` base URL on
> port `8100` as its example. That port appears in no registry. Use the port the
> target repository's `enclii.yaml` declares, or resolve by Kubernetes Service
> name in-cluster. See
> [`../PORT_ALLOCATION.md`](../PORT_ALLOCATION.md).

### Step 3 — remove the npm dependency

Replace `"@forgesight/client": "^0.1.0"` with an owned
`src/integrations/<service>/` directory.

**This remains reasonable for plain REST data clients.**

---

## Where the paper is wrong: authentication

> ## Do not follow the auth section of this paper
>
> The original proposed, as "Option A: Standard JWT Middleware (Preferred)":
>
> ```typescript
> // DO NOT USE — shared symmetric secret. This is the defect
> // the 2026-04-23 audit filed as findings H3/H4.
> jwt.verify(token, process.env.JANUA_JWT_SECRET, { issuer: ... });
> ```
>
> **There is no shared symmetric JWT secret in the Janua contract.**
> Verification is **RS256 only**, against the public JWKS at
> `https://auth.madfam.io/.well-known/jwks.json`, with HS256 fail-closed.
>
> Auth verification is the clearest case where "each app implements its own"
> failed in practice: two services implemented it independently and both got it
> wrong in the same way. Use `@janua/jwt-utils` or a published Janua SDK, or
> follow the verified reference implementation in
> [`../JANUA_INTEGRATION.md`](../JANUA_INTEGRATION.md). Do not hand-roll it, and
> never introduce a `JANUA_JWT_SECRET`.

---

## Where the paper's advice still holds

| Case | Guidance |
|---|---|
| Thin REST client over another service's public API | **Own it.** Copy the types you use; a fetch wrapper is 50 lines. |
| `file:` links to another repository | **Eliminate.** They break Docker context. This is unambiguous. |
| Types for one endpoint you call | **Copy the subset you need.** Full type mirroring is a coupling you did not ask for. |
| Auth verification | **Share.** Published SDK or the audited reference pattern. |
| Signed-event envelopes (HMAC signing/verification) | **Share.** `@madfam/webhook-attribution`. |
| Cross-service event shapes | **Share.** `@madfam/types`. |
| UI components | **Per-app.** `@madfam/ui` is deprecated; the UI system moved to a decentralised per-app model. |

The paper's anti-pattern list, re-examined:

| Original claim | Standing 2026-07-25 |
|---|---|
| ❌ Don't create a "common" package everything depends on | **Partly rejected.** Depends what is in it: shared *contracts* yes, shared *everything* no. |
| ❌ Don't use git submodules for runtime dependencies | **Still holds.** |
| ❌ Don't publish to a private npm registry | **Rejected.** `npm.madfam.io` is the ecosystem publish target. |
| ❌ Don't share database schemas across services | **Still holds**, and is now the stronger "own once, query everywhere" data-boundary contract. |
| ❌ Don't import types from another service's source | **Still holds** — import from a published package or copy, never reach across a repo boundary. |

---

## Related

- [`../JANUA_INTEGRATION.md`](../JANUA_INTEGRATION.md) — the auth contract this
  paper's Tier 2 section gets wrong
- [`../MONETIZATION_PATH_READINESS.md`](../MONETIZATION_PATH_READINESS.md) — the
  shared-package case study
- [`../ECOSYSTEM_STATUS.md`](../ECOSYSTEM_STATUS.md) — the data-boundary contract
- [`FEDERATED_ARCHITECTURE_README.md`](./FEDERATED_ARCHITECTURE_README.md) — the
  other historical architecture document
