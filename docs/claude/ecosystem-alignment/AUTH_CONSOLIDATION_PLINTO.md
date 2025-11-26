# Auth Consolidation Roadmap - Plinto Integration

**Status**: Planning
**Priority**: 🔴 CRITICAL
**Timeline**: 7 months (Gate 0-4)

---

## Executive Summary

The MADFAM ecosystem currently has **5 different authentication strategies** across products. This creates security risks, maintenance burden, and poor user experience. Plinto (formerly referenced as "Janua" in some docs) will become the unified identity platform.

---

## Current State Analysis

### Authentication Strategies Inventory

| Product | Current Auth | Method | Session Storage | Issues |
|---------|--------------|--------|-----------------|--------|
| **madfam-site** | NextAuth | DB sessions | PostgreSQL | Isolated, no SSO |
| **digifab-quoting** | NextAuth + NestJS | JWT (RS256) | Redis | Dual auth, complexity |
| **forgesight** | Custom JWT | RS256 | Redis | No SSO, manual rotation |
| **dhanam** | NestJS JWT + TOTP | RS256 + 2FA | Redis | Good 2FA, isolated |
| **enclii** | Go JWT | RS256 | Redis | Custom implementation |
| **janua** | Self (Plinto) | OAuth2/OIDC | PostgreSQL | The target solution |

### Problems with Current State

1. **Security Fragmentation**: 5 different JWT implementations
2. **No SSO**: Users must log in separately to each product
3. **Key Management**: Manual JWKS rotation in each product
4. **Maintenance Burden**: Auth code duplicated across repos
5. **User Experience**: No unified identity across ecosystem
6. **Audit Complexity**: Auth events scattered across systems

---

## Target Architecture: Plinto

### Vision
**"One key for the whole city"** - Single sign-on across all MADFAM products

### Plinto Capabilities (from spec)

- **OAuth 2.0 / OIDC** compliant identity provider
- **WebAuthn/Passkeys** as primary authentication
- **Email + Password** fallback
- **Social Logins**: Google, GitHub, Microsoft
- **Organizations & RBAC**: Multi-tenant with role-based access
- **Per-tenant signing keys** with region pinning
- **SAML/OIDC** for enterprise SSO
- **Webhooks** for auth events
- **Edge verification**: p95 < 50ms

### Performance Targets

| Metric | Target |
|--------|--------|
| Uptime SLO | 99.95% |
| Auth issuance | p95 < 120ms |
| Edge verification | p95 < 50ms (hot cache) |
| Key rotation | Automatic, zero downtime |

---

## Migration Gates

### Gate 0: Foundation (Week 2)
**Deliverables:**
- [ ] Passkeys implementation (WebAuthn)
- [ ] Session management
- [ ] JWKS rotation
- [ ] Demo applications

**Technical Tasks:**
1. Deploy Plinto core to Enclii (dogfooding)
2. Implement passkey registration/authentication
3. Set up JWKS endpoint with automatic rotation
4. Create SDK packages:
   - `@plinto/nextjs` - Next.js integration
   - `@plinto/node` - Node.js backend SDK
   - `@plinto/react` - React hooks

**Success Criteria:**
- Passkey auth working in demo app
- JWKS rotation tested
- SDKs published to private registry

---

### Gate 1: First Production Integration (Month 2)
**Target Product:** Forge Sight (forgesight)

**Rationale:**
- Currently uses custom JWT (easiest to replace)
- Lower user count (safer for first migration)
- Team familiar with auth patterns

**Migration Steps:**
1. Install `@plinto/nextjs` in forgesight/apps/app
2. Replace custom JWT middleware with Plinto verification
3. Migrate existing users to Plinto
4. Update API authentication
5. Test all auth flows
6. Deploy to production
7. Monitor for 2 weeks

**Rollback Plan:**
- Feature flag to switch between Plinto and legacy auth
- Keep legacy auth code for 30 days
- Automated rollback if error rate > 1%

---

### Gate 2: Social & Organizations (Month 4)
**Deliverables:**
- [ ] Social logins (Google, GitHub, Microsoft)
- [ ] Organizations with RBAC
- [ ] Webhooks for auth events
- [ ] Audit logging

**Products to Migrate:**
1. **Cotiza Studio (digifab-quoting)**
   - Replace NextAuth + NestJS JWT
   - Preserve multi-tenant architecture
   - Map existing roles to Plinto RBAC

2. **Dhanam**
   - Preserve TOTP 2FA (add as Plinto MFA option)
   - Migrate mobile app authentication
   - Update financial data access controls

**Migration Strategy:**
```
Week 1: Install SDKs, create Plinto orgs for each tenant
Week 2: Migrate web authentication
Week 3: Migrate API authentication
Week 4: Migrate mobile authentication (Dhanam)
Week 5: Deprecate legacy auth, monitoring
Week 6: Remove legacy auth code
```

---

### Gate 3: Enterprise Features (Month 6)
**Deliverables:**
- [ ] SAML/OIDC federation
- [ ] SCIM provisioning
- [ ] Data residency controls
- [ ] Advanced MFA options

**Products to Migrate:**
1. **madfam-site** - Replace NextAuth with Plinto SSO
2. **Enclii** - Replace Go JWT with Plinto (self-dogfooding)

**Enterprise Integration:**
```yaml
# Example: Enterprise customer with Okta
federation:
  provider: okta
  protocol: saml
  metadata_url: https://customer.okta.com/app/.../sso/saml/metadata
  
provisioning:
  scim_enabled: true
  sync_groups: true
  default_role: viewer
```

---

### Gate 4: General Availability (Month 7+)
**Deliverables:**
- [ ] Production-ready with SLAs
- [ ] Billing integration
- [ ] Public documentation
- [ ] Self-service onboarding

**Business Model:**
| Tier | MAU | Price | Features |
|------|-----|-------|----------|
| Community | 2,000 | Free | Passkeys, email auth |
| Pro | 10,000 | $69/mo | + Social, RBAC, webhooks |
| Scale | 50,000 | $299/mo | + SAML, SCIM, priority support |
| Enterprise | Custom | Custom | + SLA, dedicated, data residency |

---

## Technical Implementation

### SDK Architecture

```typescript
// @plinto/nextjs - Next.js App Router integration
import { PlintoProvider, useAuth, withAuth } from '@plinto/nextjs';

// Provider setup (app/layout.tsx)
export default function RootLayout({ children }) {
  return (
    <PlintoProvider
      domain="auth.plinto.dev"
      clientId={process.env.PLINTO_CLIENT_ID}
    >
      {children}
    </PlintoProvider>
  );
}

// Hook usage
function ProfilePage() {
  const { user, isLoading, signOut } = useAuth();
  if (isLoading) return <Loading />;
  if (!user) return <SignIn />;
  return <Profile user={user} onSignOut={signOut} />;
}

// API route protection
import { withAuth } from '@plinto/nextjs/server';

export const GET = withAuth(async (req, { user }) => {
  // user is guaranteed to be authenticated
  return Response.json({ data: await getData(user.id) });
});
```

### Backend Verification

```typescript
// @plinto/node - Backend JWT verification
import { PlintoClient, verifyToken } from '@plinto/node';

const plinto = new PlintoClient({
  domain: 'auth.plinto.dev',
  clientId: process.env.PLINTO_CLIENT_ID,
  clientSecret: process.env.PLINTO_CLIENT_SECRET,
});

// Middleware for Express/Fastify/NestJS
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const payload = await plinto.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### JWKS Rotation

```typescript
// Automatic JWKS rotation (handled by Plinto)
// SDKs cache JWKS with automatic refresh

// Configuration
{
  "jwks_uri": "https://auth.plinto.dev/.well-known/jwks.json",
  "rotation_period": "7d",
  "algorithm": "RS256",
  "key_size": 2048
}
```

---

## Migration Checklist by Product

### Forge Sight (Gate 1)
- [ ] Install `@plinto/nextjs` in apps/app
- [ ] Install `@plinto/nextjs` in apps/www
- [ ] Install `@plinto/node` in API services
- [ ] Create Plinto application
- [ ] Configure OAuth2 redirect URIs
- [ ] Migrate user database to Plinto
- [ ] Update protected routes
- [ ] Update API authentication
- [ ] Test complete auth flow
- [ ] Deploy with feature flag
- [ ] Monitor and validate
- [ ] Remove legacy auth

### Cotiza Studio (Gate 2)
- [ ] Install SDKs in apps/web
- [ ] Install SDKs in apps/api
- [ ] Map NestJS guards to Plinto
- [ ] Migrate multi-tenant auth
- [ ] Update Prisma user models
- [ ] Test quote creation flow
- [ ] Test admin functionality
- [ ] Deploy and monitor

### Dhanam (Gate 2)
- [ ] Install SDKs in apps/web
- [ ] Install SDKs in apps/api
- [ ] Install `@plinto/react-native` in apps/mobile
- [ ] Preserve TOTP 2FA as MFA
- [ ] Update financial data guards
- [ ] Test mobile authentication
- [ ] Test bank connection flows
- [ ] Deploy and monitor

### madfam-site (Gate 3)
- [ ] Install SDKs
- [ ] Replace NextAuth
- [ ] Update user portal
- [ ] Test i18n auth flows
- [ ] Deploy and monitor

### Enclii (Gate 3)
- [ ] Create `@plinto/go` SDK
- [ ] Replace Go JWT implementation
- [ ] Update Switchyard API auth
- [ ] Update CLI authentication
- [ ] Test deployment flows
- [ ] Deploy (dogfooding complete)

---

## Risk Mitigation

### Security Risks
- **Token theft**: Use short-lived tokens (15min) + refresh tokens
- **Session hijacking**: Bind sessions to device fingerprint
- **Key compromise**: Automatic rotation, HSM storage

### Migration Risks
- **Data loss**: Export all user data before migration
- **Downtime**: Use feature flags for gradual rollout
- **Regression**: Comprehensive E2E tests before/after

### Rollback Strategy
```bash
# Feature flag to toggle auth provider
PLINTO_ENABLED=false  # Reverts to legacy auth

# Emergency rollback
./scripts/rollback-auth.sh --product=forgesight --to=legacy
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| SSO adoption | 100% products | All products use Plinto |
| Auth code reduction | -80% | LOC in auth-related code |
| User experience | Single login | One session across products |
| Security incidents | 0 | No auth-related breaches |
| Uptime | 99.95% | Plinto availability |
| Migration time | 7 months | Gate 0-4 complete |

---

## Immediate Actions

### This Week
1. Review Plinto specification in `janua/` repo
2. Set up Plinto development environment
3. Create `@plinto/nextjs` SDK skeleton
4. Define Forge Sight migration plan

### Next Sprint
1. Complete Gate 0 deliverables
2. Deploy Plinto to Enclii (dogfooding)
3. Begin Forge Sight migration
4. Create monitoring dashboards
