# The MADFAM Symbiosis Architecture

## Cultivating the Stack

The MADFAM ecosystem grows as a **living system**, not a machine. Each component exists in symbiotic relationship with the others, creating resilience through interdependence rather than isolation.

```
┌─────────────────────────────────────────────────────────────────┐
│                   THE SYMBIOTIC GARDEN                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                        ☀️ FOUNDRY                               │
│                      (The Substrate)                            │
│         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                    │
│         Brand · Tokens · Tooling · Truth · CI/CD                │
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

## The Three Organs

### 🌱 The Substrate — Foundry

**Repository:** `github.com/madfam-org/solarpunk-foundry`

The Substrate is the **living soil** from which all other components draw nourishment. It contains the shared truths that keep the ecosystem coherent.

**What it provides:**
- **Brand Identity** — Colors, typography, design tokens (`@madfam/core`)
- **Documentation Standards** — DocGuard linting, terminology enforcement
- **Port Registry** — The addressing system for all services
- **CI/CD Templates** — Reusable workflows for the garden
- **Infrastructure Patterns** — K8s manifests, Terraform modules

**Solarpunk Principle:** *The Substrate never competes with what grows from it.*

### 🌿 The Trellis — Enclii

**Repository:** `github.com/madfam-org/enclii`
**Domain:** `*.enclii.dev`

The Trellis provides **structure for growth**. It doesn't dictate the shape of the vine, but gives it something to climb. A sovereign PaaS that supports without constraining.

**What it provides:**
- **Container Builds** — Kaniko + SBOM + Cosign signing
- **Orchestration** — k3s + ArgoCD GitOps
- **Routing** — Custom domains via Cloudflare Tunnel
- **Preview Environments** — Ephemeral spaces for experimentation
- **Usage Metering** — Waybill for resource awareness

**Key Components:**
| Component | Function |
|-----------|----------|
| Switchyard | Control plane API |
| Conductor | CLI interface |
| Roundhouse | Build workers |
| Reconcilers | K8s operators |

**Solarpunk Principle:** *The Trellis supports without strangling.*

### 🫧 The Membrane — Janua

**Repository:** `github.com/madfam-org/janua`
**Product Domain:** `janua.dev`
**Dogfooding Tenant:** `auth.madfam.io`

The Membrane controls **what passes through**. It's the selective barrier that protects the interior while allowing nutrients (authorized users) to enter. Identity is the boundary that makes trust possible.

**What it provides:**
- **OAuth 2.0 / OpenID Connect** — Standard identity protocols
- **SAML 2.0 Enterprise SSO** — Enterprise integration
- **Multi-Factor Authentication** — TOTP, WebAuthn, Passkeys
- **Social Authentication** — 8 providers (Google, GitHub, Microsoft, Apple, etc.)
- **SCIM 2.0 Provisioning** — Automated user lifecycle
- **Multi-Tenant Organizations** — Isolated identity contexts

**White-Label Architecture:**
| Tenant | Domain | Purpose |
|--------|--------|---------|
| Product (Default) | `janua.dev` | Customer-facing SaaS |
| MADFAM Internal | `auth.madfam.io` | Our own dogfooding deployment |

**Solarpunk Principle:** *The Membrane discerns, it does not exclude.*

## The Symbiotic Relationships

### Substrate ↔ Trellis (Foundry ↔ Enclii)

```
Foundry provides → Brand tokens, DocGuard CI, Port registry
Enclii provides  → Deployment infrastructure for Foundry packages
```

The Substrate gives the Trellis its visual identity and quality standards. The Trellis gives the Substrate a place to publish and distribute.

### Substrate ↔ Membrane (Foundry ↔ Janua)

```
Foundry provides → Brand tokens, DocGuard CI, Shared packages
Janua provides   → Identity for Foundry tooling (future)
```

The Substrate ensures the Membrane maintains brand consistency. The Membrane will eventually guard who can publish to the Substrate.

### Trellis ↔ Membrane (Enclii ↔ Janua)

```
Enclii provides  → Deployment infrastructure for Janua
Janua provides   → JWKS validation, OAuth flows for Enclii
```

The Trellis gives the Membrane a place to grow. The Membrane decides who can climb the Trellis.

## The Growth Phases

How the garden starts from a single seed:

```
┌────────────────────────────────────────────────────────────────┐
│                      GROWTH PHASES                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  PHASE A: Seedling (Local Auth)                                │
│  ├── Enclii grows with ENCLII_AUTH_MODE=local                 │
│  ├── Self-contained authentication                             │
│  ├── No external dependencies                                  │
│  └── Single-developer cultivation                              │
│                                                                │
│  PHASE B: Sprouting (External JWKS)                            │
│  ├── Set ENCLII_EXTERNAL_JWKS_URL=https://auth.madfam.io/...  │
│  ├── CLI validates Janua tokens directly                       │
│  ├── Janua deployed via Enclii                                 │
│  └── Team cultivation begins                                   │
│                                                                │
│  PHASE C: Flowering (Full OIDC)                                │
│  ├── Set ENCLII_AUTH_MODE=oidc                                │
│  ├── All users authenticate through Janua                      │
│  ├── OAuth flow for web UI                                     │
│  └── Full federated identity                                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Port Allocation

The addressing system for the garden:

| Organ | Port Block | API | Web | Notes |
|-------|------------|-----|-----|-------|
| Janua (Membrane) | 4100-4199 | 4100 | 4101 | +02 Admin, +03 Docs |
| Enclii (Trellis) | 4200-4299 | 4200 | 4201 | +02 Agent |
| Foundry (Substrate) | N/A | N/A | N/A | Tooling only |

See [PORT_ALLOCATION.md](../PORT_ALLOCATION.md) for the complete registry.

## Security Model

### Trust Through Boundaries

1. **Network Isolation** — All services in private network (no exposed ports)
2. **Tunnel Ingress** — Cloudflare Tunnel as the only entry point
3. **mTLS** — Service-to-service encryption
4. **RBAC** — Role-based access control

### Authentication Flow

```
User → Cloudflare Edge → Enclii UI → Janua OIDC → JWT Token → API Access
                                         │
                                         ▼
                                   JWKS Validation
```

## The Primavera Mandate

*"We trust it because we survive on it."*

Every component of the Symbiosis must first serve MADFAM's own needs:

- **Enclii** hosts our production services
- **Janua** authenticates our team (at `auth.madfam.io`)
- **Foundry** enforces our own documentation standards

This is not dogfooding as marketing. This is cultivation as practice.

## Related Documentation

- [Port Allocation Registry](../PORT_ALLOCATION.md)
- [Federated Architecture](./FEDERATED_ARCHITECTURE_README.md) — Application layer patterns
- [Brand Guidelines](../../packages/core/src/brand.ts)

---

*Cultivated: January 2026*
*Architecture: MADFAM Symbiosis v1.0*
*"From Bits to Atoms. High Tech, Deep Roots."*
