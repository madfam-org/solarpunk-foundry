#!/bin/bash
# ============================================
# VERDACCIO REGISTRY BACKUP
# ============================================
# Backs up npm.madfam.io (Verdaccio) storage to Cloudflare R2
#
# Usage: ./backup-registry.sh [--dry-run]
#
# Prerequisites:
#   - kubectl configured with access to npm namespace
#   - rclone configured with 'r2' remote (Cloudflare R2)
#   - Verdaccio running in kubernetes
#
# Environment Variables:
#   BACKUP_BUCKET: R2 bucket name (default: madfam-backups)
#   BACKUP_PREFIX: Prefix within bucket (default: verdaccio)
#   RETENTION_DAYS: Days to keep backups (default: 30)

set -euo pipefail

# ============================================
# COLOR DEFINITIONS
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}→${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error()   { echo -e "${RED}✗${NC} $1"; }

# ============================================
# CONFIGURATION
# ============================================
BACKUP_BUCKET="${BACKUP_BUCKET:-madfam-backups}"
BACKUP_PREFIX="${BACKUP_PREFIX:-verdaccio}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DATE=$(date +%Y%m%d-%H%M%S)
DRY_RUN=false

# ============================================
# ARGUMENT PARSING
# ============================================
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--dry-run]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Show what would be done without executing"
            echo "  --help       Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  BACKUP_BUCKET     R2 bucket name (default: madfam-backups)"
            echo "  BACKUP_PREFIX     Prefix within bucket (default: verdaccio)"
            echo "  RETENTION_DAYS    Days to keep backups (default: 30)"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# ============================================
# PREREQUISITE CHECKS
# ============================================
check_prerequisites() {
    local missing=false

    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl not found"
        missing=true
    fi

    if ! command -v rclone &> /dev/null; then
        log_error "rclone not found. Install: brew install rclone"
        missing=true
    fi

    if ! rclone listremotes | grep -q "r2:"; then
        log_warning "rclone 'r2' remote not configured"
        echo ""
        echo "Configure with:"
        echo "  rclone config create r2 s3 \\"
        echo "    provider=Cloudflare \\"
        echo "    access_key_id=YOUR_ACCESS_KEY \\"
        echo "    secret_access_key=YOUR_SECRET_KEY \\"
        echo "    endpoint=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com"
        missing=true
    fi

    if $missing; then
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# ============================================
# GET VERDACCIO POD
# ============================================
get_verdaccio_pod() {
    local pod

    # Try different namespace possibilities
    for ns in npm verdaccio registry; do
        pod=$(kubectl get pods -n "$ns" -l app=verdaccio -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)
        if [[ -n "$pod" ]]; then
            echo "$ns:$pod"
            return 0
        fi
    done

    # Try without label
    pod=$(kubectl get pods -A --field-selector=status.phase=Running -o jsonpath='{range .items[*]}{.metadata.namespace}:{.metadata.name}{"\n"}{end}' 2>/dev/null | grep verdaccio | head -1 || true)
    if [[ -n "$pod" ]]; then
        echo "$pod"
        return 0
    fi

    log_error "Verdaccio pod not found in any namespace"
    log_info "Ensure Verdaccio is running: kubectl get pods -A | grep verdaccio"
    return 1
}

# ============================================
# BACKUP FUNCTION
# ============================================
perform_backup() {
    local ns_pod
    local namespace
    local pod
    local backup_path

    log_info "Starting Verdaccio backup..."

    # Get pod info
    ns_pod=$(get_verdaccio_pod)
    namespace="${ns_pod%%:*}"
    pod="${ns_pod#*:}"
    backup_path="${BACKUP_PREFIX}/${DATE}.tar.gz"

    log_info "Found Verdaccio: namespace=$namespace, pod=$pod"
    log_info "Backup destination: r2:${BACKUP_BUCKET}/${backup_path}"

    if $DRY_RUN; then
        log_warning "[DRY RUN] Would execute:"
        echo "  kubectl exec -n $namespace $pod -- tar czf - /verdaccio/storage | \\"
        echo "    rclone rcat 'r2:${BACKUP_BUCKET}/${backup_path}'"
        return 0
    fi

    # Create tarball and stream to R2
    log_info "Creating backup (this may take a few minutes)..."
    kubectl exec -n "$namespace" "$pod" -- tar czf - /verdaccio/storage 2>/dev/null | \
        rclone rcat "r2:${BACKUP_BUCKET}/${backup_path}"

    log_success "Backup complete: ${backup_path}"

    # Verify backup
    local size
    size=$(rclone size "r2:${BACKUP_BUCKET}/${backup_path}" --json 2>/dev/null | grep -o '"bytes":[0-9]*' | cut -d: -f2)
    if [[ -n "$size" && "$size" -gt 0 ]]; then
        log_success "Backup verified: $(numfmt --to=iec-i --suffix=B "$size" 2>/dev/null || echo "${size} bytes")"
    else
        log_warning "Could not verify backup size"
    fi
}

# ============================================
# CLEANUP OLD BACKUPS
# ============================================
cleanup_old_backups() {
    log_info "Cleaning up backups older than ${RETENTION_DAYS} days..."

    if $DRY_RUN; then
        log_warning "[DRY RUN] Would execute:"
        echo "  rclone delete 'r2:${BACKUP_BUCKET}/${BACKUP_PREFIX}' --min-age ${RETENTION_DAYS}d"
        return 0
    fi

    local deleted
    deleted=$(rclone delete "r2:${BACKUP_BUCKET}/${BACKUP_PREFIX}" --min-age "${RETENTION_DAYS}d" -v 2>&1 | grep -c "Deleted:" || echo "0")

    if [[ "$deleted" -gt 0 ]]; then
        log_success "Cleaned up $deleted old backup(s)"
    else
        log_info "No old backups to clean up"
    fi
}

# ============================================
# LIST EXISTING BACKUPS
# ============================================
list_backups() {
    log_info "Existing backups:"
    rclone ls "r2:${BACKUP_BUCKET}/${BACKUP_PREFIX}/" 2>/dev/null | tail -10 || echo "  (none found)"
}

# ============================================
# MAIN
# ============================================
main() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║           VERDACCIO REGISTRY BACKUP                      ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""

    if $DRY_RUN; then
        log_warning "DRY RUN MODE - No changes will be made"
        echo ""
    fi

    check_prerequisites
    perform_backup
    cleanup_old_backups
    list_backups

    echo ""
    log_success "Backup process complete!"
}

main "$@"
