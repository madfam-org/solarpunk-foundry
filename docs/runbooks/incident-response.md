# Incident Response Runbook

## Severity Levels

| Level | Definition | Response Time | Examples |
|-------|------------|---------------|----------|
| SEV1 | Complete outage | Immediate | API down, auth broken, data loss |
| SEV2 | Degraded service | < 1 hour | Slow responses, partial failures |
| SEV3 | Minor issue | < 4 hours | UI bugs, non-critical errors |

## Initial Assessment (First 5 minutes)

### 1. Check Service Health

```bash
# Quick status check
ssh ssh.madfam.io "sudo kubectl get pods -n janua"

# Check all namespaces
ssh ssh.madfam.io "sudo kubectl get pods -A"

# Docker containers
ssh ssh.madfam.io "docker ps --format 'table {{.Names}}\t{{.Status}}'"
```

### 2. Check Logs

```bash
# Kubernetes pod logs
ssh ssh.madfam.io "sudo kubectl logs -n janua deployment/janua-api --tail=100"

# Docker container logs
ssh ssh.madfam.io "docker logs janua-api --tail=100"

# System logs
ssh ssh.madfam.io "sudo journalctl -u k3s --since '5 minutes ago'"
```

### 3. Check Resources

```bash
# Node resources
ssh ssh.madfam.io "sudo kubectl top nodes"

# Pod resources
ssh ssh.madfam.io "sudo kubectl top pods -n janua"

# Disk usage
ssh ssh.madfam.io "df -h"
ssh ssh.madfam.io "sudo zfs list"
```

## Common Issues & Resolutions

### Pod CrashLoopBackOff

```bash
# Get pod details
ssh ssh.madfam.io "sudo kubectl describe pod -n janua <pod-name>"

# Check previous logs
ssh ssh.madfam.io "sudo kubectl logs -n janua <pod-name> --previous"

# Restart deployment
ssh ssh.madfam.io "sudo kubectl rollout restart deployment/janua-api -n janua"
```

### Database Connection Issues

```bash
# Check postgres container
ssh ssh.madfam.io "docker ps | grep postgres"

# Test connection
ssh ssh.madfam.io "docker exec janua-postgres pg_isready -U janua"

# Check connections
ssh ssh.madfam.io "docker exec janua-postgres psql -U janua -c 'SELECT count(*) FROM pg_stat_activity;'"

# Restart if needed
ssh ssh.madfam.io "docker restart janua-postgres"
```

### Redis Connection Issues

```bash
# Check redis
ssh ssh.madfam.io "docker ps | grep redis"

# Test ping
ssh ssh.madfam.io "docker exec janua-redis redis-cli ping"

# Check memory
ssh ssh.madfam.io "docker exec janua-redis redis-cli info memory | head -10"

# Restart if needed
ssh ssh.madfam.io "docker restart janua-redis"
```

### High Memory/CPU

```bash
# Identify offending pods
ssh ssh.madfam.io "sudo kubectl top pods -n janua --sort-by=memory"

# Check node capacity
ssh ssh.madfam.io "sudo kubectl describe node | grep -A5 'Allocated resources'"

# Scale down if needed
ssh ssh.madfam.io "sudo kubectl scale deployment/janua-api -n janua --replicas=1"
```

### Cloudflare Tunnel Issues

```bash
# Check tunnel status
ssh ssh.madfam.io "sudo systemctl status cloudflared"

# Restart tunnel
ssh ssh.madfam.io "sudo systemctl restart cloudflared"

# Check tunnel logs
ssh ssh.madfam.io "sudo journalctl -u cloudflared --since '10 minutes ago'"
```

## Escalation Path

1. **Attempt restart** of affected service
2. **Check dependencies** (database, redis, network)
3. **Roll back** if recent deployment
4. **Scale resources** if capacity issue
5. **Contact** @aldoruizluna for SEV1/SEV2

## Post-Incident

1. Document timeline in GitHub issue
2. Identify root cause
3. Create prevention measures
4. Update runbooks if needed
