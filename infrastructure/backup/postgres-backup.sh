#!/bin/bash

# PostgreSQL Backup Script for Janua
# Performs automated backups with S3 upload and monitoring

set -euo pipefail

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly TIMESTAMP=$(date +%Y%m%d_%H%M%S)
readonly BACKUP_DIR="${BACKUP_DIR:-/tmp/janua-backups}"
readonly LOG_FILE="${LOG_DIR:-/var/log}/janua-backup-${TIMESTAMP}.log"

# Database configuration
readonly DB_HOST="${DB_HOST:-localhost}"
readonly DB_PORT="${DB_PORT:-5432}"
readonly DB_NAME="${DB_NAME:-janua}"
readonly DB_USER="${DB_USER:-janua}"
readonly DB_PASSWORD="${DB_PASSWORD}"

# S3 configuration
readonly S3_BUCKET="${S3_BUCKET:-janua-backups}"
readonly S3_PREFIX="${S3_PREFIX:-postgres}"
readonly AWS_REGION="${AWS_REGION:-us-east-1}"

# Notification configuration
readonly SNS_TOPIC_ARN="${SNS_TOPIC_ARN}"
readonly SLACK_WEBHOOK="${SLACK_WEBHOOK}"

# Backup configuration
readonly BACKUP_TYPE="${1:-daily}"  # daily, weekly, monthly
readonly COMPRESSION_LEVEL="${COMPRESSION_LEVEL:-9}"
readonly PARALLEL_JOBS="${PARALLEL_JOBS:-4}"

# Functions
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"
}

error() {
    log "ERROR: $*"
    send_notification "ERROR" "$*"
    exit 1
}

send_notification() {
    local status=$1
    local message=$2
    
    # SNS notification
    if [ -n "${SNS_TOPIC_ARN}" ]; then
        aws sns publish \
            --topic-arn "${SNS_TOPIC_ARN}" \
            --subject "Janua Backup ${status}" \
            --message "${message}" \
            --region "${AWS_REGION}" 2>/dev/null || true
    fi
    
    # Slack notification
    if [ -n "${SLACK_WEBHOOK}" ]; then
        curl -X POST "${SLACK_WEBHOOK}" \
            -H 'Content-Type: application/json' \
            -d "{\"text\":\"Janua Backup ${status}: ${message}\"}" 2>/dev/null || true
    fi
}

check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check required tools
    for tool in pg_dump aws gzip; do
        if ! command -v ${tool} &> /dev/null; then
            error "${tool} is not installed"
        fi
    done
    
    # Check database connectivity
    PGPASSWORD="${DB_PASSWORD}" psql \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        -c "SELECT 1" &> /dev/null || error "Cannot connect to database"
    
    # Check S3 access
    aws s3 ls "s3://${S3_BUCKET}/" &> /dev/null || error "Cannot access S3 bucket"
    
    log "Prerequisites check completed"
}

create_backup() {
    local backup_file="${BACKUP_DIR}/postgres_${DB_NAME}_${BACKUP_TYPE}_${TIMESTAMP}.sql.gz"
    
    log "Starting ${BACKUP_TYPE} backup of ${DB_NAME}"
    log "Backup file: ${backup_file}"
    
    # Create backup directory
    mkdir -p "${BACKUP_DIR}"
    
    # Get database size for estimation
    local db_size=$(PGPASSWORD="${DB_PASSWORD}" psql \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        -t -c "SELECT pg_database_size('${DB_NAME}')")
    
    log "Database size: $(numfmt --to=iec-i --suffix=B ${db_size})"
    
    # Perform backup with progress monitoring
    PGPASSWORD="${DB_PASSWORD}" pg_dump \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        --verbose \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        --jobs="${PARALLEL_JOBS}" \
        --format=directory \
        --file="${backup_file%.gz}" 2>&1 | tee -a "${LOG_FILE}"
    
    # Compress backup
    log "Compressing backup..."
    tar czf "${backup_file}" -C "${BACKUP_DIR}" "$(basename ${backup_file%.gz})"
    rm -rf "${backup_file%.gz}"
    
    # Calculate backup size
    local backup_size=$(stat -f%z "${backup_file}" 2>/dev/null || stat -c%s "${backup_file}")
    local compression_ratio=$((100 - (backup_size * 100 / db_size)))
    
    log "Backup size: $(numfmt --to=iec-i --suffix=B ${backup_size})"
    log "Compression ratio: ${compression_ratio}%"
    
    echo "${backup_file}"
}

upload_to_s3() {
    local backup_file=$1
    local s3_path="s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_TYPE}/$(basename ${backup_file})"
    
    log "Uploading backup to S3: ${s3_path}"
    
    # Upload with progress
    aws s3 cp "${backup_file}" "${s3_path}" \
        --storage-class STANDARD_IA \
        --server-side-encryption AES256 \
        --metadata "backup-type=${BACKUP_TYPE},timestamp=${TIMESTAMP}" \
        --region "${AWS_REGION}" \
        --no-progress 2>&1 | tee -a "${LOG_FILE}"
    
    # Verify upload
    aws s3api head-object \
        --bucket "${S3_BUCKET}" \
        --key "${S3_PREFIX}/${BACKUP_TYPE}/$(basename ${backup_file})" \
        --region "${AWS_REGION}" &> /dev/null || error "Failed to verify S3 upload"
    
    log "Upload completed successfully"
}

cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Local cleanup
    find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +7 -delete 2>/dev/null || true
    
    # S3 cleanup based on backup type
    case "${BACKUP_TYPE}" in
        daily)
            local retention_days=30
            ;;
        weekly)
            local retention_days=84  # 12 weeks
            ;;
        monthly)
            local retention_days=365  # 12 months
            ;;
        *)
            local retention_days=30
            ;;
    esac
    
    # List and delete old S3 backups
    aws s3api list-objects-v2 \
        --bucket "${S3_BUCKET}" \
        --prefix "${S3_PREFIX}/${BACKUP_TYPE}/" \
        --query "Contents[?LastModified<='$(date -d "${retention_days} days ago" -Iseconds)'].Key" \
        --output text | while read -r key; do
        if [ -n "${key}" ]; then
            log "Deleting old backup: ${key}"
            aws s3 rm "s3://${S3_BUCKET}/${key}" --region "${AWS_REGION}"
        fi
    done
    
    log "Cleanup completed"
}

verify_backup() {
    local backup_file=$1
    
    log "Verifying backup integrity..."
    
    # Test decompression
    gzip -t "${backup_file}" || error "Backup file is corrupted"
    
    # Test partial restoration to verify SQL syntax
    local test_db="janua_backup_test_${TIMESTAMP}"
    
    PGPASSWORD="${DB_PASSWORD}" createdb \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        "${test_db}" 2>/dev/null || true
    
    # Extract and test first 1000 lines
    gunzip -c "${backup_file}" | head -n 1000 | \
        PGPASSWORD="${DB_PASSWORD}" psql \
            -h "${DB_HOST}" \
            -p "${DB_PORT}" \
            -U "${DB_USER}" \
            -d "${test_db}" &> /dev/null
    
    local verify_status=$?
    
    # Clean up test database
    PGPASSWORD="${DB_PASSWORD}" dropdb \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        "${test_db}" 2>/dev/null || true
    
    if [ ${verify_status} -ne 0 ]; then
        error "Backup verification failed"
    fi
    
    log "Backup verification completed successfully"
}

record_metrics() {
    local backup_file=$1
    local start_time=$2
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local backup_size=$(stat -f%z "${backup_file}" 2>/dev/null || stat -c%s "${backup_file}")
    
    # Send CloudWatch metrics
    aws cloudwatch put-metric-data \
        --namespace "Janua/Backups" \
        --metric-name "BackupDuration" \
        --value ${duration} \
        --unit Seconds \
        --dimensions BackupType="${BACKUP_TYPE}" \
        --region "${AWS_REGION}" 2>/dev/null || true
    
    aws cloudwatch put-metric-data \
        --namespace "Janua/Backups" \
        --metric-name "BackupSize" \
        --value ${backup_size} \
        --unit Bytes \
        --dimensions BackupType="${BACKUP_TYPE}" \
        --region "${AWS_REGION}" 2>/dev/null || true
    
    aws cloudwatch put-metric-data \
        --namespace "Janua/Backups" \
        --metric-name "BackupSuccess" \
        --value 1 \
        --unit Count \
        --dimensions BackupType="${BACKUP_TYPE}" \
        --region "${AWS_REGION}" 2>/dev/null || true
    
    log "Metrics recorded: Duration=${duration}s, Size=$(numfmt --to=iec-i --suffix=B ${backup_size})"
}

# Main execution
main() {
    local start_time=$(date +%s)
    
    log "=== Starting Janua PostgreSQL Backup ==="
    log "Backup Type: ${BACKUP_TYPE}"
    log "Database: ${DB_NAME}@${DB_HOST}:${DB_PORT}"
    log "S3 Bucket: s3://${S3_BUCKET}/${S3_PREFIX}"
    
    # Check prerequisites
    check_prerequisites
    
    # Create backup
    local backup_file=$(create_backup)
    
    # Verify backup
    verify_backup "${backup_file}"
    
    # Upload to S3
    upload_to_s3 "${backup_file}"
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Record metrics
    record_metrics "${backup_file}" ${start_time}
    
    # Clean up local backup
    rm -f "${backup_file}"
    
    log "=== Backup completed successfully ==="
    send_notification "SUCCESS" "Backup completed: $(basename ${backup_file})"
}

# Run main function
main "$@"