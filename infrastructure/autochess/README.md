# Autochess - Claude Agent Orchestration Infrastructure

> **Autonomous Multi-Agent Development Infrastructure for the MADFAM Ecosystem**

> [!NOTE]
> **ASPIRATIONAL — never built.** This is a design sketch, not a description of
> anything that exists. The roadmap below is entirely unticked, no `autochess`
> service appears in the ecosystem repo registry, and no port in the 5800 range
> is bound by any repository. Kept as a design record, clearly labelled, rather
> than deleted.
>
> **Last reviewed:** 2026-07-25. Corrections applied at that review are marked
> inline. Nothing here has been verified against a running system, because there
> is no running system to verify against.

## Overview

**Status**: Planning — unchanged since first written; no phase has started.
**Core Engine**: [Auto-Claude](https://github.com/AndyMik90/Auto-Claude) (third-party upstream)
**Infrastructure**: solarpunk-foundry/infrastructure/autochess
**UI**: ClaudeCodeUI

> **Correction (2026-07-25):** earlier revisions named `agents.madfam.io` as this
> project's UI hostname. That hostname is **not available** — the `agents-*.madfam.io`
> routes belonged to Selva, and after Selva's cutover to `selva.town` they are
> **retired**: they have no tunnel ingress rules and return 502. Do not resurrect
> them. Any future Autochess UI needs a hostname of its own.

Autochess provides the infrastructure layer for orchestrating Claude agents across the MADFAM ecosystem. It leverages Auto-Claude as the core multi-agent framework while integrating with our existing authentication (Janua) and deployment (Enclii) platforms.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  ClaudeCodeUI   │  │  Auto-Claude    │  │  CLI (madfam)   │ │
│  │ agents.madfam.io│  │  Desktop App    │  │                 │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
└───────────┼─────────────────────┼─────────────────────┼─────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Autochess Orchestration                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Agent Coordinator                      │   │
│  │  - Task distribution & parallel execution               │   │
│  │  - Git worktree isolation                               │   │
│  │  - Quality assurance loop                               │   │
│  │  - Conflict resolution                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MADFAM Ecosystem                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Janua     │  │   Enclii    │  │   Target Repositories   │ │
│  │   (Auth)    │  │   (Deploy)  │  │   (enclii, janua, etc)  │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Auto-Claude (Core Engine)
- **Source**: https://github.com/AndyMik90/Auto-Claude
- **Type**: Electron desktop application
- **Features**:
  - Autonomous multi-agent task execution
  - Up to 12 parallel agent terminals
  - Git worktree isolation (protects main branch)
  - Built-in QA loop
  - GitHub/GitLab/Linear integration
  - AI-powered merge conflict resolution

### 2. ClaudeCodeUI (Web Interface)
- **Domain**: none allocated — see the correction above; `agents.madfam.io` is retired
- **OAuth Client**: none. See the Integration Points correction below.
- **Features**:
  - Web-based agent control center
  - Task management dashboard
  - Kanban board visualization
  - Real-time agent monitoring

### 3. Autochess Infrastructure (This Directory)
- **Location**: solarpunk-foundry/infrastructure/autochess
- **Purpose**: Configuration, orchestration scripts, shared resources
- **Contents**:
  - Agent configuration templates
  - Orchestration scripts
  - Integration adapters
  - Monitoring dashboards

---

## Port Allocation

*(Proposed only — nothing binds these.)*

| Service | Port | Purpose |
|---------|------|---------|
| Autochess API | 5800 | Agent coordination API |
| Autochess UI | 5801 | Web dashboard (if standalone) |
| Agent WS | 5810 | WebSocket for real-time agent comms |
| Metrics | 5890 | Prometheus metrics |

> **Note (2026-07-25):** `5800-5899` is not an allocated block. The range table in
> [`../../docs/PORT_ALLOCATION.md`](../../docs/PORT_ALLOCATION.md) runs to
> `5700-5799` and then jumps to `6000-6999 Reserved`, so this proposal sits in a
> gap rather than in a block anyone assigned. That is not a problem to fix — read
> `PORT_ALLOCATION.md` first: in production the container port has no effect at
> all, and a new service is under no obligation to claim a block.

---

## Integration Points

### Authentication (Janua)
- ~~OAuth client already registered for ClaudeCodeUI~~ — **unsupported claim, removed 2026-07-25.** No evidence of a registered client was found, and it would be surprising for a project none of whose phases have started. Treat client registration as not done.
- *(Design intent, not implemented)* Agents authenticate via service tokens
- *(Design intent, not implemented)* RBAC for agent permissions

Whenever this is built, it must follow the ecosystem auth contract: verify
Janua-issued RS256 JWTs against the JWKS at
`https://auth.madfam.io/.well-known/jwks.json`. No custom auth, no shared
symmetric secret, HS256 fail-closed.

### Deployment (Enclii)
- Autochess can trigger deployments via Enclii API
- Build artifacts managed through Enclii pipeline
- Deployment status fed back to agent coordinator

### Target Repositories
- Agents work on isolated worktrees
- PR creation and review automation
- Merge conflict resolution via AI

---

## Configuration

### Environment Variables
```bash
# Core
AUTOCHESS_API_URL=http://localhost:5800
AUTOCHESS_MAX_AGENTS=12
AUTOCHESS_WORKTREE_BASE=/tmp/autochess-worktrees

# Authentication
JANUA_ISSUER=https://auth.madfam.io
AUTOCHESS_SERVICE_TOKEN=<generated>

# Integration
ENCLII_API_URL=https://api.enclii.dev
GITHUB_TOKEN=<for repo operations>
LINEAR_API_KEY=<for issue sync>
```

### Agent Configuration Template
```yaml
# autochess-agent.yml
version: "1.0"
agent:
  name: "feature-builder"
  type: "implementation"
  max_parallel_tasks: 3

isolation:
  method: "git-worktree"
  base_branch: "main"
  cleanup_on_complete: true

quality_assurance:
  enabled: true
  lint_on_commit: true
  test_before_merge: true

integrations:
  github:
    auto_pr: true
    require_review: true
  linear:
    sync_status: true
```

---

## Roadmap

### Phase 1: Foundation
- [ ] Set up autochess infrastructure directory
- [ ] Document architecture and integration points
- [ ] Allocate ports in PORT_ALLOCATION.md
- [ ] Configure ClaudeCodeUI deployment via Enclii

### Phase 2: Integration
- [ ] Connect Auto-Claude to Janua auth
- [ ] Implement Enclii deployment triggers
- [ ] Set up agent monitoring dashboard
- [ ] Create orchestration scripts

### Phase 3: Automation
- [ ] Multi-repo task distribution
- [ ] Automated PR workflows
- [ ] Quality gate enforcement
- [ ] Performance metrics collection

---

## Related Documentation

- [Auto-Claude GitHub](https://github.com/AndyMik90/Auto-Claude) — third-party upstream
- [Port Allocation](../../docs/PORT_ALLOCATION.md) *(path corrected 2026-07-25; the previous `../docs/` link resolved into `infrastructure/docs/`, which does not hold this file)*
- [Infrastructure tree overview](../README.md) — what in this directory is historical vs aspirational

*(The former "ClaudeCodeUI OAuth Client" link was removed 2026-07-25: no such
client exists, and its target path did not resolve either.)*

---

*Autochess v0.1.0 | Autonomous Development Infrastructure | MADFAM Ecosystem*
