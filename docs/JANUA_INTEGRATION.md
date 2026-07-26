# Janua Authentication Integration Guide

**Last verified: 2026-07-25** — against `janua/apps/api/app/main.py`,
`janua/apps/api/app/core/jwt_manager.py`, `janua/apps/api/app/routers/v1/auth.py`,
`janua/packages/`, and `internal-devops/ECOSYSTEM.md`.

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
  [`ECOSYSTEM_STATUS.md`](./ECOSYSTEM_STATUS.md#authselvatown--must-never-be-routed).

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

JANUA_ISSUER = os.environ["JANUA_ISSUER"]          # e.g. https://auth.madfam.io
JANUA_JWKS_URL = os.environ["JANUA_JWKS_URL"]      # <issuer>/.well-known/jwks.json
JANUA_AUDIENCE = os.environ["JANUA_AUDIENCE"]

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

Required environment: `JANUA_ISSUER`, `JANUA_JWKS_URL`, `JANUA_AUDIENCE`.
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
        jwksUri: config.getOrThrow('JANUA_JWKS_URL'),
      }),

      algorithms: ['RS256'],                       // RS256 only
      issuer: config.getOrThrow('JANUA_ISSUER'),   // full URL, never 'janua'
      audience: config.getOrThrow('JANUA_AUDIENCE'),
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

### Next.js

Use the published SDK rather than hand-rolling. `@janua/nextjs` provides
middleware, a provider, and server-side session helpers; it validates against
JWKS.

```bash
pnpm add @janua/nextjs
```

```env
NEXT_PUBLIC_JANUA_URL=https://auth.madfam.io
JANUA_ISSUER=https://auth.madfam.io
JANUA_JWKS_URL=https://auth.madfam.io/.well-known/jwks.json
JANUA_AUDIENCE=<your-client-audience>
```

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

The current verifier set, per `janua/ECOSYSTEM.md`: dhanam, karafiel,
forgesight, tezca, fortuna, digifab-quoting, selva-office, pravara-mes,
yantra4d, avala, phynd-crm, routecraft, symbiosis-hcm — all verifying via JWKS.

This replaces the previous revision's diagram showing exactly three consumers
(Cotiza, ForgeSight, MADFAM Site) and its all-unchecked "migration checklist",
which read as though none of the work had started. ForgeSight's integration is
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

What a service actually needs configured:

| Variable | Value | Secret? |
|---|---|---|
| `JANUA_ISSUER` | `https://auth.madfam.io` | No |
| `JANUA_JWKS_URL` | `https://auth.madfam.io/.well-known/jwks.json` | No |
| `JANUA_AUDIENCE` | the client audience issued at registration | No |
| `JANUA_CLIENT_ID` | issued by Janua at client registration | No — a public identifier |
| `JANUA_CLIENT_SECRET` | issued alongside, for **confidential** clients only | **Yes** — Vault/ESO only |

Only the last row is a secret. Verification needs none of them to be secret,
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

- [ ] Configure `JANUA_ISSUER`, `JANUA_JWKS_URL`, `JANUA_AUDIENCE`.
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

- [`ECOSYSTEM_STATUS.md`](./ECOSYSTEM_STATUS.md) — routes, retired endpoints,
  and the other three ecosystem-wide contracts
- [`INTEGRATION_TESTING.md`](./INTEGRATION_TESTING.md) — Janua ↔ Enclii
  integration test procedures
- [`PUBLIC_REPO_BOUNDARY.md`](./PUBLIC_REPO_BOUNDARY.md) — why no real client
  IDs or secrets appear in this document
