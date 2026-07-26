# Certificates & TLS — public-safe summary

**Last verified: 2026-07-25**

> **The operational procedure is not published here.** This page previously
> named an on-node directory holding JWT signing keys, and gave commands to
> generate a new RSA keypair on the server and to re-authenticate the
> Cloudflare Tunnel over SSH. Secret paths with retrieval detail and raw
> break-glass are both prohibited in this repo. Removed 2026-07-25.
>
> Removed under [`../PUBLIC_REPO_BOUNDARY.md`](../PUBLIC_REPO_BOUNDARY.md) and
> `internal-devops/docs/repo-boundary-contract.md` (2026-06-14), which place raw
> break-glass, secret paths and capacity data in Lane A. The operational procedure
> lives in the private `internal-devops` repo; ask an operator if you need it.

## What is public

**TLS terminates at the Cloudflare edge.** Certificates for MADFAM production
hostnames are Cloudflare-managed and renew automatically. The origin leg —
cloudflared pod to Kubernetes Service — is plain HTTP on port 80. There is no
origin nginx, no cert-manager `Ingress` TLS story, and no per-service
certificate to renew for public product traffic.

*Source: `internal-devops/ecosystem/domain-map.md` (ingress chain, last verified
2026-07-01) and `internal-devops/ECOSYSTEM.md`.*

**A hostname-shape constraint worth knowing before you add a domain:**
Cloudflare universal SSL covers `*.madfam.io` but not `*.*.madfam.io`. New
`madfam.io` services therefore use flat hostnames (`meridian-app.madfam.io`,
not `app.meridian.madfam.io`). Pravara MES hit exactly this.

*Source: `internal-devops/ecosystem/domain-map.md` (2026-07-25 entry) and
`meridian/enclii.yaml` header comment.*

**JWT signing material is not a file on a node.** Janua's RS256 keypair is
carried as configuration (`JANUA_JWT_PRIVATE_KEY` / `JANUA_JWT_PUBLIC_KEY`)
delivered through the secret path described below — it is not generated or
rotated by hand on a server, and the public half is served at the JWKS endpoint
(`https://auth.madfam.io/.well-known/jwks.json`). See
[`../JANUA_INTEGRATION.md`](../JANUA_INTEGRATION.md).

**Secret delivery, mechanism only.** HashiCorp Vault (KV v2) is the home;
External Secrets Operator reads it through a ClusterSecretStore; a per-app
ExternalSecret materialises a native Kubernetes Secret in the app namespace;
the Deployment consumes it via `envFrom`/`secretRef`; Stakater Reloader rolls
consumers when the Secret changes. The operator-facing surface is
`enclii secrets`, with human-supplied production values going through an
`enclii secrets intake` protocol rather than chat or git.

Qualifier worth stating: **not every service is Vault-backed.** At least two
recent go-lives provisioned plain Kubernetes Secrets out-of-band because the
platform has no CLI surface to write Vault after onboarding — an Enclii adapter
gap recorded 2026-07-10. Those secrets sit outside the ESO refresh loop.

*Sources: `internal-devops/runbooks/vault-bootstrap.md`,
`internal-devops/ecosystem/deployment-conventions.md`,
`internal-devops/runbooks/2026-07-10-periplo-repo-extraction.md`; verified
2026-07-15 and re-confirmed 2026-07-25. Vault paths and secret names with
retrieval detail are Lane A and are not reproduced here.*

**Rotation has no technical backstop.** Documented token lifetimes are an
unenforced convention; nothing pages on an overdue rotation. A prior claim that
a rotation-monitor CronJob enforced cadence was corrected on 2026-07-25 — the
path it pointed at has never existed.

*Source: `internal-devops/runbooks/2026-07-25-stabilization-sweep-operator-gates.md`.*

## Canonical private sources

- `internal-devops/runbooks/secret-rotation.md`
- `internal-devops/runbooks/vault-bootstrap.md`
- `internal-devops/access/` for tunnel and provider credential custody
