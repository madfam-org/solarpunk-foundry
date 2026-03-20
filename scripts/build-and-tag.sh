#!/bin/bash
# build-and-tag.sh - Build Docker images with git SHA versioning
# Usage: ./build-and-tag.sh <service> [--push]
#
# This script builds Docker images and tags them with:
#   - latest (for convenience)
#   - git short SHA (for traceability)
#   - timestamp (for ordering)
#
# Examples:
#   ./build-and-tag.sh janua-api
#   ./build-and-tag.sh janua-api --push
#   ./build-and-tag.sh all --push

set -euo pipefail

# Configuration
REGISTRY="${REGISTRY:-localhost:5000}"
JANUA_DIR="${JANUA_DIR:-/opt/solarpunk/janua}"
ENCLII_DIR="${ENCLII_DIR:-/opt/solarpunk/enclii}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Global variables for git info
GIT_BRANCH=""

# Get git info for a directory
get_git_info() {
    local dir=$1
    cd "$dir"
    GIT_SHA=$(git rev-parse --short HEAD)
    GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    GIT_DIRTY=$(git status --porcelain | wc -l | tr -d ' ')
    if [ "$GIT_DIRTY" != "0" ]; then
        GIT_SHA="${GIT_SHA}-dirty"
    fi
    echo "$GIT_SHA"
}

# Build and tag a single service
build_service() {
    local service=$1
    local push=${2:-false}

    case $service in
        janua-api)
            DIR="$JANUA_DIR"
            DOCKERFILE="apps/api/Dockerfile"
            CONTEXT="apps/api"
            ;;
        janua-admin)
            DIR="$JANUA_DIR"
            DOCKERFILE="apps/admin/Dockerfile"
            CONTEXT="apps/admin"
            ;;
        janua-dashboard)
            DIR="$JANUA_DIR"
            DOCKERFILE="apps/dashboard/Dockerfile"
            CONTEXT="apps/dashboard"
            ;;
        janua-docs)
            DIR="$JANUA_DIR"
            DOCKERFILE="apps/docs/Dockerfile"
            CONTEXT="apps/docs"
            ;;
        janua-website)
            DIR="$JANUA_DIR"
            DOCKERFILE="apps/landing/Dockerfile"
            CONTEXT="apps/landing"
            ;;
        switchyard-api)
            DIR="$ENCLII_DIR"
            DOCKERFILE="apps/switchyard-api/Dockerfile"
            CONTEXT="apps/switchyard-api"
            ;;
        switchyard-ui)
            DIR="$ENCLII_DIR"
            DOCKERFILE="apps/switchyard-ui/Dockerfile"
            CONTEXT="apps/switchyard-ui"
            ;;
        enclii-landing)
            DIR="$ENCLII_DIR"
            DOCKERFILE="apps/landing/Dockerfile"
            CONTEXT="apps/landing"
            ;;
        *)
            log_error "Unknown service: $service"
            return 1
            ;;
    esac

    # Get git SHA
    SHA=$(get_git_info "$DIR")
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)

    log_info "Building $service (SHA: $SHA)"

    cd "$DIR"

    # Check if Dockerfile exists
    if [ ! -f "$DOCKERFILE" ]; then
        log_error "Dockerfile not found: $DOCKERFILE"
        return 1
    fi

    # Build with multiple tags
    docker build \
        -f "$DOCKERFILE" \
        -t "${service}:latest" \
        -t "${service}:${SHA}" \
        -t "${service}:${TIMESTAMP}" \
        -t "${REGISTRY}/${service}:latest" \
        -t "${REGISTRY}/${service}:${SHA}" \
        -t "${REGISTRY}/${service}:${TIMESTAMP}" \
        --label "git.sha=${SHA}" \
        --label "git.branch=${GIT_BRANCH}" \
        --label "build.timestamp=${TIMESTAMP}" \
        "$CONTEXT"

    log_info "Built: ${service}:${SHA}"

    # Push if requested
    if [ "$push" = true ]; then
        log_info "Pushing to registry..."
        docker push "${REGISTRY}/${service}:latest"
        docker push "${REGISTRY}/${service}:${SHA}"
        docker push "${REGISTRY}/${service}:${TIMESTAMP}"
        log_info "Pushed: ${REGISTRY}/${service}:${SHA}"
    fi

    # Output deployment command
    echo ""
    log_info "To deploy with this version:"
    echo "  kubectl set image deployment/${service} ${service}=${REGISTRY}/${service}:${SHA} -n janua"
    echo ""
}

# Build all services
build_all() {
    local push=${1:-false}

    SERVICES=(
        "janua-api"
        "janua-admin"
        "janua-dashboard"
        "janua-docs"
        "janua-website"
        "switchyard-api"
        "switchyard-ui"
        "enclii-landing"
    )

    for service in "${SERVICES[@]}"; do
        log_info "=== Building $service ==="
        build_service "$service" "$push" || log_warn "Failed to build $service, continuing..."
    done
}

# Main
SERVICE="${1:-}"
PUSH=false

if [ "$#" -ge 2 ] && [ "$2" = "--push" ]; then
    PUSH=true
fi

if [ -z "$SERVICE" ]; then
    echo "Usage: $0 <service|all> [--push]"
    echo ""
    echo "Services:"
    echo "  janua-api       - Janua FastAPI backend"
    echo "  janua-admin     - Janua admin dashboard"
    echo "  janua-dashboard - Janua user dashboard"
    echo "  janua-docs      - Janua documentation"
    echo "  janua-website   - Janua marketing site"
    echo "  switchyard-api  - Enclii control plane API"
    echo "  switchyard-ui   - Enclii web dashboard"
    echo "  enclii-landing  - Enclii landing page"
    echo "  all             - Build all services"
    echo ""
    echo "Options:"
    echo "  --push          Push to registry after build"
    exit 1
fi

if [ "$SERVICE" = "all" ]; then
    build_all $PUSH
else
    build_service "$SERVICE" $PUSH
fi

log_info "Done!"
