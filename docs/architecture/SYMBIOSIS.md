# The MADFAM Symbiosis Architecture

**Last verified: 2026-07-25** — component names, domains and platform
capabilities checked against the working trees and the private route map on
that date.

> This is the **narrative** document: how the three core platform organs relate
> to each other and why. It is intentionally conceptual. For inventory, routes
> and dated status see [`../ECOSYSTEM_STATUS.md`](../ECOSYSTEM_STATUS.md); for
> cluster configuration see [`CLUSTER_ARCHITECTURE.md`](./CLUSTER_ARCHITECTURE.md).

## Cultivating the stack

The MADFAM ecosystem grows as a living system rather than a machine. Each
component exists in symbiotic relationship with the others, creating resilience
through interdependence rather than isolation.

```
┌─────────────────────────────────────────────────────────────────┐
│                   THE SYMBIOTIC GARDEN                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                        ☀️ FOUNDRY                               │
│                      (The Substrate)                            │
│         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                    │
│         Brand · Tokens · Contracts · Packages · CI              │
│                                                                 │
│              ┌───────────┐       ┌───────────┐                  │
│              │  ENCLII   │       │   JANUA   │                  │
│              │   🌿      │  ⇄    │   🫧      │                  │
│              │ (Trellis) │       │(Membrane) │                  │
│              └─────┬─────┘       └─────┬─────┘                  │
│                    │                   │                        │
│                    ▼                   ▼                        │
│              Infrastructure      Identity & Access              │
│              Build · Deploy      Auth · Permissions             │
│              Scale · Route       Trust · Boundaries             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## The three organs

### 🌱 The Substrate — Foundry

**Repository:** `madfam-org/solarpunk-foundry` (this repository, public, MIT)

The Substrate is the soil the rest draws on: the shared truths that keep the
ecosystem coherent.

What it provides:

- **Shared packages** — 13 `@madfam/*` packages, including `core` (brand,
  currency, legal constants), `types` (cross-service event shapes),
  `webhook-attribution` (signed payment-event verification), and the
  operability set (`logging`, `env`, `sentry`, `telemetry`).
  *Count verified 2026-07-25.*
- **Ecosystem contracts** — identity, inference, payment attribution, data
  boundaries. See [`../ECOSYSTEM_STATUS.md`](../ECOSYSTEM_STATUS.md).
- **Documentation standards** and the public/private boundary policy.
- **The port registry** — [`../PORT_ALLOCATION.md`](../PORT_ALLOCATION.md),
  which is honest about how aspirational it is.

> **[Corrected 2026-07-25]** An earlier revision listed "Infrastructure Patterns
> — K8s manifests, Terraform modules" among what the Substrate provides. That
> is not accurate and has not been for some time. Production infrastructure is
> defined in the `enclii` repository (`infra/k8s/`, `infra/argocd/`) and in each
> app's own `infra/k8s/production/`; the governing convention is *"core repos
> define the platform, client repos define themselves"*, under which a service's
> manifests never belong here. There is no Terraform in the production path.
>
> **Solarpunk principle:** *the Substrate never competes with what grows from it.*

### 🌿 The Trellis — Enclii

**Repository:** `madfam-org/enclii` (public, AGPL-3.0, dual-licensed)
**Domain:** `*.enclii.dev`

The Trellis provides structure for growth. It does not dictate the shape of the
vine; it gives it something to climb.

What it provides:

- **Container builds** — Kaniko, SBOM, cosign keyless signing
- **Orchestration** — k3s with ArgoCD GitOps (App-of-Apps + ApplicationSets)
- **Routing** — custom domains via Cloudflare Tunnel
- **Preview environments** — per-PR, opt-in *(dormant by design as of
  2026-07-07: the preview DNS zone was never bootstrapped)*
- **Usage metering** — Waybill

Components *(app directory names verified 2026-07-25 in `enclii/apps/`)*:

| Component | Function |
|---|---|
| Switchyard | Control plane API (`switchyard-api`) and UI (`switchyard-ui`) |
| Roundhouse | Build workers |
| Dispatch | Admin console |
| Waybill | Usage and cost metering |
| Status | Status pages (`status.enclii.dev`, `status.madfam.io`) |
| Conductor | The CLI — the `enclii` binary |

**Solarpunk principle:** *the Trellis supports without strangling.*

### 🫧 The Membrane — Janua

**Repository:** `madfam-org/janua` (public, AGPL-3.0)
**Product domain:** `janua.dev`
**MADFAM issuer:** `auth.madfam.io`

The Membrane controls what passes through — the selective barrier that makes
trust possible.

What it provides *(router modules verified present 2026-07-25 in
`janua/apps/api/app/routers/v1/`)*:

- **OAuth 2.0 / OpenID Connect** — authorize, token, userinfo, introspect,
  revoke, dynamic client registration
- **Multi-factor authentication** and **passkeys**
- **SCIM 2.0 provisioning**
- **Multi-tenant organisations** with RBAC
- **Nine SDKs** — TypeScript, Next.js, React, React Native, Vue, SvelteKit,
  Python, Go, Flutter

> **The single-issuer constraint is load-bearing, not incidental.** Janua's
> issuer is derived from `JANUA_CUSTOM_DOMAIN`, **not** from the request `Host`.
> One deployment serves exactly one issuer. This is why `auth.selva.town` must
> never be routed, and why every Selva surface uses `auth.madfam.io`. A
> membrane with two doors is not a membrane.
>
> *Verified 2026-07-25 by reading `janua/apps/api/app/main.py`.*

**Solarpunk principle:** *the Membrane discerns, it does not exclude.*

---

## The symbiotic relationships

### Substrate ↔ Trellis

```
Foundry provides → shared packages, contracts, documentation standards
Enclii provides  → deployment infrastructure, and the registry Foundry publishes to
```

Note the concrete instance: `npm.madfam.io` (Verdaccio) is where this
repository's `@madfam/*` packages are published, and it **runs from manifests in
the `enclii` repository**, in the `enclii` namespace. The Substrate publishes;
the Trellis hosts.

### Substrate ↔ Membrane

```
Foundry provides → brand tokens, the documented auth contract
Janua provides   → identity for the ecosystem's tooling
```

The Substrate writes down what asymmetric verification must look like; the
Membrane implements it. When those two drifted apart — the public integration
guide teaching HS256 while Janua issued RS256 — the result was two production
services with the same vulnerability. Keeping them in sync is the relationship.

### Trellis ↔ Membrane

```
Enclii provides  → deployment infrastructure for Janua
Janua provides   → JWKS verification and OAuth flows for Enclii
```

The Trellis gives the Membrane somewhere to grow; the Membrane decides who may
climb the Trellis.

---

## Growth phases

How a service arrives at full federated identity:

| Phase | Configuration | Meaning |
|---|---|---|
| **A — Seedling** | `ENCLII_AUTH_MODE=local` | Self-contained auth, no external dependency, single-developer work |
| **B — Sprouting** | `ENCLII_EXTERNAL_JWKS_URL=<issuer>/.well-known/jwks.json` | Tokens validated directly against Janua's published keys |
| **C — Flowering** | `ENCLII_AUTH_MODE=oidc` | Full OAuth flow through Janua for all users |

Testing each phase: [`../INTEGRATION_TESTING.md`](../INTEGRATION_TESTING.md).

---

## Security model

### Trust through boundaries

| Boundary | Mechanism | Standing |
|---|---|---|
| Ingress | Cloudflare Tunnel is the only path for public application traffic; zero exposed node ports | **Documented**, verified 2026-05-04 / 2026-07-01 |
| Network segmentation | Kubernetes NetworkPolicies, **generated by the Enclii control plane** from each service's declared `enclii.yaml` port and applied via the API (not committed to git) | **Documented**, 2026-04-15 |
| Identity | RS256 JWT verification against Janua's JWKS; HS256 fail-closed | **Contract verified 2026-04-23**; fleet conformance partial |
| Authorization | Role-based, claims carried in the token | Documented |
| Image provenance | cosign keyless signing; digest pinning enforced CI-side | **Partly enforced** — see below |

> **[Corrected 2026-07-25]** An earlier revision listed "mTLS — service-to-service
> encryption" as part of the security model. **No source establishes mutual TLS
> between services**, and it is not visible in any configuration read for this
> pass. It has been removed rather than restated. *What would settle it:* a
> service-mesh or mTLS configuration in the GitOps source; there is none today.

> **Image provenance is weaker than it reads.** A Kyverno signature-verification
> policy exists, but it has been bypassed by namespace-wide PolicyExceptions;
> one blanket exception was deleted in July 2026 with a regression guard, while
> another namespace-wide exception was still open at that date. Of the three
> image-tag policies, only one fail-closes and it covers a narrow case. Digest
> pinning is real but is enforced mostly in CI rather than at admission. See
> [`../INFRASTRUCTURE_STATUS.md`](../INFRASTRUCTURE_STATUS.md#admission-policy-image-tags).

### Authentication flow

```
User → Cloudflare Edge → product surface → Janua (auth.madfam.io)
                                                │
                                                ▼
                                          RS256 JWT
                                                │
                                                ▼
                                    JWKS verification at the service
```

---

## The Primavera mandate

*"We trust it because we survive on it."*

Every component of the Symbiosis must first serve MADFAM's own needs:

- **Enclii** hosts MADFAM's production services.
- **Janua** authenticates MADFAM's own team, at `auth.madfam.io`.
- **Foundry** supplies the packages and contracts the rest consume.

This is dogfooding as practice, not as marketing. The honest corollary is that
when dogfooding reveals a gap, the gap is real and belongs in the record — which
is why the status documents in this directory carry dates and open questions
rather than green dots.

---

## Related

- [`CLUSTER_ARCHITECTURE.md`](./CLUSTER_ARCHITECTURE.md) — the physical layer
- [`../ECOSYSTEM_STATUS.md`](../ECOSYSTEM_STATUS.md) — inventory, routes,
  retired endpoints, contracts
- [`../JANUA_INTEGRATION.md`](../JANUA_INTEGRATION.md) — the Membrane's contract
- [`../PORT_ALLOCATION.md`](../PORT_ALLOCATION.md) — the addressing scheme
- [`FEDERATED_ARCHITECTURE_README.md`](./FEDERATED_ARCHITECTURE_README.md) —
  historical local-dev architecture
- [`SELF_CONTAINED_SERVICES.md`](./SELF_CONTAINED_SERVICES.md) — a superseded
  position paper, labelled in place

---

*"From Bits to Atoms. High Tech, Deep Roots."*
