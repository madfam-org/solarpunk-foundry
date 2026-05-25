# MADFAM Ecosystem Integration Testing Guide

**Version**: v0.1.0
**Last Updated**: December 2025
**Scope**: Janua ↔ Enclii Integration

---

## Overview

This document provides integration testing procedures for the MADFAM ecosystem, focusing on the authentication flow between Janua (OAuth/OIDC provider) and Enclii (PaaS platform).

---

## Prerequisites

### Local Development Environment

```bash
# Required services
- PostgreSQL 15+ (localhost:5432)
- Redis 7+ (localhost:6379)
- Docker (for containerized testing)

# Cloned repositories (all in ~/labspace)
- solarpunk-foundry
- janua
- enclii
```

### Port Allocation Reference

| Service | Port | Description |
|---------|------|-------------|
| Janua API | 4100 | OAuth/OIDC endpoints, JWKS |
| Janua Dashboard | 4101 | User management UI |
| Enclii API | 4200 | Platform control plane |
| Enclii UI | 4201 | Web dashboard |

---

## Test 1: Janua Health & OIDC Discovery

### Purpose
Verify Janua is running and exposing OIDC configuration correctly.

### Steps

```bash
# 1. Start Janua API
cd ~/labspace/janua/apps/api
source .venv/bin/activate
ADMIN_BOOTSTRAP_PASSWORD='<TEST_ADMIN_BOOTSTRAP_PASSWORD>' uvicorn app.main:app --port 4100

# 2. Verify health endpoint
curl -s http://localhost:4100/health | jq

# Expected output:
{
  "status": "healthy",
  "version": "0.1.0"
}

# 3. Verify OIDC discovery
curl -s http://localhost:4100/.well-known/openid-configuration | jq

# Expected output includes:
{
  "issuer": "http://localhost:4100",
  "authorization_endpoint": "http://localhost:4100/oauth/authorize",
  "token_endpoint": "http://localhost:4100/oauth/token",
  "jwks_uri": "http://localhost:4100/.well-known/jwks.json",
  ...
}

# 4. Verify JWKS endpoint
curl -s http://localhost:4100/.well-known/jwks.json | jq

# Expected: JSON with "keys" array containing RS256 public key(s)
```

### Success Criteria
- Health endpoint returns 200 with healthy status
- OIDC configuration includes all required endpoints
- JWKS contains at least one RSA key with RS256 algorithm

---

## Test 2: Admin Bootstrap

### Purpose
Verify admin user is created on first startup.

### Steps

```bash
# 1. Start Janua with bootstrap password
ADMIN_BOOTSTRAP_PASSWORD='<TEST_ADMIN_BOOTSTRAP_PASSWORD>' uvicorn app.main:app --port 4100

# 2. Attempt login with admin credentials
curl -X POST http://localhost:4100/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@madfam.io",
    "password": "SecureTestPass123!"
  }' | jq

# Expected: JWT access_token and refresh_token
```

### Success Criteria
- Admin user `admin@madfam.io` is created automatically
- Login returns valid JWT tokens
- User has `is_admin: true` flag

---

## Test 3: Enclii Local Mode

### Purpose
Verify Enclii runs in local auth mode (standalone JWT).

### Steps

```bash
# 1. Start Enclii API in local mode
cd ~/labspace/enclii/apps/switchyard-api
ENCLII_AUTH_MODE=local go run ./cmd/api

# 2. Verify health
curl -s http://localhost:4200/health | jq

# Expected:
{
  "status": "healthy",
  "auth_mode": "local"
}
```

### Success Criteria
- Enclii starts on port 4200
- Health endpoint shows `auth_mode: local`

---

## Test 4: Enclii OIDC Mode (Janua Integration)

### Purpose
Verify Enclii validates tokens from Janua via JWKS.

### Steps

```bash
# 1. Start Janua (if not already running)
cd ~/labspace/janua/apps/api
ADMIN_BOOTSTRAP_PASSWORD='<TEST_ADMIN_BOOTSTRAP_PASSWORD>' uvicorn app.main:app --port 4100

# 2. Start Enclii in OIDC mode
cd ~/labspace/enclii/apps/switchyard-api
ENCLII_AUTH_MODE=oidc \
ENCLII_OIDC_ISSUER=http://localhost:4100 \
ENCLII_EXTERNAL_JWKS_URL=http://localhost:4100/.well-known/jwks.json \
go run ./cmd/api

# 3. Obtain token from Janua
TOKEN=$(curl -s -X POST http://localhost:4100/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@madfam.io", "password": "test-pass"}' | jq -r '.access_token')

# 4. Use token to access Enclii
curl -s http://localhost:4200/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" | jq

# Expected: List of projects (empty for new installation) or 200 OK
```

### Success Criteria
- Enclii accepts Janua-issued JWT
- Token validation uses JWKS endpoint
- Protected endpoints work with valid token
- Invalid tokens are rejected with 401

---

## Test 5: Cross-Service URL Resolution

### Purpose
Verify services can reach each other via configured URLs.

### Docker Compose Test

```bash
# 1. Start full stack via docker-compose
cd ~/labspace/enclii
docker-compose up -d

# 2. Verify cross-service connectivity
# From API container, reach Janua
docker exec enclii-api curl -s http://host.docker.internal:4100/health

# 3. Check logs for connection issues
docker-compose logs api | grep -i "janua\|oidc\|jwks"
```

### Success Criteria
- API container can reach Janua at configured URL
- No connection refused or timeout errors
- JWKS is fetched successfully on startup

---

## Test 6: Kubernetes Health Checks

### Purpose
Verify allowed_hosts permits k3s kubelet health probes.

### Steps

```bash
# 1. Deploy Janua to k3s
kubectl apply -f ~/labspace/janua/k8s/

# 2. Check pod health
kubectl get pods -n janua

# 3. Verify health check passes
kubectl describe pod janua-api-xxx -n janua | grep -A5 "Liveness"

# Expected: Liveness probe succeeded

# 4. Manual test from within cluster
kubectl run test --rm -it --image=curlimages/curl -- \
  curl -H "Host: janua-api.janua.svc.cluster.local" http://janua-api:4100/health
```

### Success Criteria
- Liveness and readiness probes pass
- Health endpoint accepts requests from pod IP range (10.42.0.0/16)
- No host header validation failures

---

## Test 7: Beta Endpoints (Development Only)

### Purpose
Verify beta endpoints are properly gated.

### Steps

```bash
# 1. Test with beta disabled (default)
ENABLE_BETA_ENDPOINTS=false uvicorn app.main:app --port 4100

curl -X POST http://localhost:4100/beta/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'

# Expected: 404 Not Found

# 2. Test with beta enabled
ENABLE_BETA_ENDPOINTS=true uvicorn app.main:app --port 4100

curl -X POST http://localhost:4100/beta/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'

# Expected: 200 OK with user created

# 3. Verify /beta/users is always unavailable (removed)
curl http://localhost:4100/beta/users

# Expected: 404 Not Found (even with ENABLE_BETA_ENDPOINTS=true)
```

### Success Criteria
- Beta endpoints return 404 when disabled
- Beta endpoints work when enabled
- `/beta/users` is permanently removed

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `connection refused :4100` | Janua not running | Start Janua API |
| `JWKS fetch failed` | Wrong issuer URL | Check OIDC_ISSUER matches Janua URL |
| `host not allowed` | TrustedHostMiddleware | Add host to allowed_hosts in main.py |
| `token validation failed` | Issuer mismatch | Ensure token issuer matches OIDC config |
| Health probe fails | Pod IP not in allowed list | Verify 10.42.*.* in allowed_hosts |

### Debug Commands

```bash
# Check Janua logs
tail -f ~/labspace/janua/apps/api/logs/app.log

# Test JWKS endpoint directly
curl -v http://localhost:4100/.well-known/jwks.json

# Decode JWT token
echo $TOKEN | cut -d. -f2 | base64 -d | jq

# Check Enclii auth config
curl http://localhost:4200/api/status | jq '.auth'
```

---

## Production Testing

### Pre-Deployment Checklist

- [ ] Janua health: `curl "$JANUA_API_URL/health"`
- [ ] OIDC discovery: `curl "$JANUA_API_URL/.well-known/openid-configuration"`
- [ ] JWKS endpoint: `curl "$JANUA_API_URL/.well-known/jwks.json"`
- [ ] Enclii health: `curl https://api.enclii.dev/health`
- [ ] Cross-service auth: Obtain Janua token, use with Enclii

### Production URLs

| Service | URL |
|---------|-----|
| Janua API | `$JANUA_API_URL` |
| Janua JWKS | `$JANUA_API_URL/.well-known/jwks.json` |
| Enclii API | https://api.enclii.dev |

---

*MADFAM Ecosystem Integration Testing Guide v0.1.0*
