#!/bin/bash

# ============================================
# MADFAM DEBUG LOGS - Container Diagnostics
# ============================================
# Location: ~/labspace/solarpunk-foundry/ops/bin/debug_logs.sh
# Usage: ./debug_logs.sh [service_name]

set +e  # Don't exit on error (some containers might not exist)

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║ $1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

check_container() {
    local name=$1
    if docker ps -a --format '{{.Names}}' | grep -q "^${name}$"; then
        return 0
    else
        return 1
    fi
}

dump_logs() {
    local container=$1
    local lines=${2:-50}
    
    print_header "📋 Logs: $container (last $lines lines)"
    
    if ! check_container "$container"; then
        echo -e "${RED}✗${NC} Container '$container' not found"
        echo ""
        return 1
    fi
    
    # Check container status
    local status=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null)
    local health=$(docker inspect -f '{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no healthcheck")
    
    echo -e "Status: ${YELLOW}$status${NC}"
    echo -e "Health: ${YELLOW}$health${NC}"
    echo ""
    
    if [ "$status" = "exited" ] || [ "$status" = "dead" ]; then
        echo -e "${RED}⚠️  Container is not running!${NC}"
        echo ""
    fi
    
    # Dump logs
    echo -e "${BLUE}Last $lines log lines:${NC}"
    echo "─────────────────────────────────────────────────────────────"
    docker logs --tail $lines "$container" 2>&1
    echo "─────────────────────────────────────────────────────────────"
    echo ""
}

# ============================================
# MAIN
# ============================================

if [ -n "$1" ]; then
    # Single service specified
    case "$1" in
        janua|janua-api)
            dump_logs "janua-api" 100
            ;;
        cotiza|cotiza-api)
            dump_logs "cotiza-api" 100
            ;;
        cotiza-worker|worker)
            dump_logs "cotiza-worker" 100
            ;;
        cotiza-web|web)
            dump_logs "cotiza-web" 100
            ;;
        forgesight|forgesight-api)
            dump_logs "api" 100  # Forgesight uses generic name
            ;;
        postgres)
            dump_logs "madfam-postgres-shared" 50
            ;;
        redis)
            dump_logs "madfam-redis-shared" 50
            ;;
        minio)
            dump_logs "madfam-minio-shared" 50
            ;;
        *)
            dump_logs "$1" 50
            ;;
    esac
else
    # No argument - dump all critical services
    print_header "🔍 MADFAM Container Diagnostics Report"
    
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}Shared Infrastructure${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    
    dump_logs "madfam-postgres-shared" 30
    dump_logs "madfam-redis-shared" 30
    dump_logs "madfam-minio-shared" 30
    
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}Application Services${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    
    dump_logs "janua-api" 50
    dump_logs "cotiza-api" 50
    dump_logs "cotiza-worker" 50
    dump_logs "cotiza-web" 50
    
    # Forgesight uses generic container names
    if check_container "api"; then
        dump_logs "api" 50
    fi
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Diagnostics Complete${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Usage: ./debug_logs.sh [service_name]"
    echo "Example: ./debug_logs.sh janua"
    echo "Example: ./debug_logs.sh cotiza-worker"
fi
