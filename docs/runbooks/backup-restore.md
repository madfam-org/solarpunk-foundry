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
ssh ssh.madfam.io "docker exec janua-postgres pg_dump -U janua janua | gzip > /tank/backups/postgres/janua-$(date +%Y%m%d-%H%M%S).sql.gz"

# Backup specific tables
ssh ssh.madfam.io "docker exec janua-postgres pg_dump -U janua janua -t users -t sessions | gzip > /tank/backups/postgres/janua-users-$(date +%Y%m%d).sql.gz"
```

### Automated Backup (cron)

```bash
# Add to crontab on server
0 2 * * * docker exec janua-postgres pg_dump -U janua janua | gzip > /tank/backups/postgres/janua-$(date +\%Y\%m\%d).sql.gz
```

### Restore from Backup

```bash
# List available backups
ssh ssh.madfam.io "ls -la /tank/backups/postgres/"

# Restore (WARNING: This will overwrite current data)
ssh ssh.madfam.io "gunzip -c /tank/backups/postgres/janua-20251206.sql.gz | docker exec -i janua-postgres psql -U janua janua"

# Restore specific tables only
ssh ssh.madfam.io "gunzip -c /tank/backups/postgres/janua-users-20251206.sql.gz | docker exec -i janua-postgres psql -U janua janua"
```

## Redis Backup

### Manual Backup

```bash
# Trigger RDB save
ssh ssh.madfam.io "docker exec janua-redis redis-cli BGSAVE"

# Wait for completion
ssh ssh.madfam.io "docker exec janua-redis redis-cli LASTSAVE"

# Copy dump file
ssh ssh.madfam.io "docker cp janua-redis:/data/dump.rdb /tank/backups/redis/dump-$(date +%Y%m%d-%H%M%S).rdb"
```

### Restore from Backup

```bash
# Stop redis
ssh ssh.madfam.io "docker stop janua-redis"

# Copy backup to data directory
ssh ssh.madfam.io "cp /tank/backups/redis/dump-20251206.rdb /opt/solarpunk/data/redis/dump.rdb"

# Start redis
ssh ssh.madfam.io "docker start janua-redis"

# Verify
ssh ssh.madfam.io "docker exec janua-redis redis-cli DBSIZE"
```

## ZFS Snapshots

### Create Snapshot

```bash
# Snapshot entire pool
ssh ssh.madfam.io "sudo zfs snapshot tank@manual-$(date +%Y%m%d-%H%M%S)"

# Snapshot specific dataset
ssh ssh.madfam.io "sudo zfs snapshot tank/data@backup-$(date +%Y%m%d)"
```

### List Snapshots

```bash
ssh ssh.madfam.io "sudo zfs list -t snapshot"
```

### Restore from Snapshot

```bash
# Rollback (WARNING: destroys all changes since snapshot)
ssh ssh.madfam.io "sudo zfs rollback tank@snapshot-name"

# Or clone snapshot for recovery
ssh ssh.madfam.io "sudo zfs clone tank@snapshot-name tank/recovery"
```

### Cleanup Old Snapshots

```bash
# List snapshots older than 7 days
ssh ssh.madfam.io "sudo zfs list -t snapshot -o name,creation | grep 'tank@'"

# Delete specific snapshot
ssh ssh.madfam.io "sudo zfs destroy tank@old-snapshot"
```

## Secrets Backup

### Export Secrets

```bash
# Create encrypted backup
ssh ssh.madfam.io "tar -czf - /opt/solarpunk/secrets | openssl enc -aes-256-cbc -pbkdf2 > /tank/backups/secrets/secrets-$(date +%Y%m%d).tar.gz.enc"
```

### Restore Secrets

```bash
# Decrypt and extract
ssh ssh.madfam.io "openssl enc -d -aes-256-cbc -pbkdf2 -in /tank/backups/secrets/secrets-20251206.tar.gz.enc | tar -xzf - -C /"
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
