# Scaling Runbook

## When to Scale

- High CPU/memory utilization (>80% sustained)
- Increased response latency
- Request queue buildup
- Planned traffic increase

## Horizontal Scaling (Replicas)

### Scale Specific Deployment

```bash
# Scale up
ssh ssh.madfam.io "sudo kubectl scale deployment/janua-api -n janua --replicas=3"

# Scale down
ssh ssh.madfam.io "sudo kubectl scale deployment/janua-api -n janua --replicas=1"

# Check current replicas
ssh ssh.madfam.io "sudo kubectl get deployment/janua-api -n janua"
```

### Scale All Services

```bash
# Scale all to 2 replicas
ssh ssh.madfam.io "sudo kubectl scale deployment --all -n janua --replicas=2"
```

### Auto-scaling (HPA)

```bash
# Create HPA
ssh ssh.madfam.io "sudo kubectl autoscale deployment/janua-api -n janua --min=1 --max=5 --cpu-percent=70"

# Check HPA status
ssh ssh.madfam.io "sudo kubectl get hpa -n janua"

# Delete HPA (return to manual)
ssh ssh.madfam.io "sudo kubectl delete hpa janua-api -n janua"
```

## Vertical Scaling (Resources)

### Check Current Resources

```bash
# View resource requests/limits
ssh ssh.madfam.io "sudo kubectl get deployment/janua-api -n janua -o jsonpath='{.spec.template.spec.containers[0].resources}'"

# View actual usage
ssh ssh.madfam.io "sudo kubectl top pods -n janua"
```

### Update Resource Limits

```bash
# Patch deployment with new limits
ssh ssh.madfam.io "sudo kubectl patch deployment/janua-api -n janua -p '{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"janua-api\",\"resources\":{\"limits\":{\"memory\":\"1Gi\",\"cpu\":\"1000m\"},\"requests\":{\"memory\":\"512Mi\",\"cpu\":\"250m\"}}}]}}}}'"
```

## Database Scaling

### PostgreSQL Connection Pool

```bash
# Check current connections
ssh ssh.madfam.io "docker exec janua-postgres psql -U janua -c 'SELECT count(*) FROM pg_stat_activity;'"

# Increase max connections (requires restart)
ssh ssh.madfam.io "docker exec janua-postgres psql -U janua -c 'SHOW max_connections;'"
```

### PostgreSQL Memory

```bash
# Check shared buffers
ssh ssh.madfam.io "docker exec janua-postgres psql -U janua -c 'SHOW shared_buffers;'"

# Update in docker-compose and restart
ssh ssh.madfam.io "docker restart janua-postgres"
```

### Redis Memory

```bash
# Check memory usage
ssh ssh.madfam.io "docker exec janua-redis redis-cli INFO memory"

# Set max memory policy
ssh ssh.madfam.io "docker exec janua-redis redis-cli CONFIG SET maxmemory 512mb"
ssh ssh.madfam.io "docker exec janua-redis redis-cli CONFIG SET maxmemory-policy allkeys-lru"
```

## Node Scaling (Infrastructure)

### Check Node Capacity

```bash
# Node resources
ssh ssh.madfam.io "sudo kubectl describe node | grep -A10 'Capacity:'"
ssh ssh.madfam.io "sudo kubectl describe node | grep -A10 'Allocatable:'"
ssh ssh.madfam.io "sudo kubectl describe node | grep -A10 'Allocated resources:'"
```

### ZFS Storage

```bash
# Check pool usage
ssh ssh.madfam.io "sudo zpool list"
ssh ssh.madfam.io "sudo zfs list"

# If running low, consider adding drives or expanding vdevs
```

## Load Testing

Before scaling, validate capacity:

```bash
# Simple load test with curl
for i in {1..100}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4100/api/v1/health
done

# Use hey or ab for more thorough testing
# hey -n 1000 -c 10 http://localhost:4100/api/v1/health
```

## Monitoring During Scale Events

```bash
# Watch pods
ssh ssh.madfam.io "sudo kubectl get pods -n janua -w"

# Watch resource usage
ssh ssh.madfam.io "watch -n5 'sudo kubectl top pods -n janua'"

# Watch events
ssh ssh.madfam.io "sudo kubectl get events -n janua --sort-by='.lastTimestamp'"
```

## Capacity Planning

| Service | Baseline | Max Tested | Recommended Max |
|---------|----------|------------|-----------------|
| janua-api | 1 replica | 5 replicas | 3 replicas |
| janua-dashboard | 1 replica | 3 replicas | 2 replicas |
| PostgreSQL | 100 conn | 200 conn | 150 conn |
| Redis | 256MB | 1GB | 512MB |

## Emergency Load Shedding

If system is overwhelmed:

```bash
# Reduce to minimum replicas
ssh ssh.madfam.io "sudo kubectl scale deployment --all -n janua --replicas=1"

# Enable maintenance mode (if implemented)
# ssh ssh.madfam.io "curl -X POST http://localhost:4100/api/v1/admin/maintenance"

# Clear Redis caches if memory issue
ssh ssh.madfam.io "docker exec janua-redis redis-cli FLUSHDB"
```
