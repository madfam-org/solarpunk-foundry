#!/bin/bash

# ============================================
# MADFAM ECOSYSTEM - Unified Control Script
# ============================================
# Solarpunk Foundry - Governance & Operations Core
# Location: ~/labspace/solarpunk-foundry/ops/bin/madfam.sh
# Usage: ./madfam.sh [start|stop|restart|logs|status|full|help]
#
# This is the SINGLE SOURCE OF TRUTH for MADFAM ecosystem orchestration.
# Symlinked to ~/labspace/madfam for convenience.

set -e

# ============================================
# PATH RESOLUTION (Symlink Safe)
# ============================================
SOURCE=${BASH_SOURCE[0]}
while [ -L "$SOURCE" ]; do
  DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
  SOURCE=$(readlink "$SOURCE")
  [[ $SOURCE != /* ]] && SOURCE=$DIR/$SOURCE
done
SCRIPT_DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )

FOUNDRY_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LABSPACE_ROOT="$(cd "$FOUNDRY_ROOT/.." && pwd)"

# Infrastructure paths
SHARED_COMPOSE="$FOUNDRY_ROOT/ops/local/docker-compose.shared.yml"

# ============================================
# SERVICE DEFINITIONS
# ============================================
# Core services (start with 'start' command)
CORE_SERVICES=(
    "janua:deployment/docker-compose.yml"
    "forgesight:docker-compose.yml"
    "digifab-quoting:docker-compose.yml"
    "madfam-site:docker-compose.yml"
)

# Extended services (included with 'full' command)
PORTFOLIO_SERVICES=(
    "aureo-labs:docker-compose.yml"
    "primavera3d:docker-compose.yml"
)

PLATFORM_SERVICES=(
    "dhanam:docker-compose.yml"
    "fortuna:docker-compose.yml"
    "sim4d:docker-compose.yml"
)

UTILITY_SERVICES=(
    "electrochem-sim:docker-compose.yml"
)

# ============================================
# COLOR DEFINITIONS
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Track started services
declare -a STARTED_SERVICES

# ============================================
# UTILITY FUNCTIONS
# ============================================

print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    MADFAM ECOSYSTEM                          ║"
    echo "║              Solarpunk Foundry Operations                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

log_info()    { echo -e "${BLUE}→${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error()   { echo -e "${RED}✗${NC} $1"; }

log_phase() {
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  $1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    log_success "Docker is running"
}

create_network() {
    if ! docker network inspect madfam-shared-network &> /dev/null; then
        log_info "Creating shared network..."
        docker network create madfam-shared-network
        log_success "Network 'madfam-shared-network' created"
    else
        log_success "Network 'madfam-shared-network' exists"
    fi
}

wait_for_health() {
    local url=$1
    local name=$2
    local max_attempts=${3:-30}
    local attempt=1

    log_info "Waiting for $name to be healthy..."

    while [ $attempt -le $max_attempts ]; do
        if curl -sf -m 3 "$url" > /dev/null 2>&1; then
            log_success "$name is healthy"
            return 0
        fi
        echo -ne "\r${YELLOW}⏳${NC} Attempt $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done

    echo ""
    log_warning "$name health check timed out (may still be starting)"
    return 1
}

# ============================================
# SERVICE START FUNCTION
# ============================================
start_service() {
    local service_spec=$1
    local service_name="${service_spec%%:*}"
    local compose_path="${service_spec#*:}"

    local full_path="$LABSPACE_ROOT/$service_name"

    if [ ! -d "$full_path" ]; then
        log_warning "Directory not found: $service_name"
        return 1
    fi

    local compose_file="$full_path/$compose_path"
    if [ ! -f "$compose_file" ]; then
        log_warning "Compose file not found: $service_name/$compose_path"
        return 1
    fi

    log_info "Starting $service_name..."
    cd "$(dirname "$compose_file")"

    if docker compose -f "$(basename "$compose_file")" up -d 2>/dev/null; then
        log_success "$service_name started"
        STARTED_SERVICES+=("$service_name")
        return 0
    else
        log_error "Failed to start $service_name"
        return 1
    fi
}

stop_service() {
    local service_spec=$1
    local service_name="${service_spec%%:*}"
    local compose_path="${service_spec#*:}"

    local compose_file="$LABSPACE_ROOT/$service_name/$compose_path"

    if [ -f "$compose_file" ]; then
        cd "$(dirname "$compose_file")"
        docker compose -f "$(basename "$compose_file")" down --remove-orphans 2>/dev/null || true
    fi
}

# ============================================
# INFRASTRUCTURE
# ============================================
start_shared_infrastructure() {
    log_phase "PHASE 1: Shared Infrastructure (PostgreSQL, Redis, MinIO)"

    if [ ! -f "$SHARED_COMPOSE" ]; then
        log_error "Shared compose file not found: $SHARED_COMPOSE"
        exit 1
    fi

    docker compose -f "$SHARED_COMPOSE" up -d

    # Wait for PostgreSQL
    log_info "Waiting for PostgreSQL..."
    local attempt=1
    while [ $attempt -le 30 ]; do
        if docker exec madfam-postgres-shared pg_isready -U madfam >/dev/null 2>&1; then
            log_success "PostgreSQL is ready"
            break
        fi
        echo -ne "\r${YELLOW}⏳${NC} Attempt $attempt/30..."
        sleep 2
        ((attempt++))
    done

    # Wait for Redis
    log_info "Waiting for Redis..."
    attempt=1
    while [ $attempt -le 15 ]; do
        if docker exec madfam-redis-shared redis-cli -a redis_dev_password ping >/dev/null 2>&1; then
            log_success "Redis is ready"
            break
        fi
        sleep 1
        ((attempt++))
    done

    STARTED_SERVICES+=("shared-infrastructure")
}

# ============================================
# SERVICE GROUPS
# ============================================
start_core_services() {
    log_phase "PHASE 2: Core Services (Auth, Revenue, Site)"

    for service in "${CORE_SERVICES[@]}"; do
        start_service "$service" || true
    done

    # Health checks
    wait_for_health "http://localhost:8001/health" "Janua API" 45 || true
    wait_for_health "http://localhost:8200/health" "Forgesight API" 30 || true
    wait_for_health "http://localhost:3000/api/health" "MADFAM Site" 45 || true
}

start_portfolio_services() {
    log_phase "PHASE 3: Portfolio Sites"

    for service in "${PORTFOLIO_SERVICES[@]}"; do
        start_service "$service" || true
    done
}

start_platform_services() {
    log_phase "PHASE 4: Platform Applications"

    for service in "${PLATFORM_SERVICES[@]}"; do
        start_service "$service" || true
    done
}

start_utility_services() {
    log_phase "PHASE 5: Utility Services"

    for service in "${UTILITY_SERVICES[@]}"; do
        start_service "$service" || true
    done
}

# ============================================
# PRINT SUMMARY
# ============================================
print_summary() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}                    STARTUP SUMMARY                            ${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${GREEN}Started Services:${NC}"
    for service in "${STARTED_SERVICES[@]}"; do
        echo "  ✅ $service"
    done
    echo ""
    echo -e "${BLUE}Service URLs:${NC}"
    echo -e "${MAGENTA}Core Services${NC}"
    echo "  🌐 MADFAM Site:        http://localhost:3000"
    echo "  🔐 Janua Auth:         http://localhost:8001"
    echo "  📊 Forgesight:         http://localhost:8200 (API)"
    echo "  🛠️  Digifab Quoting:    http://localhost:8300 (API)"
    echo ""
    echo -e "${MAGENTA}Platform Apps${NC}"
    echo "  💵 Dhanam:             http://localhost:8500 (API) / http://localhost:3030 (Web)"
    echo "  📈 Fortuna:            http://localhost:8600"
    echo "  🔧 BrepFlow Studio:    http://localhost:5173"
    echo "  🔧 BrepFlow Marketing: http://localhost:3040"
    echo ""
    echo -e "${MAGENTA}Portfolio Sites${NC}"
    echo "  🎨 Aureo Labs:         http://localhost:3010"
    echo "  🌱 Primavera3D:        http://localhost:3020"
    echo ""
    echo -e "${MAGENTA}Utilities${NC}"
    echo "  🧪 Galvana:            http://localhost:8700 (API) / http://localhost:3050 (Web)"
    echo ""
    echo -e "${MAGENTA}Infrastructure${NC}"
    echo "  🐘 PostgreSQL:         localhost:5432"
    echo "  📦 Redis:              localhost:6379"
    echo "  💾 MinIO:              http://localhost:9000 (API) / http://localhost:9001 (Console)"
    echo ""
    echo -e "${GREEN}✨ MADFAM Ecosystem is ready!${NC}"
}

# ============================================
# COMMANDS
# ============================================
cmd_start() {
    print_banner
    log_info "Starting MADFAM Core Services..."
    log_info "Foundry: $FOUNDRY_ROOT"
    echo ""

    check_docker
    create_network
    start_shared_infrastructure
    start_core_services
    print_summary
}

cmd_full() {
    print_banner
    log_info "Starting FULL MADFAM Ecosystem..."
    log_info "Foundry: $FOUNDRY_ROOT"
    echo ""

    check_docker
    create_network
    start_shared_infrastructure
    start_core_services
    start_portfolio_services
    start_platform_services
    start_utility_services
    print_summary
}

cmd_stop() {
    print_banner
    local clean_volumes=false
    [[ "${1:-}" == "--clean" ]] && clean_volumes=true

    log_info "Stopping MADFAM ecosystem..."
    echo ""

    # Stop in reverse order
    for service in "${UTILITY_SERVICES[@]}"; do stop_service "$service"; done
    for service in "${PLATFORM_SERVICES[@]}"; do stop_service "$service"; done
    for service in "${PORTFOLIO_SERVICES[@]}"; do stop_service "$service"; done
    for service in "${CORE_SERVICES[@]}"; do stop_service "$service"; done

    log_info "Stopping shared infrastructure..."
    if $clean_volumes; then
        docker compose -f "$SHARED_COMPOSE" down --remove-orphans -v 2>/dev/null || true
        log_success "Stopped and removed volumes"
    else
        docker compose -f "$SHARED_COMPOSE" down --remove-orphans 2>/dev/null || true
        log_success "Stopped (volumes preserved)"
    fi

    echo ""
    log_success "All services stopped"
    $clean_volumes || echo -e "\nTo remove volumes: ./madfam.sh stop --clean"
}

cmd_restart() {
    cmd_stop "$@"
    sleep 3
    cmd_start
}

cmd_status() {
    print_banner
    echo -e "${BLUE}Running MADFAM Containers:${NC}"
    echo ""
    docker ps --filter "network=madfam-shared-network" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || \
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    echo ""
    echo -e "${CYAN}Health Checks:${NC}"

    check_health() {
        local name=$1 url=$2
        printf "  %-20s " "$name:"
        if curl -sf -m 2 "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}● ONLINE${NC}"
        else
            echo -e "${RED}● OFFLINE${NC}"
        fi
    }

    # Infrastructure
    printf "  %-20s " "PostgreSQL:"
    docker exec madfam-postgres-shared pg_isready -U madfam >/dev/null 2>&1 && echo -e "${GREEN}● ONLINE${NC}" || echo -e "${RED}● OFFLINE${NC}"

    printf "  %-20s " "Redis:"
    docker exec madfam-redis-shared redis-cli -a redis_dev_password ping >/dev/null 2>&1 && echo -e "${GREEN}● ONLINE${NC}" || echo -e "${RED}● OFFLINE${NC}"

    # Services
    check_health "Janua API" "http://localhost:8001/health"
    check_health "Forgesight API" "http://localhost:8200/health"
    check_health "MADFAM Site" "http://localhost:3000/api/health"
    check_health "Digifab API" "http://localhost:8300/health"
}

cmd_logs() {
    local service="${1:-}"

    if [ -z "$service" ]; then
        echo "Usage: ./madfam.sh logs <service>"
        echo ""
        echo "Available services:"
        echo "  shared      - Shared infrastructure (postgres, redis, minio)"
        echo "  janua       - Janua auth service"
        echo "  forgesight  - Forgesight API"
        echo "  digifab     - Digifab Quoting"
        echo "  madfam-site - MADFAM business site"
        echo "  dhanam      - Dhanam finance"
        echo "  fortuna     - Fortuna analytics"
        echo "  sim4d       - BrepFlow CAD"
        echo "  galvana     - Electrochem simulation"
        return
    fi

    case "$service" in
        shared)
            docker compose -f "$SHARED_COMPOSE" logs -f --tail=100
            ;;
        janua)
            cd "$LABSPACE_ROOT/janua/deployment" && docker compose logs -f --tail=100
            ;;
        forgesight)
            cd "$LABSPACE_ROOT/forgesight" && docker compose logs -f --tail=100
            ;;
        digifab)
            cd "$LABSPACE_ROOT/digifab-quoting" && docker compose logs -f --tail=100
            ;;
        madfam-site)
            cd "$LABSPACE_ROOT/madfam-site" && docker compose logs -f --tail=100
            ;;
        dhanam)
            cd "$LABSPACE_ROOT/dhanam" && docker compose logs -f --tail=100
            ;;
        fortuna)
            cd "$LABSPACE_ROOT/fortuna" && docker compose logs -f --tail=100
            ;;
        sim4d|brepflow)
            cd "$LABSPACE_ROOT/sim4d" && docker compose logs -f --tail=100
            ;;
        galvana|electrochem)
            cd "$LABSPACE_ROOT/electrochem-sim" && docker compose logs -f --tail=100
            ;;
        *)
            log_error "Unknown service: $service"
            cmd_logs
            ;;
    esac
}

cmd_help() {
    print_banner
    echo -e "${CYAN}Usage:${NC}"
    echo "  ./madfam.sh [COMMAND] [OPTIONS]"
    echo ""
    echo -e "${CYAN}Commands:${NC}"
    echo "  start                Start core services (infra + auth + revenue + site)"
    echo "  full                 Start ALL services (core + portfolio + platform + utilities)"
    echo "  stop                 Stop all services (preserve volumes)"
    echo "  stop --clean         Stop all services and remove volumes"
    echo "  restart              Restart all services"
    echo "  status               Show service status and health"
    echo "  logs <service>       Follow logs for a service"
    echo "  help                 Show this help"
    echo ""
    echo -e "${CYAN}Services Started by 'start':${NC}"
    echo "  - Shared Infrastructure (PostgreSQL, Redis, MinIO)"
    echo "  - Janua (Auth)"
    echo "  - Forgesight (Vendor Intelligence)"
    echo "  - Digifab Quoting"
    echo "  - MADFAM Site"
    echo ""
    echo -e "${CYAN}Additional Services with 'full':${NC}"
    echo "  - Aureo Labs, Primavera3D (Portfolio)"
    echo "  - Dhanam, Fortuna, BrepFlow (Platform)"
    echo "  - Galvana (Utilities)"
    echo ""
    echo -e "${CYAN}Documentation:${NC}"
    echo "  Port Allocation:    $FOUNDRY_ROOT/docs/PORT_ALLOCATION.md"
    echo "  Dogfooding Guide:   $FOUNDRY_ROOT/docs/DOGFOODING_GUIDE.md"
    echo ""
}

# ============================================
# MAIN
# ============================================
main() {
    local command="${1:-help}"

    case "$command" in
        start)      cmd_start ;;
        full)       cmd_full ;;
        stop)       cmd_stop "$2" ;;
        restart)    cmd_restart "$2" ;;
        status)     cmd_status ;;
        logs)       cmd_logs "$2" ;;
        help|--help|-h) cmd_help ;;
        *)
            log_error "Unknown command: $command"
            cmd_help
            exit 1
            ;;
    esac
}

main "$@"
