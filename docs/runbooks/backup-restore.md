# Backup & Restore Runbook

## Backup Strategy

| Component | Method | Frequency | Retention |
|-----------|--------|-----------|-----------|
| PostgreSQL | pg_dump | Daily | 30 days |
| Redis | RDB snapshot | Hourly | 7 days |
| Secrets | Manual export | On change | Permanent |
| ZFS | zfs snapshot | Hourly | 7 days |

## PostgreSQL Backup

### Manual Backup

```bash
# Backup to file
ssh <SSH_ZERO_TRUST_HOST> "docker exec janua-postgres pg_dump -U janua janua | gzip > /tank/backups/postgres/janua-$(date +%Y%m%d-%H%M%S).sql.gz"

# Backup specific tables
ssh <SSH_ZERO_TRUST_HOST> "docker exec janua-postgres pg_dump -U janua janua -t users -t sessions | gzip > /tank/backups/postgres/janua-users-$(date +%Y%m%d).sql.gz"
```

### Automated Backup (cron)

```bash
# Add to crontab on server
0 2 * * * docker exec janua-postgres pg_dump -U janua janua | gzip > /tank/backups/postgres/janua-$(date +\%Y\%m\%d).sql.gz
```

### Restore from Backup

```bash
# List available backups
ssh <SSH_ZERO_TRUST_HOST> "ls -la /tank/backups/postgres/"

# Restore (WARNING: This will overwrite current data)
ssh <SSH_ZERO_TRUST_HOST> "gunzip -c /tank/backups/postgres/janua-20251206.sql.gz | docker exec -i janua-postgres psql -U janua janua"

# Restore specific tables only
ssh <SSH_ZERO_TRUST_HOST> "gunzip -c /tank/backups/postgres/janua-users-20251206.sql.gz | docker exec -i janua-postgres psql -U janua janua"
```

## Redis Backup

### Manual Backup

```bash
# Trigger RDB save
ssh <SSH_ZERO_TRUST_HOST> "docker exec janua-redis redis-cli BGSAVE"

# Wait for completion
ssh <SSH_ZERO_TRUST_HOST> "docker exec janua-redis redis-cli LASTSAVE"

# Copy dump file
ssh <SSH_ZERO_TRUST_HOST> "docker cp janua-redis:/data/dump.rdb /tank/backups/redis/dump-$(date +%Y%m%d-%H%M%S).rdb"
```

### Restore from Backup

```bash
# Stop redis
ssh <SSH_ZERO_TRUST_HOST> "docker stop janua-redis"

# Copy backup to data directory
ssh <SSH_ZERO_TRUST_HOST> "cp /tank/backups/redis/dump-20251206.rdb /opt/solarpunk/data/redis/dump.rdb"

# Start redis
ssh <SSH_ZERO_TRUST_HOST> "docker start janua-redis"

# Verify
ssh <SSH_ZERO_TRUST_HOST> "docker exec janua-redis redis-cli DBSIZE"
```

## ZFS Snapshots

### Create Snapshot

```bash
# Snapshot entire pool
ssh <SSH_ZERO_TRUST_HOST> "sudo zfs snapshot tank@manual-$(date +%Y%m%d-%H%M%S)"

# Snapshot specific dataset
ssh <SSH_ZERO_TRUST_HOST> "sudo zfs snapshot tank/data@backup-$(date +%Y%m%d)"
```

### List Snapshots

```bash
ssh <SSH_ZERO_TRUST_HOST> "sudo zfs list -t snapshot"
```

### Restore from Snapshot

```bash
# Rollback (WARNING: destroys all changes since snapshot)
ssh <SSH_ZERO_TRUST_HOST> "sudo zfs rollback tank@snapshot-name"

# Or clone snapshot for recovery
ssh <SSH_ZERO_TRUST_HOST> "sudo zfs clone tank@snapshot-name tank/recovery"
```

### Cleanup Old Snapshots

```bash
# List snapshots older than 7 days
ssh <SSH_ZERO_TRUST_HOST> "sudo zfs list -t snapshot -o name,creation | grep 'tank@'"

# Delete specific snapshot
ssh <SSH_ZERO_TRUST_HOST> "sudo zfs destroy tank@old-snapshot"
```

## Secrets Backup

### Export Secrets

```bash
# Create encrypted backup
ssh <SSH_ZERO_TRUST_HOST> "tar -czf - /opt/solarpunk/secrets | openssl enc -aes-256-cbc -pbkdf2 > /tank/backups/secrets/secrets-$(date +%Y%m%d).tar.gz.enc"
```

### Restore Secrets

```bash
# Decrypt and extract
ssh <SSH_ZERO_TRUST_HOST> "openssl enc -d -aes-256-cbc -pbkdf2 -in /tank/backups/secrets/secrets-20251206.tar.gz.enc | tar -xzf - -C /"
```

## Disaster Recovery Checklist

1. [ ] Verify ZFS pool health: `sudo zpool status`
2. [ ] Check latest backup timestamps
3. [ ] Restore PostgreSQL from latest backup
4. [ ] Restore Redis if session data needed
5. [ ] Restore secrets/configuration
6. [ ] Restart all services
7. [ ] Verify API health endpoints
8. [ ] Check logs for errors
9. [ ] Test authentication flow
10. [ ] Notify stakeholders
