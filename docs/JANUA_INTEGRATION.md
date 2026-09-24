# Janua Authentication Integration Guide

**Last verified: 2026-07-25** — against `janua/apps/api/app/main.py`,
`janua/apps/api/app/core/jwt_manager.py`, `janua/apps/api/app/routers/v1/auth.py`,
`janua/packages/`, and `internal-devops/ECOSYSTEM.md`.
**Updated 2026-09-23** — one env contract (§ "The env contract"), the MADFAM Next.js
adapter, and account switching, per owner rulings of 2026-09-21 and 2026-09-23. The
`@madfam/janua-next` facts were read from its source (version 0.3.0) that day.

> ## Read this before copying any code
>
> **Every previous revision of this document taught the wrong thing.** It was
> organised around the premise *"All services MUST use the same JWT secret"* and
> its FastAPI example hardcoded `JANUA_ALGORITHM = "HS256"`.
>
> That is verbatim the defect the 2026-04-23 ecosystem audit filed as findings
> **H3** and **H4** against two production services. The remediation was
> `algorithms=["RS256"]` with a required JWKS URL, and **HS256 fail-closed**.
>
> **There is no shared symmetric JWT secret in the Janua contract. There never
> should be one.** If you find a `JANUA_JWT_SECRET` in a service, that is a
> finding, not a configuration step.

---

## The contract, in one paragraph

Janua is the identity provider for the MADFAM ecosystem. Every authenticated
service verifies Janua-issued JWTs **asymmetrically**: fetch the public keys
from the JWKS endpoint, verify the signature with **RS256 only**, and check the
issuer, audience and expiry. No service implements its own password login,
session management, or user store. No service holds a Janua signing key —
services hold no Janua secret at all for token verification, because
verification needs only public material.

| Item | Value |
|---|---|
| Production issuer | `https://auth.madfam.io` |
| JWKS endpoint | `https://auth.madfam.io/.well-known/jwks.json` |
| OIDC discovery | `https://auth.madfam.io/.well-known/openid-configuration` |
| Signing algorithm | **RS256 only.** HS256 must be rejected. |
| Local dev issuer | `http://localhost:4100` (default; see the note on issuers below) |

*Verified 2026-07-25: `jwt_manager.py` sets `self.algorithm = "RS256"` and
raises a startup error if RS256 keys are absent in production — "RS256 keys
required in production".*

### Janua is single-issuer per deployment

The issuer is derived from the `JANUA_CUSTOM_DOMAIN` environment variable, **not
from the request `Host` header**:

```python
custom_domain = os.getenv("JANUA_CUSTOM_DOMAIN")
if custom_domain:
    base_url = f"https://{custom_domain}".rstrip("/")
else:
    base_url = settings.API_BASE_URL.rstrip("/")
issuer = base_url
```

*Verified 2026-07-25 in `janua/apps/api/app/main.py`.*

The practical consequences:

- **`iss` is never the literal string `"janua"`.** In production it is
  `https://auth.madfam.io`. A strategy configured with `issuer: 'janua'` will
  reject every real token.
- **A second Janua hostname cannot be served without breaking OIDC.** This is
  why `auth.selva.town` must never be routed: Janua reached there would still
  emit `issuer=https://auth.madfam.io`, and issuer validation would fail. All
  Selva surfaces use `auth.madfam.io`. See
  [`ECOSYSTEM_STATUS.md`](./archive/ECOSYSTEM_STATUS.md#authselvatown--must-never-be-routed).

---

## The env contract

*Owner ruling, 2026-09-23.* Every MADFAM service that talks to Janua uses the same three
variables. The schema of record is `januaOidcSchema` in
[`@madfam/env`](../packages/env/README.md):

| Variable | Value | Secret? |
|---|---|---|
| `AUTH_JANUA_ISSUER` | the full issuer URL — `https://auth.madfam.io` in production | No |
| `AUTH_JANUA_CLIENT_ID` | issued by Janua at client registration | No — a public identifier |
| `AUTH_JANUA_CLIENT_SECRET` | issued alongside, for **confidential** clients only | **Yes** — Vault → External Secrets only, server-side only |

Everything else is derived, not configured:

- **JWKS URL** — `${AUTH_JANUA_ISSUER}/.well-known/jwks.json` (or read `jwks_uri` from
  discovery). Do not add a separate JWKS variable.
- **Expected audience** — your client ID, unless your Janua client registration says
  otherwise; in that case it is a **code constant** in your app (the way
  `@madfam/janua-next` takes it), never guessed from the environment, because a wrong
  audience is a silent authorization hole rather than a crash.

No `NEXT_PUBLIC_JANUA_*` variable is part of the contract: the issuer is not a secret, but a
browser bundle has no business deciding it. The retired names `JANUA_ISSUER`,
`JANUA_JWKS_URL`, `JANUA_AUDIENCE`, `NEXT_PUBLIC_JANUA_URL`, `NEXT_PUBLIC_JANUA_API_URL` and
`NEXT_PUBLIC_JANUA_CLIENT_ID` appear in older services and in earlier revisions of this
guide; migrate them when you touch the service. **`JANUA_JWT_SECRET` must not exist at all.**

---

## API endpoints

**All v1 routes mount under `/api/v1`.** *Verified 2026-07-25:
`app.include_router(auth_v1.router, prefix="/api/v1")` in `main.py`, with the
router itself declared `APIRouter(prefix="/auth", …)` in `routers/v1/auth.py`.*

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/auth/register` | POST | User registration |
| `/api/v1/auth/login` | POST | Login; returns access + refresh tokens |
| `/api/v1/auth/refresh` | POST | Refresh access token |
| `/api/v1/auth/logout` | POST | Invalidate session |
| `/api/v1/auth/me` | GET | Current user |
| `/api/v1/organizations` | GET/POST | Organisation management |
| `/api/v1/oauth/authorize` | GET | OAuth 2.0 authorisation |
| `/api/v1/oauth/token` | POST | Token exchange |
| `/api/v1/oauth/userinfo` | GET | OIDC UserInfo |
| `/api/v1/oauth/introspect` | POST | Token introspection |
| `/api/v1/oauth/revoke` | POST | Token revocation |
| `/api/v1/oauth/register` | POST | Dynamic client registration |

Two endpoints sit **outside** the `/api/v1` prefix, by OIDC convention:

| Endpoint | Note |
|---|---|
| `/.well-known/jwks.json` | JWKS — this is the one you need |
| `/.well-known/openid-configuration` | Discovery |
| `/logout` | `end_session_endpoint` |

Previous revisions of this document listed `/auth/login`, `/users/me` and
`/organizations` without the prefix — and then contradicted themselves 400
lines later with correct `/api/v1/...` curl examples.

### OIDC discovery response

```json
{
  "issuer": "https://auth.madfam.io",
  "authorization_endpoint": "https://auth.madfam.io/api/v1/oauth/authorize",
  "token_endpoint": "https://auth.madfam.io/api/v1/oauth/token",
  "userinfo_endpoint": "https://auth.madfam.io/api/v1/oauth/userinfo",
  "jwks_uri": "https://auth.madfam.io/.well-known/jwks.json",
  "introspection_endpoint": "https://auth.madfam.io/api/v1/oauth/introspect",
  "revocation_endpoint": "https://auth.madfam.io/api/v1/oauth/revoke",
  "end_session_endpoint": "https://auth.madfam.io/logout",
  "registration_endpoint": "https://auth.madfam.io/api/v1/oauth/register",
  "id_token_signing_alg_values_supported": ["RS256"],
  "grant_types_supported": ["authorization_code", "refresh_token", "client_credentials"]
}
```

*Shape verified 2026-07-25 against the discovery handler in `main.py`. Note
`id_token_signing_alg_values_supported` is `["RS256"]` and nothing else.*

---

## Token structure

Access token claims, as constructed by `JWTManager.create_access_token`
(*verified 2026-07-25*):

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "jti": "unique-token-id",
  "iat": 1799999999,
  "exp": 1800003599,
  "type": "access",
  "iss": "https://auth.madfam.io",
  "aud": "<audience>"
}
```

Additional claims are merged in per deployment and per client. The ecosystem
contract names `sub`, `email`, `roles`, `org_id`, and `rfc` (fiscal services
only) as the claims a consuming service may rely on
(*source: `internal-devops/ECOSYSTEM.md` cross-repo conventions*).

**Do not assume a claim is present because a code sample reads it.** Check
against the token your deployment actually issues; `roles` and `org_id` arrive
via `additional_claims`, not from the base payload.

---

## Verification patterns

The pattern is the same in every language: fetch JWKS, cache it, select the key
by `kid`, verify RS256, check `iss` / `aud` / `exp`. What follows is the shape,
not a drop-in library.

### FastAPI / Python

```python
import os
from typing import Any, Dict, Optional

import httpx
from cachetools import TTLCache
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError

JANUA_ISSUER = os.environ["AUTH_JANUA_ISSUER"]     # e.g. https://auth.madfam.io
JANUA_JWKS_URL = f"{JANUA_ISSUER}/.well-known/jwks.json"
JANUA_AUDIENCE = os.environ["AUTH_JANUA_CLIENT_ID"]  # or a code constant, see "The env contract"

# RS256 ONLY. Do not add HS256 to this list — it is the 2026-04-23 audit
# finding H3/H4, and it turns the public JWKS material into a forging key.
ALLOWED_ALGORITHMS = ["RS256"]

_jwks_cache: TTLCache = TTLCache(maxsize=1, ttl=600)
security_scheme = HTTPBearer(auto_error=False)


class JanuaAuthError(HTTPException):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


def _get_jwks() -> Dict[str, Any]:
    jwks = _jwks_cache.get("jwks")
    if jwks is None:
        response = httpx.get(JANUA_JWKS_URL, timeout=5.0)
        response.raise_for_status()
        jwks = response.json()
        _jwks_cache["jwks"] = jwks
    return jwks


def verify_janua_token(token: str) -> Dict[str, Any]:
    try:
        header = jwt.get_unverified_header(token)
        if header.get("alg") not in ALLOWED_ALGORITHMS:
            raise JanuaAuthError("Unsupported token algorithm")

        key = next(
            (k for k in _get_jwks()["keys"] if k["kid"] == header.get("kid")),
            None,
        )
        if key is None:
            _jwks_cache.clear()          # key rotation: refetch once
            key = next(
                (k for k in _get_jwks()["keys"] if k["kid"] == header.get("kid")),
                None,
            )
        if key is None:
            raise JanuaAuthError("Unknown signing key")

        return jwt.decode(
            token,
            key,
            algorithms=ALLOWED_ALGORITHMS,
            issuer=JANUA_ISSUER,
            audience=JANUA_AUDIENCE,
        )
    except JWTError as exc:
        raise JanuaAuthError(f"Invalid token: {exc}") from exc


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> Dict[str, Any]:
    if not credentials:
        raise JanuaAuthError("Missing authentication credentials")
    payload = verify_janua_token(credentials.credentials)
    return {
        "user_id": payload.get("sub"),
        "email": payload.get("email"),
        "organization_id": payload.get("org_id"),
        "roles": payload.get("roles", []),
    }
```

Required environment: `AUTH_JANUA_ISSUER`, `AUTH_JANUA_CLIENT_ID`.
**Not** `JANUA_JWT_SECRET` — that variable should not exist.

### NestJS

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JanuaJwtStrategy extends PassportStrategy(Strategy, 'janua-jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,

      // Asymmetric verification against Janua's published keys.
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `${config.getOrThrow('AUTH_JANUA_ISSUER')}/.well-known/jwks.json`,
      }),

      algorithms: ['RS256'],                            // RS256 only
      issuer: config.getOrThrow('AUTH_JANUA_ISSUER'),   // full URL, never 'janua'
      audience: config.getOrThrow('AUTH_JANUA_CLIENT_ID'),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      organizationId: payload.org_id,
      roles: payload.roles ?? [],
    };
  }
}
```

### Next.js — `@madfam/janua-next` (MADFAM apps) or Auth.js (alternative)

*Owner ruling, 2026-09-23.* Both paths use the env contract above.

**MADFAM Next.js apps: `@madfam/janua-next`.** The ecosystem's own Next 15 auth kit: edge
silent-refresh middleware, the session-cookie model, the scanner-proof magic-link
interstitial and the logout seam. Its source lives in the private `madfam-js` repo
(version 0.3.0 read 2026-09-23); it was extracted from a production app that still consumes
it. Configure it once from the contract variables — the package itself reads no environment
on its own:

```ts
// src/lib/janua.ts
import type { JanuaConfig } from '@madfam/janua-next';

export const janua: JanuaConfig = {
  issuerUrl: process.env.AUTH_JANUA_ISSUER!, // validate at boot with @madfam/env
  audience: 'my-app',                        // a code constant, never read from env
  loginPath: '/',
};
```

Known gap (2026-09-23): the package's convenience helper `januaConfigFromEnv()` still reads
the retired `JANUA_ISSUER_URL`. Build the config explicitly as above until the helper reads
`AUTH_JANUA_ISSUER`.

**Alternative: the Auth.js (`next-auth`) `janua` OIDC provider.** A confidential OIDC client
using `AUTH_JANUA_ISSUER`, `AUTH_JANUA_CLIENT_ID` and `AUTH_JANUA_CLIENT_SECRET` — the three
names follow Auth.js's `AUTH_<PROVIDER>_*` convention, which is why the contract uses them.
Nauta runs on this path.

`@janua/nextjs` (the SDK in the janua repo, below) still exists; it is not the recommended
path for MADFAM apps.

### Account switching (every signed-in UI)

*Owner directive 2026-09-21; client-portal scope ruled 2026-09-23. Full rule:
[`README.md`](../README.md) §IV.9.* Switching is client-only: add a `prompt` to the
authorize request.

| Control | Authorize request |
|---|---|
| «Cambiar de cuenta» | `prompt=select_account` — Janua's chooser over the sessions it holds |
| «Entrar como otra persona» | `prompt=login` — fresh credentials, adds an account |
| Sign out | RP-initiated logout at Janua's `end_session_endpoint` (from discovery) |

With Auth.js the prompt is the third argument of `signIn`:
`signIn('janua', { redirectTo }, { prompt: 'select_account' })`. Staff consoles expose all
three controls; client portals expose only «Entrar como otra persona» and sign-out; one
client-owned clinical application is exempt under its contract.

---

## SDKs

*Package names and versions verified 2026-07-25 by reading each package
manifest in `janua/packages/`.* Nine SDKs, not the four previously listed.

| Platform | Package | Version |
|---|---|---|
| TypeScript (backend) | `@janua/typescript-sdk` | 0.1.4 |
| Next.js | `@janua/nextjs` | 0.2.0 |
| React | `@janua/react-sdk` | 0.1.4 |
| React Native | `@janua/react-native` | 0.1.0 |
| Vue | `@janua/vue-sdk` | 0.1.0 |
| SvelteKit | `@janua/sveltekit-sdk` | 0.1.0 |
| Python | `janua` | 0.1.0b1 |
| Go | `github.com/madfam-org/janua/packages/go-sdk` | module |
| Flutter / Dart | `janua_flutter` | 1.0.0 |

Related packages in the same tree that are not SDKs but are commonly useful:
`@janua/jwt-utils`, `@janua/edge`, `@janua/core`, `@janua/cli`,
`@janua/mock-api`.

> Whether the npm-published versions on `npm.madfam.io` match these manifest
> versions was **not** verified — that needs a registry query. Treat the table
> as "what the source tree declares", not "what is published".

---

## Who verifies Janua tokens today

The verifier set as last listed in `janua/ECOSYSTEM.md` (read 2026-07-25): dhanam,
karafiel, forgesight, tezca, fortuna, digifab-quoting, selva-office, pravara-mes,
yantra4d, avala, phynd-crm, routecraft, symbiosis-hcm — all verifying via JWKS. **That list
is incomplete as of 2026-09-23:** it predates services created since August that sign in
through Janua (for example nauta, kalya and acervo, and enclii's own consoles). It has not
been re-derived since; re-reading each service's auth configuration would settle it.

This replaces the previous revision's diagram showing exactly three consumers
(Cotiza, Forgesight, MADFAM Site) and its all-unchecked "migration checklist",
which read as though none of the work had started. Forgesight's integration is
old enough to have been *patched* by the 2026-04-23 audit.

**Fleet conformance is nevertheless partial.** The 2026-07-16 internal
launch-readiness assessment rated the Janua SSO edge yellow, not green, and the
per-surface SSO uniformity matrix that would settle enforcement is recorded in
`internal-devops` as unavailable — a session artifact that was never committed.
**What would settle it:** commit that matrix to `internal-devops` and cite it by
path with a date; or probe each admin surface for an unauthenticated 200.

---

## Configuration in production

Production runs on k3s with ArgoCD GitOps. Configuration and secrets reach a
service through Vault → External Secrets Operator → a native Kubernetes Secret
consumed by the Deployment. There is no production `docker-compose`.

A previous revision of this document published a
`docker-compose.production.yml` block fanning a shared `JANUA_JWT_SECRET` into
four services. It was wrong twice over — wrong mechanism, and wrong idea.

What a service actually needs configured is the env contract above
(`AUTH_JANUA_ISSUER`, `AUTH_JANUA_CLIENT_ID`, and `AUTH_JANUA_CLIENT_SECRET` for confidential
clients). Only the secret is a secret. Verification needs none of them to be secret,
which is the whole point of asymmetric verification.

---

## Local testing

```bash
# Discovery — check the issuer and that RS256 is the only signing alg
curl -s http://localhost:4100/.well-known/openid-configuration | jq

# JWKS — expect a "keys" array with at least one RSA key
curl -s http://localhost:4100/.well-known/jwks.json | jq '.keys[] | {kid, kty, alg}'

# Register
curl -X POST http://localhost:4100/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "<GENERATE_AT_RUNTIME>"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:4100/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "<GENERATE_AT_RUNTIME>"}' \
  | jq -r '.access_token')

# Inspect the header — alg MUST be RS256, and there MUST be a kid
echo "$TOKEN" | cut -d. -f1 | base64 -d 2>/dev/null | jq
```

Port `4100` is the `enclii local up`-managed Janua API port. For consuming
services, use the port that repo's own `enclii.yaml` / dev script declares —
this document deliberately does not restate the port scheme, which has drifted
in several docs. See [`PORT_ALLOCATION.md`](./PORT_ALLOCATION.md).

---

## Adoption checklist for a new service

- [ ] Configure `AUTH_JANUA_ISSUER` and `AUTH_JANUA_CLIENT_ID` (plus
      `AUTH_JANUA_CLIENT_SECRET` for a confidential client) and validate them at boot
      with `@madfam/env`.
- [ ] Signed-in UI: add account switching (§ "Account switching").
- [ ] Verify with `algorithms: ["RS256"]` — an explicit allowlist, never
      "whatever the header says".
- [ ] Reject HS256 explicitly and fail closed if JWKS cannot be fetched.
- [ ] Validate `iss` against the full issuer URL, and `aud` against your client
      audience.
- [ ] Cache JWKS with a TTL, and refetch once on an unknown `kid` (key
      rotation) before rejecting.
- [ ] Confirm no `JANUA_JWT_SECRET` exists anywhere in the service.
- [ ] Register the OIDC client in Janua; store a confidential client secret in
      Vault, never in git.
- [ ] Set an explicit CORS allowlist — wildcards are banned ecosystem-wide
      (2026-04-23 audit findings H2/H5/H6).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Every token rejected, "issuer mismatch" | `issuer` configured as `janua` or as a bare hostname | Use the full issuer URL from discovery |
| Every token rejected after a Janua deploy | Signing key rotated; stale JWKS cache | Refetch JWKS on unknown `kid` before rejecting |
| Works locally, fails in production | Local issuer is `http://localhost:4100`; production is `https://auth.madfam.io` | Configure per environment; never hardcode |
| 404 on `/auth/login` | Missing the `/api/v1` prefix | Use `/api/v1/auth/login` |
| Token verifies but `roles` is empty | `roles` arrives via `additional_claims` and is deployment-dependent | Inspect a real token; do not assume |
| Service starts with no JWKS reachable and lets requests through | Fail-open verification | Fail closed. This is the audit finding pattern. |

---

## Related

- [`ECOSYSTEM_STATUS.md`](./archive/ECOSYSTEM_STATUS.md) — routes, retired endpoints,
  and the other three ecosystem-wide contracts
- [`INTEGRATION_TESTING.md`](./INTEGRATION_TESTING.md) — Janua ↔ Enclii
  integration test procedures
- [`PUBLIC_REPO_BOUNDARY.md`](./PUBLIC_REPO_BOUNDARY.md) — why no real client
  IDs or secrets appear in this document
