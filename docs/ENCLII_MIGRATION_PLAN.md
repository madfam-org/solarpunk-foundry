# MADFAM Ecosystem Migration Plan: Vercel/Railway → Enclii

**Date**: November 27, 2025 (Updated: January 11, 2026)
**Status**: Active Execution - Phases 0-1 Complete
**Target**: All MADFAM services on Enclii by Q1 2026

---

## Executive Summary

This document outlines the migration strategy for moving all MADFAM ecosystem services from Vercel and Railway to our self-hosted Enclii PaaS platform.

### Why Migrate?

| Factor | Current (Vercel + Railway) | Target (Enclii) |
|--------|---------------------------|-----------------|
| **Monthly Cost** | ~$2,220 | ~$100 |
| **5-Year Savings** | - | **$127,200** |
| **Vendor Lock-in** | High | None |
| **Data Sovereignty** | US-based | EU (Hetzner) |
| **Auth Costs** | Auth0/Clerk fees | $0 (Janua) |
| **Custom Features** | Limited | Full control |

---

## Current Service Inventory

### Currently on Vercel (Frontend)
| Service | Domain | Status |
|---------|--------|--------|
| madfam-site | madfam.io | Production |
| aureo-labs | aureo.labs | Production |
| forgesight-web | www.forgesight.quest | Production |
| primavera3d | primavera3d.com | Spec Phase |
| sim4d-web | sim4d.io | Production |

### Currently on Railway (Backend)
| Service | Domain | Status |
|---------|--------|--------|
| forgesight-api | (pending) | 70% Ready |
| digifab-quoting-api | api.cotiza.studio | Production |

### Currently Undeployed (Planned for Enclii)
| Service | Domain | Status |
|---------|--------|--------|
| janua | auth.enclii.dev | Spec Phase |
| dhanam-api | api.dhanam.app | Spec Phase |
| dhanam-web | dhanam.app | Spec Phase |
| fortuna-api | api.fortuna.quest | Spec Phase |
| electrochem-sim | galvana.io | Production-Ready |

---

## Migration Phases

### Phase 0: Enclii Production Readiness ✅ COMPLETE (December 2025)
**Goal**: Get Enclii to 100% production-ready

**Completed Tasks**:
- [x] Run `terraform init && terraform plan`
- [x] Create Hetzner API token
- [x] Create Cloudflare API token (Zone:Edit, Tunnel:Edit, R2:Edit)
- [x] Create R2 API credentials
- [x] Generate JWT signing keys for Janua
- [x] Configure SMTP for Janua email
- [x] Run `terraform apply` to provision infrastructure
- [x] Deploy k8s resources: `kubectl apply -k infra/k8s/production`
- [x] Verify all health checks pass

**Validation Status**:
- ✅ Switchyard API responding at api.enclii.dev
- ✅ Switchyard UI accessible at app.enclii.dev
- ✅ Janua OAuth flow working at auth.madfam.io
- ✅ Redis operational
- ✅ R2 storage accessible

---

### Phase 1: Dogfooding Services ✅ COMPLETE (January 2026)
**Goal**: Deploy Enclii's own services on Enclii

**Services**:
1. **switchyard-api** → api.enclii.dev ✅ DEPLOYED
2. **switchyard-ui** → app.enclii.dev ✅ DEPLOYED
3. **janua** → auth.madfam.io ✅ DEPLOYED (5 services)
4. **landing-page** → enclii.dev ✅ DEPLOYED
5. **docs-site** → docs.enclii.dev ✅ DEPLOYED
6. **status-page** → status.enclii.dev ⏳ PENDING

**Validation Status**:
- ✅ 11/12 services deployed and healthy
- ✅ OAuth login working end-to-end (SSO logout fixed Jan 2026)
- ⚠️ Grafana dashboards pending configuration
- ⚠️ Alerts pending configuration

---

### Phase 2: Low-Risk Migrations 🔄 IN PROGRESS (January 2026)
**Goal**: Migrate non-critical and new services

**Services** (in order):
1. **forgesight-api** → api.forgesight.quest ⏳ Ready for deployment
2. **forgesight-web** → www.forgesight.quest ⏳ Ready for deployment
3. **electrochem-sim** → galvana.io ⏳ Ready for deployment
4. **primavera3d** → primavera3d.com ⏳ Ready for deployment

**Migration Pattern**:
```
1. Create Enclii service spec
2. Deploy to Enclii (staging subdomain)
3. Run integration tests
4. DNS cutover (5-minute TTL first)
5. Monitor for 24h
6. Decommission old deployment
```

**Rollback Plan**:
- Keep old deployment running for 7 days
- DNS revert takes <5 minutes
- Database remains unchanged (connection string update only)

---

### Phase 3: Production Migrations (Weeks 7-10)
**Goal**: Migrate production revenue-generating services

**Services** (in order of risk):
1. **aureo-labs** → aureo.labs (business site, low traffic)
2. **madfam-site** → madfam.io (corporate site)
3. **digifab-quoting** → api.cotiza.studio (production SaaS)
4. **sim4d** → sim4d.io (CAD app)

**Risk Mitigation**:
- Blue-green deployment for zero downtime
- Canary releases (10% → 50% → 100%)
- Database connection pooling maintained
- Feature flags for gradual rollout

**Validation Criteria per Service**:
- [ ] All E2E tests passing
- [ ] Performance within 10% of baseline
- [ ] Error rate < 0.1%
- [ ] All monitoring alerts green
- [ ] Customer-facing functionality verified

---

### Phase 4: New Service Deployments (Weeks 11-12)
**Goal**: Deploy new services directly to Enclii

**Services**:
1. **dhanam-api** → api.dhanam.app
2. **dhanam-web** → dhanam.app
3. **fortuna-api** → api.fortuna.quest
4. **forj** → forj.io

---

### Phase 5: Cleanup & Optimization (Week 13+)
**Goal**: Decommission old infrastructure

**Tasks**:
- [ ] Cancel Vercel Pro subscription
- [ ] Cancel Railway subscription
- [ ] Archive old deployment configs
- [ ] Update all documentation
- [ ] Conduct cost review
- [ ] Performance optimization pass

---

## Service Specification Template

Each service needs an Enclii spec in `/enclii/dogfooding/`. Template:

```yaml
apiVersion: enclii.dev/v1
kind: Service
metadata:
  name: service-name
  project: aureo-labs  # or madfam, primavera3d
  labels:
    app: app-name
    component: api|web|worker
    tier: production|staging

spec:
  build:
    source:
      repo: github.com/madfam-org/repo-name
      branch: main
      path: services/api  # if monorepo
    builder: dockerfile|nixpacks
    
  runtime:
    resources:
      requests:
        cpu: 200m
        memory: 512Mi
      limits:
        cpu: 1000m
        memory: 2Gi
    replicas:
      min: 2
      max: 10
    healthCheck:
      liveness:
        path: /health
        port: 8000
      readiness:
        path: /health/ready
        port: 8000

  networking:
    port: 8000
    domains:
      - api.example.com
    tls:
      enabled: true
      provider: cloudflare

  env:
    NODE_ENV: production
    # ... service-specific vars

  secrets:
    - name: DATABASE_URL
      key: service/database-url

  deployment:
    strategy: canary
```

---

## Domain Migration Checklist

For each domain migration:

- [ ] Set DNS TTL to 300 (5 minutes) 48h before migration
- [ ] Create Enclii service with staging domain
- [ ] Verify staging deployment works
- [ ] Create Cloudflare Tunnel route for production domain
- [ ] Update DNS to point to Cloudflare (if not already)
- [ ] Verify TLS certificate issued
- [ ] Monitor error rates for 1 hour
- [ ] Restore DNS TTL to 3600 (1 hour)
- [ ] Keep old deployment for 7 days as backup

---

## Database Strategy

### Shared PostgreSQL (Recommended for MVP)
All services share single Ubicloud PostgreSQL instance with:
- Separate databases per service
- Connection pooling via PgBouncer
- Automatic backups to R2

### Per-Service Databases (Enterprise)
For isolation requirements:
- Dedicated PostgreSQL per service
- Higher cost (~$50/service/month)
- Stronger compliance posture

### Migration Steps
1. Services already use Railway PostgreSQL → Export data
2. Import to Ubicloud PostgreSQL
3. Update DATABASE_URL secret in Enclii
4. Verify connectivity and performance
5. Deprecate Railway database

---

## Authentication Migration

### Current State
- Various JWT implementations across services
- Some use NextAuth
- No centralized auth

### Target State
- All services authenticate via Janua
- Single OAuth/OIDC provider
- Unified user management

### Migration Path
1. Deploy Janua on Enclii
2. Create OAuth clients for each service
3. Update service auth configs to use Janua JWKS
4. Migrate user accounts (gradual, with dual-auth support)
5. Deprecate old auth implementations

---

## Cost Tracking

### Before Migration (Monthly)
| Service | Platform | Cost |
|---------|----------|------|
| Vercel Pro | Vercel | $20 |
| Railway Hobby | Railway | $5 |
| Railway Pro (when needed) | Railway | $20+ |
| Auth0 (if used) | Auth0 | $220+ |
| **Estimated Total** | | **$265+** |

### After Migration (Monthly)
| Component | Cost |
|-----------|------|
| Hetzner (3x CPX31) | $45 |
| Ubicloud PostgreSQL | $50 |
| Cloudflare R2 | $5 |
| Cloudflare (tunnel, DNS) | $0 |
| **Total** | **$100** |

### Savings
- **Monthly**: $165+ (62% reduction)
- **Annual**: $1,980+
- **5-Year**: $9,900+ (conservative)

*Note: With Railway Pro + Auth0, savings are $127,200+ over 5 years*

---

## Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Enclii bugs affect all services | Medium | High | Staged rollout, monitoring |
| DNS propagation delays | Low | Medium | Low TTL, Cloudflare |
| Database migration data loss | Low | Critical | Backups, dry-run first |
| Performance regression | Medium | Medium | Baseline metrics, canary |
| Team unfamiliarity with Enclii | High | Low | Documentation, training |

---

## Success Metrics

### Technical
- [ ] All services migrated with zero data loss
- [ ] 99.9% uptime maintained during migration
- [ ] P95 latency within 10% of baseline
- [ ] All monitoring and alerting operational

### Business
- [ ] Cost reduced by 60%+
- [ ] No customer-reported incidents during migration
- [ ] Developer experience improved (single platform)
- [ ] Deployment frequency maintained or improved

---

## Timeline Summary

| Week | Phase | Key Deliverables |
|------|-------|------------------|
| 1-2 | Phase 0 | Enclii 100% ready |
| 3-4 | Phase 1 | Dogfooding complete |
| 5-6 | Phase 2 | Forge Sight, Galvana migrated |
| 7-10 | Phase 3 | Production services migrated |
| 11-12 | Phase 4 | New services deployed |
| 13+ | Phase 5 | Cleanup, optimization |

**Total Duration**: ~13 weeks (Q4 2025 → Q1 2026)

---

## Appendix: Service Specs Status

| Service | Spec Location | Status | Deployed |
|---------|---------------|--------|----------|
| switchyard-api | `dogfooding/switchyard-api.yaml` | ✅ Complete | ✅ Yes |
| switchyard-ui | `dogfooding/switchyard-ui.yaml` | ✅ Complete | ✅ Yes |
| janua | `dogfooding/janua.yaml` | ✅ Complete | ✅ Yes (5 services) |
| landing-page | `dogfooding/landing-page.yaml` | ✅ Complete | ✅ Yes |
| docs-site | `dogfooding/docs-site.yaml` | ✅ Complete | ✅ Yes |
| status-page | `dogfooding/status-page.yaml` | ✅ Complete | ⏳ Pending |
| forgesight-api | `dogfooding/forgesight.yaml` | ✅ Complete | ⏳ Phase 2 |
| forgesight-web | `dogfooding/forgesight.yaml` | ✅ Complete | ⏳ Phase 2 |
| madfam-site | `dogfooding/madfam-site.yaml` | ❌ TODO | ⏳ Phase 3 |
| aureo-labs | `dogfooding/aureo-labs.yaml` | ❌ TODO | ⏳ Phase 3 |
| digifab-quoting | `dogfooding/cotiza-studio.yaml` | ❌ TODO | ⏳ Phase 3 |
| sim4d | `dogfooding/sim4d.yaml` | ❌ TODO | ⏳ Phase 3 |
| dhanam | `dogfooding/dhanam.yaml` | ❌ TODO | ⏳ Phase 4 |
| electrochem-sim | `dogfooding/galvana.yaml` | ❌ TODO | ⏳ Phase 2 |
| fortuna | `dogfooding/fortuna.yaml` | ❌ TODO | ⏳ Phase 4 |
| primavera3d | `dogfooding/primavera3d.yaml` | ❌ TODO | ⏳ Phase 2 |
| forj | `dogfooding/forj.yaml` | ❌ TODO | ⏳ Phase 4 |

---

**Document Owner**: Platform Team
**Last Updated**: January 11, 2026
**Next Review**: After Phase 2 completion
