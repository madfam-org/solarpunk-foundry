# Rollback Runbook

## When to Rollback

- New deployment causes errors or crashes
- Performance regression detected
- Security vulnerability in new release
- User-facing bugs in production

## Kubernetes Rollback

### Check Rollout History

```bash
# View deployment history
ssh <SSH_ZERO_TRUST_HOST> "sudo kubectl rollout history deployment/janua-api -n janua"

# View specific revision details
ssh <SSH_ZERO_TRUST_HOST> "sudo kubectl rollout history deployment/janua-api -n janua --revision=2"
```

### Rollback to Previous Version

```bash
# Rollback to previous revision
ssh <SSH_ZERO_TRUST_HOST> "sudo kubectl rollout undo deployment/janua-api -n janua"

# Rollback to specific revision
ssh <SSH_ZERO_TRUST_HOST> "sudo kubectl rollout undo deployment/janua-api -n janua --to-revision=2"

# Monitor rollback progress
ssh <SSH_ZERO_TRUST_HOST> "sudo kubectl rollout status deployment/janua-api -n janua"
```

### Rollback All Janua Services

```bash
# Rollback all deployments in namespace
for deploy in janua-api janua-dashboard janua-admin janua-docs; do
  ssh <SSH_ZERO_TRUST_HOST> "sudo kubectl rollout undo deployment/$deploy -n janua"
done
```

## Docker Rollback

### Using Image Tags

```bash
# List available images
ssh <SSH_ZERO_TRUST_HOST> "docker images | grep janua-api"

# Rollback to specific SHA
ssh <SSH_ZERO_TRUST_HOST> "docker stop janua-api && docker rm janua-api"
ssh <SSH_ZERO_TRUST_HOST> "docker run -d --name janua-api janua-api:b657a88"  # Previous SHA
```

### Using Docker Compose

```bash
# Edit docker-compose.yml to use previous image tag
# Then redeploy
ssh <SSH_ZERO_TRUST_HOST> "cd /opt/solarpunk/janua/runtime && docker-compose -f docker-compose.prod.yml up -d janua-api"
```

## Identifying Version Information

### Check Current Deployment

```bash
# Get current image and labels
ssh <SSH_ZERO_TRUST_HOST> "sudo kubectl get deployment/janua-api -n janua -o jsonpath='{.spec.template.spec.containers[0].image}'"

# Check image labels for git SHA
ssh <SSH_ZERO_TRUST_HOST> "docker inspect janua-api:latest --format='{{.Config.Labels}}'"
```

### Git Reference

```bash
# On production server, check repo state
ssh <SSH_ZERO_TRUST_HOST> "cd /opt/solarpunk/janua && git log --oneline -5"

# Checkout previous commit
ssh <SSH_ZERO_TRUST_HOST> "cd /opt/solarpunk/janua && git checkout HEAD~1"

# Rebuild with previous code
ssh <SSH_ZERO_TRUST_HOST> "/opt/solarpunk/scripts/build-and-tag.sh janua-api"
```

## Rollback Verification

### Health Checks

```bash
# API health
ssh <SSH_ZERO_TRUST_HOST> "curl -s http://localhost:4100/ | head -1"

# Dashboard health
ssh <SSH_ZERO_TRUST_HOST> "curl -s -I http://localhost:4101/ | head -1"

# Check pod status
ssh <SSH_ZERO_TRUST_HOST> "sudo kubectl get pods -n janua"
```

### Functional Tests

```bash
# Test authentication endpoint
ssh <SSH_ZERO_TRUST_HOST> "curl -s -X POST http://localhost:4100/api/v1/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"test\"}'"

# Check API version
ssh <SSH_ZERO_TRUST_HOST> "curl -s http://localhost:4100/api/v1/health"
```

## Emergency Procedures

### Complete Service Restart

```bash
# Stop all services
ssh <SSH_ZERO_TRUST_HOST> "sudo kubectl scale deployment --all -n janua --replicas=0"

# Wait for termination
sleep 10

# Start all services
ssh <SSH_ZERO_TRUST_HOST> "sudo kubectl scale deployment --all -n janua --replicas=1"
```

### Database Rollback

If database migrations need reverting:

```bash
# Check current migration version
ssh <SSH_ZERO_TRUST_HOST> "docker exec janua-api alembic current"

# Rollback one migration
ssh <SSH_ZERO_TRUST_HOST> "docker exec janua-api alembic downgrade -1"

# Rollback to specific revision
ssh <SSH_ZERO_TRUST_HOST> "docker exec janua-api alembic downgrade 009"
```

## Post-Rollback Actions

1. [ ] Verify all services are healthy
2. [ ] Check logs for errors
3. [ ] Test critical user flows
4. [ ] Document the incident
5. [ ] Root cause analysis on failed deployment
6. [ ] Fix issue before re-deploying
