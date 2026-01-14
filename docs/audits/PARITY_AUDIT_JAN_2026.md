# Solarpunk Foundry Parity Audit - January 2026

> **Auditor**: Claude Code
> **Date**: January 11, 2026
> **Scope**: Cross-repository consistency between solarpunk-foundry, janua, and enclii
> **Purpose**: Pre-deployment verification for remaining infrastructure and applications

---

## Executive Summary

| Category | Status | Score | Action Required |
|----------|--------|-------|-----------------|
| Port Allocation | **CONSISTENT** | 95/100 | Minor doc updates |
| Domain Routing | **INCONSISTENT** | 70/100 | Clarify canonical domains |
| Documentation Currency | **STALE** | 60/100 | Update multiple docs |
| Migration Plan Status | **OUTDATED** | 50/100 | Major update needed |
| Infrastructure Configs | **MOSTLY ALIGNED** | 80/100 | Remove stale configs |
| Shared Packages | **ALIGNED** | 90/100 | Minimal action |

**Overall Health Score**: 74/100 (needs attention before deploying remaining apps)

---

## Critical Issues

### 1. Migration Plan Status Mismatch

**File**: `docs/ENCLII_MIGRATION_PLAN.md`
**Severity**: HIGH
**Issue**: Document dated November 27, 2025 shows "Planning Phase" but core services are already deployed in production.

**Current State per ECOSYSTEM_STATUS.md (Jan 10, 2026)**:
- Phase 0 (Enclii Production Readiness): **COMPLETE**
- Phase 1 (Dogfooding Services): **COMPLETE** (6/6 services deployed)
- Phase 2-5: Status unknown/outdated

**Required Update**:
```markdown
## Migration Phases - UPDATED STATUS

### Phase 0: Enclii Production Readiness ✅ COMPLETE
- All infrastructure deployed on Hetzner
- Cloudflare Tunnel operational
- K3s cluster healthy

### Phase 1: Dogfooding Services ✅ COMPLETE (Jan 2026)
- ✅ switchyard-api → api.enclii.dev
- ✅ switchyard-ui → app.enclii.dev
- ✅ janua → auth.madfam.io
- ✅ docs-site → docs.enclii.dev
- ✅ landing-page → enclii.dev
- ⏳ status-page → status.enclii.dev (pending)

### Phase 2: Low-Risk Migrations (IN PROGRESS)
[Update with current status]
```

---

### 2. Domain Routing Inconsistencies

**Severity**: MEDIUM
**Issue**: Conflicting domain references across documentation

| Service | solarpunk-foundry says | janua says | enclii says |
|---------|------------------------|------------|-------------|
| Janua Dashboard | dashboard.madfam.io | app.janua.dev | - |
| Janua Admin | - | admin.janua.dev | - |
| Janua API | auth.madfam.io | api.janua.dev / auth.madfam.io | auth.madfam.io |

**Cloudflare Tunnel Config (source of truth)**:
From `enclii/infra/k8s/production/cloudflared-unified.yaml`:
- auth.madfam.io → janua-api
- dashboard.madfam.io → janua-dashboard (OR app.janua.dev?)

**Resolution Required**:
1. Verify actual Cloudflare Tunnel routes
2. Update all docs to reflect canonical domains
3. Consider if both domain patterns are intentional (*.madfam.io for MADFAM apps, *.janua.dev for product branding)

---

### 3. Stale Documentation Timestamps

| Document | Last Updated | Age | Action |
|----------|--------------|-----|--------|
| `ENCLII_MIGRATION_PLAN.md` | Nov 27, 2025 | 6 weeks | MAJOR UPDATE |
| `ECOSYSTEM_ALIGNMENT_STATUS.md` | Nov 26, 2025 | 6 weeks | UPDATE |
| `INFRASTRUCTURE_STATUS.md` | Dec 9, 2025 | 4 weeks | UPDATE |
| `JANUA_INTEGRATION.md` | Unknown | N/A | FIX PORT |
| `PORT_ALLOCATION.md` | Dec 2, 2025 | 5 weeks | Minor updates |

---

## Detailed Findings

### Port Allocation Consistency

**Status**: CONSISTENT across all repos

| Service Block | solarpunk-foundry | janua | enclii |
|---------------|-------------------|-------|--------|
| Janua (4100-4199) | 4100-4199 | 4100-4199 | Referenced |
| Enclii (4200-4299) | 4200-4299 | - | 4200-4299 |
| ForgeSight (4300-4399) | 4300-4399 | - | - |
| Fortuna (4400-4499) | 4400-4499 | - | - |
| Cotiza (4500-4599) | 4500-4599 | - | - |
| AVALA (4600-4699) | 4600-4699 | - | - |
| Dhanam (4700-4799) | 4700-4799 | - | - |
| Sim4D (4800-4899) | 4800-4899 | - | - |
| Forj (4900-4999) | 4900-4999 | - | - |

**Issue Found**: `JANUA_INTEGRATION.md` architecture diagram shows port 8001:
```
│   │             │◄─────────────────►│   Cotiza    │
│   │   :8001     │                   │  (NestJS)  │   <-- Should be :4100
```

**Fix Required**: Update diagram to show port 4100

---

### Infrastructure Configuration

#### `.enclii.yml` in solarpunk-foundry

**Status**: PLACEHOLDER - needs attention

```yaml
build:
  type: dockerfile
  dockerfile: apps/analytics/Dockerfile  # This doesn't exist!
```

**Options**:
1. Create the analytics app as specified
2. Remove the `.enclii.yml` if no deployment planned
3. Update to point to valid service

#### `infrastructure/kubernetes/` Directory

**Contains**:
- `api-deployment.yml` - Generic API deployment template
- `janua/` - Janua-specific manifests (6 files)
- `production/` - Production configs

**Concern**: Janua also has its own `k8s/` directory. Potential for drift.

**Recommendation**: Consolidate Kubernetes manifests to one location (recommend keeping in respective repos: `janua/k8s/` and `enclii/infra/k8s/`)

---

### Shared Packages Status

**Source**: (archived to git history, data extracted below)

| Package | Version | Status |
|---------|---------|--------|
| pnpm | 9.15.0 | UNIFIED |
| Next.js | 15.1.6 | UNIFIED |
| React | 18.3.1 | UNIFIED |
| Turborepo | 2.6.1 | UNIFIED |
| Tailwind CSS | 3.4.17 | UNIFIED |
| Zod | 3.24.1 | UNIFIED |
| Prisma | 6.1.0 | UNIFIED |

**Health Score**: 95/100 (from 68/100 before alignment)

**Outstanding Items**:
- [ ] Design system adoption (planned, not started)
- [ ] Janua auth integration across remaining apps

---

### Redis Database Allocation

**Consistency Check**:

| DB | DOGFOODING_GUIDE.md | PORT_ALLOCATION.md | Status |
|----|---------------------|--------------------|--------|
| 0 | Janua | Janua | ✅ |
| 1 | Cotiza | Enclii | **MISMATCH** |
| 2 | Forgesight | ForgeSight | ✅ |
| 3 | Dhanam | Fortuna | **MISMATCH** |
| 4 | Fortuna | Cotiza | **MISMATCH** |
| 5 | Fortuna NLP | AVALA | **MISMATCH** |

**Resolution**: Update DOGFOODING_GUIDE.md to match PORT_ALLOCATION.md (source of truth)

---

## Production Infrastructure Status

**From ECOSYSTEM_STATUS.md (Jan 10, 2026)**:

| Service | Status | Domain |
|---------|--------|--------|
| janua-api | Running | auth.madfam.io |
| janua-dashboard | Running | app.janua.dev |
| janua-admin | Running | admin.janua.dev |
| janua-docs | Running | docs.janua.dev |
| janua-website | Running | janua.dev |
| switchyard-api | Running | api.enclii.dev |
| switchyard-ui | Running | app.enclii.dev |
| roundhouse | Running | - |
| roundhouse-api | Running | - |
| waybill | Running | - |
| landing-page | Running | enclii.dev |
| docs-site | Running | docs.enclii.dev |

**Note**: docs.enclii.dev marked as having issues in some docs

---

## Recommended Actions

### Immediate (Before Next Deployment)

1. **Fix JANUA_INTEGRATION.md port reference** (5 min)
   ```bash
   # In diagram, change :8001 to :4100
   ```

2. **Clarify domain routing** (30 min)
   - Verify Cloudflare Tunnel actual routes
   - Document canonical domain mapping
   - Update all references to be consistent

3. **Update migration plan status** (1 hour)
   - Mark Phase 0-1 as complete
   - Add current status for Phase 2-5
   - Update timeline to reflect reality

### Short-term (This Week)

4. **Update all stale timestamps** (2 hours)
   - ECOSYSTEM_ALIGNMENT_STATUS.md
   - INFRASTRUCTURE_STATUS.md
   - ECOSYSTEM_STATUS.md

5. **Fix Redis DB allocation** in DOGFOODING_GUIDE.md (15 min)

6. **Resolve .enclii.yml placeholder** (30 min)
   - Either create apps/analytics/ or remove file

### Medium-term (Before Full Rollout)

7. **Consolidate Kubernetes manifests**
   - Decide: central vs distributed
   - Update INFRASTRUCTURE.md with decision

8. **Complete design system adoption**
   - Per ECOSYSTEM_ALIGNMENT_STATUS.md plan

9. **Janua auth integration**
   - Complete for remaining apps
   - Update checklists in JANUA_INTEGRATION.md

---

## Files Requiring Updates

| Priority | File | Change Required |
|----------|------|-----------------|
| P1 | `docs/JANUA_INTEGRATION.md` | Fix port 8001 → 4100 |
| P1 | `docs/ENCLII_MIGRATION_PLAN.md` | Major status update |
| P2 | `docs/DOGFOODING_GUIDE.md` | Fix Redis DB allocation |
| P2 | `docs/INFRASTRUCTURE_STATUS.md` | Update timestamp, verify status |
| P2 | `docs/ECOSYSTEM_STATUS.md` | Update timestamp |
| P3 | `.enclii.yml` | Remove or fix |
| P3 | - | (File archived to git history) |

---

## Cross-Repository Verification

### Janua Repository

**CLAUDE.md**: Current and accurate
**Port references**: Consistent (4100-4199)
**Domain references**: Uses both app.janua.dev and auth.madfam.io patterns
**Status**: Healthy, well-documented

### Enclii Repository

**CLAUDE.md**: Current and comprehensive
**Port references**: Consistent (4200-4299)
**Infrastructure docs**: Up to date
**Status**: Healthy, production-ready

### Solarpunk Foundry

**CLAUDE.md**: Accurate but references outdated child docs
**Port references**: Consistent across PORT_ALLOCATION.md
**Status**: Needs documentation refresh

---

## Conclusion

The ecosystem is **architecturally sound** with consistent port allocation and package alignment. However, **documentation has drifted** from reality during the successful deployment push.

**Primary Risks**:
1. Developers may follow outdated migration steps
2. Domain confusion could cause misrouted traffic during new deployments
3. Stale infrastructure docs may lead to incorrect assumptions

**Recommendation**: Complete P1 and P2 fixes before deploying any additional services. The current production deployment (Janua + Enclii core) is correctly configured despite doc drift.

---

*Audit completed: January 11, 2026*
*Next recommended audit: After Phase 2 migrations complete*
