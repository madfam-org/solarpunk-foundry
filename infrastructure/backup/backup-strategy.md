# Janua Database Backup and Disaster Recovery Strategy

## Overview

This document outlines the comprehensive backup and disaster recovery (DR) procedures for the Janua Identity Platform, ensuring business continuity and data protection.

## Backup Strategy

### 1. Database Backups

#### PostgreSQL Primary Database
- **Frequency**: 
  - Full backup: Daily at 02:00 UTC
  - Incremental backup: Every 4 hours
  - Transaction logs: Continuous (WAL archiving)
- **Retention**:
  - Daily backups: 30 days
  - Weekly backups: 12 weeks
  - Monthly backups: 12 months
  - Yearly backups: 7 years (compliance)
- **Storage**:
  - Primary: AWS S3 with versioning enabled
  - Secondary: Cross-region replication to us-west-2
  - Tertiary: AWS Glacier for long-term archive

#### Redis Cache
- **Frequency**: Every 6 hours (RDB snapshots)
- **AOF**: Enabled with fsync every second
- **Retention**: 7 days
- **Storage**: S3 with lifecycle policies

#### Elasticsearch Audit Logs
- **Frequency**: Daily snapshots
- **Retention**: 90 days operational, 7 years archived
- **Storage**: S3 with Glacier transition after 90 days

### 2. Application Data Backups

- **User uploads**: Real-time replication to S3
- **Configuration files**: Version controlled in Git
- **Secrets**: AWS Secrets Manager with automatic rotation
- **SSL certificates**: AWS Certificate Manager with auto-renewal

## Disaster Recovery Procedures

### RPO and RTO Targets

| Component | RPO (Recovery Point Objective) | RTO (Recovery Time Objective) |
|-----------|--------------------------------|--------------------------------|
| PostgreSQL | 5 minutes | 1 hour |
| Redis | 1 hour | 30 minutes |
| Application | 0 (stateless) | 15 minutes |
| Elasticsearch | 24 hours | 4 hours |

### Recovery Scenarios

#### 1. Single Node Failure
- **Detection**: Automated health checks every 30 seconds
- **Response**: Automatic failover to standby replica
- **Recovery Time**: < 2 minutes
- **Manual Intervention**: None required

#### 2. Availability Zone Failure
- **Detection**: AWS CloudWatch alarms
- **Response**: Traffic routing to healthy AZs
- **Recovery Time**: < 5 minutes
- **Manual Intervention**: Monitor and verify

#### 3. Region Failure
- **Detection**: Multi-region health monitoring
- **Response**: DNS failover to DR region
- **Recovery Time**: < 30 minutes
- **Manual Intervention**: Execute DR runbook

#### 4. Data Corruption
- **Detection**: Data integrity checks, user reports
- **Response**: Point-in-time recovery from backups
- **Recovery Time**: 1-4 hours depending on data volume
- **Manual Intervention**: Required for validation

## Backup Scripts

### PostgreSQL Backup Script
```bash
#!/bin/bash
# Location: deployment/backup/postgres-backup.sh

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_NAME="${DB_NAME:-janua}"
DB_USER="${DB_USER:-janua}"
S3_BUCKET="${S3_BUCKET:-janua-backups}"
BACKUP_DIR="/tmp/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="postgres_${DB_NAME}_${TIMESTAMP}.sql.gz"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Perform backup
echo "Starting PostgreSQL backup at $(date)"
PGPASSWORD=${DB_PASSWORD} pg_dump \
  -h ${DB_HOST} \
  -U ${DB_USER} \
  -d ${DB_NAME} \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  | gzip -9 > ${BACKUP_DIR}/${BACKUP_FILE}

# Upload to S3
echo "Uploading backup to S3"
aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE} \
  s3://${S3_BUCKET}/postgres/daily/ \
  --storage-class STANDARD_IA \
  --server-side-encryption AES256

# Verify upload
aws s3api head-object \
  --bucket ${S3_BUCKET} \
  --key postgres/daily/${BACKUP_FILE}

# Clean up local file
rm -f ${BACKUP_DIR}/${BACKUP_FILE}

echo "Backup completed successfully at $(date)"

# Send notification
aws sns publish \
  --topic-arn ${SNS_TOPIC_ARN} \
  --subject "PostgreSQL Backup Success" \
  --message "Database backup completed: ${BACKUP_FILE}"
```

### Recovery Script
```bash
#!/bin/bash
# Location: deployment/backup/postgres-restore.sh

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_NAME="${DB_NAME:-janua}"
DB_USER="${DB_USER:-janua}"
S3_BUCKET="${S3_BUCKET:-janua-backups}"
RESTORE_DIR="/tmp/restore"

# Parse arguments
if [ $# -eq 0 ]; then
  echo "Usage: $0 <backup-file-name> [point-in-time]"
  exit 1
fi

BACKUP_FILE=$1
POINT_IN_TIME=${2:-}

# Create restore directory
mkdir -p ${RESTORE_DIR}

# Download backup from S3
echo "Downloading backup from S3"
aws s3 cp s3://${S3_BUCKET}/postgres/daily/${BACKUP_FILE} \
  ${RESTORE_DIR}/${BACKUP_FILE}

# Stop application connections
echo "Stopping application connections"
kubectl scale deployment janua-api --replicas=0

# Restore database
echo "Restoring database from backup"
gunzip -c ${RESTORE_DIR}/${BACKUP_FILE} | \
  PGPASSWORD=${DB_PASSWORD} psql \
    -h ${DB_HOST} \
    -U ${DB_USER} \
    -d ${DB_NAME}

# Apply point-in-time recovery if specified
if [ -n "${POINT_IN_TIME}" ]; then
  echo "Applying WAL logs to ${POINT_IN_TIME}"
  # WAL replay logic here
fi

# Verify restoration
echo "Verifying database restoration"
PGPASSWORD=${DB_PASSWORD} psql \
  -h ${DB_HOST} \
  -U ${DB_USER} \
  -d ${DB_NAME} \
  -c "SELECT COUNT(*) FROM users;"

# Restart application
echo "Restarting application"
kubectl scale deployment janua-api --replicas=3

# Clean up
rm -f ${RESTORE_DIR}/${BACKUP_FILE}

echo "Database restoration completed at $(date)"

# Send notification
aws sns publish \
  --topic-arn ${SNS_TOPIC_ARN} \
  --subject "PostgreSQL Restore Complete" \
  --message "Database restored from: ${BACKUP_FILE}"
```

## Monitoring and Alerting

### Backup Monitoring
- CloudWatch metrics for backup job success/failure
- S3 bucket monitoring for backup file presence
- Age monitoring to ensure recent backups exist
- Size monitoring to detect anomalies

### Alert Conditions
1. Backup job failure
2. Backup age > 25 hours
3. Backup size deviation > 20%
4. S3 replication lag > 1 hour
5. DR region health check failure

## Testing Procedures

### Monthly DR Tests
1. Restore database to test environment
2. Verify data integrity
3. Test application connectivity
4. Document recovery time

### Quarterly Full DR Drill
1. Simulate region failure
2. Execute complete failover
3. Validate all systems operational
4. Measure against RTO/RPO targets
5. Update runbooks based on findings

### Annual Compliance Audit
1. Review backup retention compliance
2. Verify encryption at rest and in transit
3. Audit access logs
4. Update procedures based on new requirements

## Runbooks

### Runbook: PostgreSQL Recovery
1. **Assess** the situation and determine recovery type needed
2. **Notify** stakeholders via incident management system
3. **Stop** application traffic if necessary
4. **Download** appropriate backup from S3
5. **Restore** database using restore script
6. **Verify** data integrity with test queries
7. **Resume** application traffic
8. **Monitor** for any issues
9. **Document** incident and recovery actions

### Runbook: Region Failover
1. **Confirm** primary region failure
2. **Activate** incident response team
3. **Update** Route53 DNS to point to DR region
4. **Scale** DR region resources to handle load
5. **Verify** all services operational in DR region
6. **Monitor** performance and errors
7. **Communicate** status to customers
8. **Plan** return to primary region

## Automation

### Backup Automation
- Kubernetes CronJobs for scheduled backups
- AWS Lambda for S3 lifecycle management
- Step Functions for complex backup workflows
- EventBridge for backup scheduling and monitoring

### Recovery Automation
- CloudFormation templates for infrastructure recreation
- Ansible playbooks for application deployment
- Terraform for infrastructure as code
- GitHub Actions for automated testing

## Security Considerations

### Encryption
- Backups encrypted at rest using AES-256
- Encryption in transit using TLS 1.3
- Key rotation every 90 days
- Separate KMS keys for each environment

### Access Control
- IAM roles with least privilege
- MFA required for backup operations
- Audit logging for all backup access
- Regular access reviews

### Compliance
- GDPR: Right to erasure implementation
- CCPA: Data retention policies
- SOC 2: Backup security controls
- HIPAA: Encryption and access controls

## Cost Optimization

### Storage Tiers
- Hot (0-30 days): S3 Standard
- Warm (31-90 days): S3 Standard-IA
- Cold (91-365 days): S3 Glacier Instant
- Archive (>365 days): S3 Glacier Deep Archive

### Compression
- PostgreSQL: gzip -9 (best compression)
- Redis: RDB compression enabled
- Elasticsearch: Snapshot compression

### Deduplication
- Incremental backups where possible
- Cross-region replication only for critical data
- Intelligent tiering for automatic cost optimization

## Documentation

### Required Documentation
- [ ] Backup schedule matrix
- [ ] Recovery time objectives
- [ ] Contact list for incidents
- [ ] Vendor support contracts
- [ ] Network diagrams
- [ ] Data flow diagrams
- [ ] Compliance certificates

### Training Requirements
- All engineers: Basic backup/restore procedures
- Senior engineers: Full DR procedures
- DevOps team: Automation and monitoring
- Management: Decision criteria for DR activation