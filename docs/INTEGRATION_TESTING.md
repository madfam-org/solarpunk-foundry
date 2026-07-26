# Integration Testing Guide — Janua ↔ Enclii

**Last verified: 2026-07-25** — expected outputs checked against
`janua/apps/api/app/main.py` and `enclii/packages/cli/internal/cmd/local.go`.

**Scope:** the authentication flow between Janua (OIDC provider) and Enclii
(PaaS control plane). Everything here runs **locally**.

> The previous revision was dated "December 2025", published OIDC endpoint URLs
> that do not match what the API emits, and included a test step that applied
> Kubernetes manifests directly to production. Both are corrected below.
>
> **A test whose expected output is wrong passes by not being run.** The point
> of dating this file is so the next reader knows how much to trust the
> expectations in it.

---

## Prerequisites

```
PostgreSQL 15+   localhost:5432
Redis 7+         localhost:6379
Docker

Cloned: solarpunk-foundry, janua, enclii
```

Start shared infrastructure with `enclii local infra` (Postgres, Redis, MinIO,
MailHog). See [`DOGFOODING_GUIDE.md`](./DOGFOODING_GUIDE.md).

Ports used below are the `enclii local up`-managed ones: Janua API `4100`,
Enclii API `4200`. For any other service, use the port its own `enclii.yaml`
declares — see [`PORT_ALLOCATION.md`](./PORT_ALLOCATION.md).

---

## Test 1 — Janua health and OIDC discovery

**Purpose:** Janua is running and advertising a correct, RS256-only OIDC
configuration.

```bash
cd ~/labspace/janua/apps/api
source .venv/bin/activate
ADMIN_BOOTSTRAP_PASSWORD='<GENERATE_AT_RUNTIME>' uvicorn app.main:app --port 4100

curl -s http://localhost:4100/health | jq
curl -s http://localhost:4100/.well-known/openid-configuration | jq
curl -s http://localhost:4100/.well-known/jwks.json | jq '.keys[] | {kid, kty, alg}'
```

**Expected discovery output** — note every OAuth endpoint carries the
`/api/v1` prefix, and the issuer is the base URL, never the literal string
`janua`:

```json
{
  "issuer": "http://localhost:4100",
  "authorization_endpoint": "http://localhost:4100/api/v1/oauth/authorize",
  "token_endpoint": "http://localhost:4100/api/v1/oauth/token",
  "userinfo_endpoint": "http://localhost:4100/api/v1/oauth/userinfo",
  "jwks_uri": "http://localhost:4100/.well-known/jwks.json",
  "introspection_endpoint": "http://localhost:4100/api/v1/oauth/introspect",
  "revocation_endpoint": "http://localhost:4100/api/v1/oauth/revoke",
  "end_session_endpoint": "http://localhost:4100/logout",
  "registration_endpoint": "http://localhost:4100/api/v1/oauth/register",
  "id_token_signing_alg_values_supported": ["RS256"]
}
```

*Verified 2026-07-25 against the discovery handler in `main.py`. Only
`jwks_uri` and `end_session_endpoint` sit outside `/api/v1`.*

**Pass when:**

- Health returns 200.
- Discovery contains all endpoints above, with the `/api/v1` prefix.
- `id_token_signing_alg_values_supported` is `["RS256"]` and contains nothing
  else.
- JWKS contains at least one RSA key with a `kid`.

**Fail hard if** discovery advertises HS256 anywhere. In production Janua
refuses to start without RS256 keys; if you see HS256 outside a deliberate test
configuration, stop and investigate.

---

## Test 2 — Admin bootstrap

**Purpose:** the bootstrap admin user is created on first startup.

```bash
ADMIN_BOOTSTRAP_PASSWORD='<GENERATE_AT_RUNTIME>' uvicorn app.main:app --port 4100

curl -X POST http://localhost:4100/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "<BOOTSTRAP_ADMIN_EMAIL>", "password": "<GENERATE_AT_RUNTIME>"}' | jq
```

**Pass when:** login returns an access token and a refresh token, and the user
carries the admin flag.

> The bootstrap admin email is a deployment setting, not a constant. This
> document does not publish the default. Set it explicitly in your local
> environment and use that value.

---

## Test 3 — Enclii local auth mode

```bash
cd ~/labspace/enclii/apps/switchyard-api
ENCLII_AUTH_MODE=local go run ./cmd/api

curl -s http://localhost:4200/health | jq
```

**Pass when:** Enclii starts on 4200 and reports `auth_mode: local`.

---

## Test 4 — Enclii OIDC mode against Janua

**Purpose:** Enclii validates Janua-issued tokens via JWKS. This is the test
that actually exercises the ecosystem auth contract.

```bash
# 1. Janua running on 4100 (Test 1)

# 2. Enclii in OIDC mode
cd ~/labspace/enclii/apps/switchyard-api
ENCLII_AUTH_MODE=oidc \
ENCLII_OIDC_ISSUER=http://localhost:4100 \
ENCLII_EXTERNAL_JWKS_URL=http://localhost:4100/.well-known/jwks.json \
go run ./cmd/api

# 3. Obtain a token
TOKEN=$(curl -s -X POST http://localhost:4100/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "<TEST_USER_EMAIL>", "password": "<GENERATE_AT_RUNTIME>"}' \
  | jq -r '.access_token')

# 4. Confirm the token header before using it — alg MUST be RS256 with a kid
echo "$TOKEN" | cut -d. -f1 | base64 -d 2>/dev/null | jq

# 5. Use it
curl -s http://localhost:4200/api/v1/projects -H "Authorization: Bearer $TOKEN" | jq
```

**Pass when:**

- Enclii accepts the Janua token.
- Validation goes through the JWKS endpoint (not a shared secret).
- A tampered or expired token returns 401.
- An HS256-signed token forged with the public key material is **rejected** —
  worth testing explicitly, because accepting it is the 2026-04-23 audit
  finding H3/H4.

---

## Test 5 — Cross-service URL resolution

**Purpose:** services can reach each other at their configured URLs.

```bash
enclii local up janua enclii
enclii local status
enclii local logs enclii | grep -iE "janua|oidc|jwks"
```

**Pass when:** the Enclii process resolves and fetches JWKS from Janua at
startup, with no connection-refused or timeout entries.

---

## Test 6 — Kubernetes manifests (local cluster only)

> **Rewritten 2026-07-25.** The previous version of this test ran
> `kubectl apply -f ~/labspace/janua/k8s/` and then inspected pods in the
> production `janua` namespace. Do not do that:
>
> - Production cluster state is owned by ArgoCD with `selfHeal: true`. A manual
>   apply is reverted, and in the meantime you have diverged the live cluster
>   from git.
> - Applying manifests by hand to production contradicts this repository's own
>   Enclii-first position.
>
> Validate manifests against a **local** cluster (kind, k3d, minikube), or not
> at all from a public test guide.

```bash
# Against a throwaway local cluster
kind create cluster --name janua-manifest-check
kubectl --context kind-janua-manifest-check apply --dry-run=server -f ~/labspace/janua/k8s/
kind delete cluster --name janua-manifest-check
```

**Pass when:** manifests are accepted by the API server in dry-run, liveness
and readiness probe paths match the app's real health route, and the container
port matches what the service's `enclii.yaml` declares.

That last check is worth doing deliberately. In production, NetworkPolicies are
**generated by the Enclii control plane from `enclii.yaml`'s declared service
port** and applied via the Kubernetes API — they are not committed to git. If
the declared port does not intersect the pod's actual `containerPort`, the CNI
drops the traffic **silently**: no error, and it presents as a rendering or
timeout bug rather than a network one.

For production deployment, use the GitOps path — commit, let ArgoCD reconcile,
verify with `enclii ops apps`.

---

## Test 7 — Beta endpoints are gated

**Purpose:** development-only endpoints stay off unless explicitly enabled.

```bash
ENABLE_BETA_ENDPOINTS=false uvicorn app.main:app --port 4100
curl -i -X POST http://localhost:4100/beta/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "<GENERATE_AT_RUNTIME>"}'
# Expect: 404

ENABLE_BETA_ENDPOINTS=true uvicorn app.main:app --port 4100
# Expect: 200

curl -i http://localhost:4100/beta/users
# Expect: 404 in both configurations
```

**Pass when:** beta routes 404 while disabled, work while enabled, and
`/beta/users` 404s unconditionally.

*Verified 2026-07-25: `main.py` registers the beta routes only under
`if settings.ENABLE_BETA_ENDPOINTS:`, and carries an explicit note that
`/beta/users` was removed entirely as a security risk.*

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `connection refused :4100` | Janua not running | Start it, or `enclii local up janua` |
| `JWKS fetch failed` | Wrong issuer/JWKS URL | Take both from the discovery document |
| 404 on `/auth/login` | Missing the `/api/v1` prefix | Use `/api/v1/auth/login` |
| `token validation failed` | Issuer mismatch | `iss` is the base URL, never `janua` |
| `host not allowed` | TrustedHost middleware | Add the host to the allowed list in your local config |
| Health probe fails in-cluster | Pod IP not permitted, or probe path wrong | Check both; health paths are not uniform across services |

Useful:

```bash
# Decode the token payload
echo "$TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq

# Confirm the signing algorithm
echo "$TOKEN" | cut -d. -f1 | base64 -d 2>/dev/null | jq .alg   # must be RS256
```

---

## Production checks

Read-only, no mutation. Production URLs are stable and public.

```bash
curl -s https://auth.madfam.io/.well-known/openid-configuration | jq '.issuer'
curl -s https://auth.madfam.io/.well-known/jwks.json | jq '.keys | length'
curl -s https://api.enclii.dev/health
```

| Service | URL |
|---|---|
| Janua (OIDC issuer) | `https://auth.madfam.io` |
| Janua JWKS | `https://auth.madfam.io/.well-known/jwks.json` |
| Enclii API | `https://api.enclii.dev` |

This document does not record the results of those checks. It cannot — a
checked-in result is a claim that ages. Run them and read the answer.

---

## Related

- [`JANUA_INTEGRATION.md`](./JANUA_INTEGRATION.md) — the verification contract
- [`DOGFOODING_GUIDE.md`](./DOGFOODING_GUIDE.md) — local environment
- [`ECOSYSTEM_STATUS.md`](./ECOSYSTEM_STATUS.md) — what is routed and what is retired
