# Critical Issues Fix Plan - Ecosystem Alignment

**Generated**: 2025-11-25
**Status**: In Progress
**Priority**: 🔴 CRITICAL

---

## Executive Summary

This document tracks the resolution of 12 critical version conflicts and architectural inconsistencies identified in the CTO ecosystem audit.

### Current State (Before Fix)

| Issue | Severity | Current State | Target State |
|-------|----------|---------------|--------------|
| Package Managers | 🔴 CRITICAL | pnpm 8.x/9.x, npm 10/11, yarn 1 | pnpm 9.15.0 |
| Next.js Versions | 🔴 CRITICAL | 14.1, 14.2, 15.1, 15.5 | 15.1.x (stable) |
| React Versions | 🔴 HIGH | 18.2, 18.3, 19.0, 19.2 | 18.3.1 (LTS) |
| Turborepo | 🔴 HIGH | 1.12.x, 2.3.x, 2.5.x, 2.6.x | 2.6.1 |
| Tailwind CSS | 🔴 HIGH | 3.4.x, 4.1.x | 3.4.17 |
| Zod | 🔴 CRITICAL | 3.22.4, 3.24.1, 4.1.x | 3.24.1 |
| Prisma | 🟡 MEDIUM | 5.7, 5.8, 5.9, 6.1, 6.19 | 6.1.0 |
| Stripe SDK | 🟡 MEDIUM | 3.0.4 (forj only) | Latest stable |
| solarpunk-foundry | 🔴 CRITICAL | 0 consumers | 3+ consumers |
| Auth Strategies | 🔴 CRITICAL | 5 different approaches | Plinto unified |

---

## Phase 1: Package Manager Standardization

### Target: pnpm 9.15.0

**Repositories to Migrate:**

| Repository | Current | Action |
|------------|---------|--------|
| aureo-labs | pnpm 9.x + npm (dual) | Remove package-lock.json |
| avala | pnpm 9.15.0 | ✅ Already aligned |
| brepflow | pnpm 8.6.7 | Upgrade to 9.15.0 |
| coforma-studio | pnpm 8.15.0 | Upgrade to 9.15.0 |
| dhanam | pnpm 8.6.7 | Upgrade to 9.15.0 |
| digifab-quoting | npm 10.2.4 | Migrate to pnpm 9.15.0 |
| forgesight | pnpm (version TBD) | Align to 9.15.0 |
| forj | yarn 1.22.21 | Migrate to pnpm 9.15.0 |
| geom-core | npm | Migrate to pnpm 9.15.0 |
| janua | npm + pnpm (dual) | Remove package-lock.json |
| madfam-site | pnpm 8.14.1 | Upgrade to 9.15.0 |
| primavera3d | npm 11.5.1 | Migrate to pnpm 9.15.0 |
| sim4d | pnpm 8.6.7 | Upgrade to 9.15.0 |
| blueprint-harvester | npm | Migrate to pnpm 9.15.0 |
| madfam-analytics | npm | Migrate to pnpm 9.15.0 |
| madfam-ui | pnpm | Align to 9.15.0 |

### Migration Script
```bash
#!/bin/bash
# Run from labspace root: ./scripts/migrate-to-pnpm.sh

REPOS=(
  "aureo-labs"
  "brepflow"
  "coforma-studio"
  "dhanam"
  "digifab-quoting"
  "forgesight"
  "forj"
  "geom-core"
  "janua"
  "madfam-site"
  "primavera3d"
  "sim4d"
  "blueprint-harvester"
  "madfam-analytics"
  "madfam-ui"
)

for repo in "${REPOS[@]}"; do
  echo "Processing $repo..."
  cd "/Users/aldoruizluna/labspace/$repo"
  
  # Remove old lockfiles
  rm -f package-lock.json yarn.lock
  
  # Add packageManager field
  npm pkg set packageManager="pnpm@9.15.0"
  
  # Regenerate lockfile
  pnpm install
  
  cd -
done
```

---

## Phase 2: Framework Version Alignment

### Strategy Decision

**Recommendation: Stay on React 18.3.1 + Next.js 15.1.x**

Rationale:
- React 19 has breaking changes not fully stable
- Next.js 15.5.x requires React 19
- Next.js 15.1.x supports React 18.3.1 and is stable
- Reduces migration risk

### Target Versions

```json
{
  "next": "15.1.6",
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "turbo": "2.6.1",
  "tailwindcss": "3.4.17",
  "zod": "3.24.1",
  "prisma": "6.1.0",
  "@prisma/client": "6.1.0"
}
```

### Repository-Specific Changes

| Repository | Next.js Change | React Change | Other Changes |
|------------|----------------|--------------|---------------|
| aureo-labs | 14.2.25 → 15.1.6 | 18.3.1 ✅ | - |
| avala | 15.1.6 ✅ | 19.0.0 → 18.3.1 | - |
| coforma-studio | 15.1.0 → 15.1.6 | 19.0.0 → 18.3.1 | - |
| dhanam | 15.5.6 → 15.1.6 | 19.0.0 → 18.3.1 | - |
| forj | 14.1.0 → 15.1.6 | 18.2.0 → 18.3.1 | - |
| madfam-site | 15.5.2 → 15.1.6 | 19.2.0 → 18.3.1 | Tailwind 4.x → 3.4.17 |
| primavera3d | 15.5.0 → 15.1.6 | 18.3.1 ✅ | Zod 4.x → 3.24.1 |
| sim4d | 15.5.0 → 15.1.6 | 18.2.0 → 18.3.1 | - |
| brepflow | N/A (React only) | 18.2.0 → 18.3.1 | Turbo 1.12 → 2.6.1 |

---

## Phase 3: Zod Version Alignment

### Critical: Zod 3.x vs 4.x Breaking Changes

Zod 4.x has significant API changes. We standardize on **Zod 3.24.1** (latest v3).

**Repositories requiring downgrade:**
- madfam-site: 4.1.12 → 3.24.1
- primavera3d: 4.1.5 → 3.24.1

**Migration notes:**
- Review any usage of Zod 4 specific features
- `z.string().email()` syntax unchanged
- Most schemas will work without modification

---

## Phase 4: Tailwind CSS Alignment

### Target: Tailwind 3.4.17

**Repositories requiring change:**
- madfam-site: 4.1.17 → 3.4.17 (major downgrade)

**Tailwind v4 → v3 Migration Checklist:**
1. Replace `@import "tailwindcss"` with classic config
2. Update `tailwind.config.js` to v3 format
3. Replace CSS-first configuration with JS config
4. Test all responsive utilities
5. Verify dark mode implementation

---

## Phase 5: Turborepo Alignment

### Target: Turbo 2.6.1

| Repository | Current | Action |
|------------|---------|--------|
| avala | 2.3.3 | Upgrade to 2.6.1 |
| brepflow | 1.12.0 | Upgrade to 2.6.1 |
| coforma-studio | 2.6.1 ✅ | None |
| dhanam | 2.6.1 ✅ | None |
| digifab-quoting | 1.12.4 | Upgrade to 2.6.1 |
| forj | 1.12.4 | Upgrade to 2.6.1 |
| madfam-site | 2.6.1 ✅ | None |
| primavera3d | 2.5.6 | Upgrade to 2.6.1 |
| sim4d | 1.12.0 | Upgrade to 2.6.1 |

---

## Phase 6: Prisma Alignment

### Target: Prisma 6.1.0

| Repository | Current | Action |
|------------|---------|--------|
| avala | 6.1.0 ✅ | None |
| coforma-studio | 5.8.1 | Upgrade to 6.1.0 |
| forj | 5.9.1 | Upgrade to 6.1.0 |
| janua | 5.7.0 | Upgrade to 6.1.0 |
| madfam-site | 6.19.0 | Downgrade to 6.1.0 |

**Migration Notes:**
- Run `prisma generate` after upgrade
- Test all database queries
- Check for deprecated APIs

---

## Phase 7: solarpunk-foundry Adoption

### Current State: 0 consumers

### Target: Design system consumed by all business sites

**Step 1: Audit solarpunk-foundry contents**
```bash
ls -la /Users/aldoruizluna/labspace/solarpunk-foundry/
```

**Step 2: Create publishable packages**
- `@madfam/ui` - Shared components
- `@madfam/tokens` - Design tokens
- `@madfam/tailwind-preset` - Tailwind configuration

**Step 3: Integrate into consumers**
- aureo-labs
- madfam-site
- primavera3d

---

## Phase 8: Auth Consolidation (Plinto Roadmap)

### Current Auth Strategies (5 different approaches)

1. **NextAuth + DB sessions**: biz-site (madfam-site)
2. **NextAuth + NestJS JWT**: digifab-quoting
3. **Custom JWT (RS256)**: digifab-harvest-benchmark (forgesight)
4. **NestJS JWT + TOTP 2FA**: dhanam
5. **Go JWT**: enclii

### Plinto Integration Timeline

| Gate | Timeline | Deliverable | Products Migrated |
|------|----------|-------------|-------------------|
| Gate 0 | Week 2 | Passkeys, sessions, JWKS | Demo apps |
| Gate 1 | Month 2 | Social logins, RBAC | Forge Sight |
| Gate 2 | Month 4 | SAML/OIDC, webhooks | Cotiza Studio, Dhanam |
| Gate 3 | Month 6 | Data residency, SCIM | Enterprise apps |
| Gate 4 | Month 7+ | GA with billing | All products |

---

## Execution Checklist

### Immediate (This Week)
- [ ] Create migration script for pnpm standardization
- [ ] Update all packageManager fields
- [ ] Remove conflicting lockfiles
- [ ] Test builds across all repos

### Short-term (Sprint 1-2)
- [ ] Align Next.js to 15.1.6
- [ ] Downgrade React 19 → 18.3.1 where needed
- [ ] Align Turborepo to 2.6.1
- [ ] Standardize Zod to 3.24.1

### Medium-term (Sprint 3-4)
- [ ] Align Tailwind to 3.4.17
- [ ] Align Prisma to 6.1.0
- [ ] Bootstrap solarpunk-foundry packages
- [ ] Document Plinto integration plan

---

## Risk Mitigation

1. **Breaking Changes**: Create feature branches for each repo
2. **Build Failures**: Test in CI before merging
3. **Dependency Conflicts**: Use `pnpm why` to debug
4. **Rollback Plan**: Tag current state before changes

---

## Success Metrics

- [ ] 0 critical version conflicts
- [ ] Single package manager (pnpm 9.15.0)
- [ ] Unified React version (18.3.1)
- [ ] Unified Next.js version (15.1.6)
- [ ] solarpunk-foundry consumed by 3+ repos
- [ ] Plinto auth integration started
