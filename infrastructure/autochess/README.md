# Autochess - Claude Agent Orchestration Infrastructure

> **Autonomous Multi-Agent Development Infrastructure for the MADFAM Ecosystem**

## Overview

**Status**: Planning
**Core Engine**: [Auto-Claude](https://github.com/AndyMik90/Auto-Claude)
**Infrastructure**: solarpunk-foundry/infrastructure/autochess
**UI**: ClaudeCodeUI (agents.madfam.io)

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
- **Domain**: agents.madfam.io
- **OAuth Client**: `jnc_lSGMbQtCGdHSctd4mEQoaklLBCv7xXhe`
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

Following the MADFAM port registry pattern (see docs/PORT_ALLOCATION.md):

| Service | Port | Purpose |
|---------|------|---------|
| Autochess API | 5800 | Agent coordination API |
| Autochess UI | 5801 | Web dashboard (if standalone) |
| Agent WS | 5810 | WebSocket for real-time agent comms |
| Metrics | 5890 | Prometheus metrics |

---

## Integration Points

### Authentication (Janua)
- OAuth client already registered for ClaudeCodeUI
- Agents authenticate via service tokens
- RBAC for agent permissions

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

- [Auto-Claude GitHub](https://github.com/AndyMik90/Auto-Claude)
- [ClaudeCodeUI OAuth Client](../docs/JANUA_INTEGRATION.md)
- [Port Allocation](../docs/PORT_ALLOCATION.md)
- [Enclii Deployment](../../enclii/CLAUDE.md)

---

*Autochess v0.1.0 | Autonomous Development Infrastructure | MADFAM Ecosystem*
