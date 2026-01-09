#!/bin/bash
# Janua Deployment Script
# =======================
# Deploy Janua to Kubernetes using Kustomize
#
# Usage:
#   ./deploy.sh [environment] [action]
#
# Examples:
#   ./deploy.sh production apply    # Deploy to production
#   ./deploy.sh staging apply       # Deploy to staging
#   ./deploy.sh production diff     # Show diff before applying
#   ./deploy.sh production build    # Generate manifests only

set -euo pipefail

# Script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JANUA_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="${1:-production}"
ACTION="${2:-diff}"

# Validate environment
if [[ ! -d "$JANUA_DIR/overlays/$ENVIRONMENT" ]]; then
    echo -e "${RED}Error: Environment '$ENVIRONMENT' not found${NC}"
    echo "Available environments:"
    ls -1 "$JANUA_DIR/overlays/"
    exit 1
fi

OVERLAY_DIR="$JANUA_DIR/overlays/$ENVIRONMENT"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  Janua Deployment - $ENVIRONMENT${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}kubectl is not installed${NC}"
        exit 1
    fi

    # Check kustomize (use kubectl kustomize if standalone not available)
    if command -v kustomize &> /dev/null; then
        KUSTOMIZE_CMD="kustomize"
    else
        KUSTOMIZE_CMD="kubectl kustomize"
    fi
    echo -e "${GREEN}Using: $KUSTOMIZE_CMD${NC}"

    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        echo -e "${RED}Cannot connect to Kubernetes cluster${NC}"
        echo "Ensure KUBECONFIG is set or kubectl is configured"
        exit 1
    fi
    echo -e "${GREEN}Cluster connection: OK${NC}"

    # Check if secrets exist (for production)
    if [[ "$ENVIRONMENT" == "production" ]]; then
        NAMESPACE="janua"
        if ! kubectl get secret janua-secrets -n "$NAMESPACE" &> /dev/null; then
            echo -e "${YELLOW}Warning: janua-secrets not found in namespace '$NAMESPACE'${NC}"
            echo "Create secrets first. See: overlays/production/secrets.yaml.template"
        fi
        if ! kubectl get secret janua-jwt-keys -n "$NAMESPACE" &> /dev/null; then
            echo -e "${YELLOW}Warning: janua-jwt-keys not found in namespace '$NAMESPACE'${NC}"
            echo "Create JWT keys first. See: overlays/production/secrets.yaml.template"
        fi
    fi

    echo ""
}

# Function to build manifests
build_manifests() {
    echo -e "${YELLOW}Building manifests...${NC}"
    $KUSTOMIZE_CMD "$OVERLAY_DIR"
}

# Function to show diff
show_diff() {
    echo -e "${YELLOW}Showing diff against cluster...${NC}"
    $KUSTOMIZE_CMD "$OVERLAY_DIR" | kubectl diff -f - || true
}

# Function to apply manifests
apply_manifests() {
    echo -e "${YELLOW}Applying manifests to cluster...${NC}"

    # Build and apply
    $KUSTOMIZE_CMD "$OVERLAY_DIR" | kubectl apply -f -

    echo ""
    echo -e "${GREEN}Deployment initiated!${NC}"
    echo ""

    # Wait for rollout
    NAMESPACE="janua"
    if [[ "$ENVIRONMENT" == "staging" ]]; then
        NAMESPACE="janua-staging"
    fi

    echo -e "${YELLOW}Waiting for rollout...${NC}"
    kubectl rollout status deployment/janua-api -n "$NAMESPACE" --timeout=300s

    echo ""
    echo -e "${GREEN}Deployment complete!${NC}"
    echo ""

    # Show pod status
    echo -e "${BLUE}Pod status:${NC}"
    kubectl get pods -n "$NAMESPACE" -l app=janua-api
}

# Function to delete resources
delete_resources() {
    echo -e "${RED}Deleting Janua resources...${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [[ "$confirm" == "yes" ]]; then
        $KUSTOMIZE_CMD "$OVERLAY_DIR" | kubectl delete -f -
        echo -e "${GREEN}Resources deleted${NC}"
    else
        echo "Cancelled"
    fi
}

# Main execution
check_prerequisites

case "$ACTION" in
    build)
        build_manifests
        ;;
    diff)
        show_diff
        ;;
    apply)
        show_diff
        echo ""
        read -p "Apply these changes? (yes/no): " confirm
        if [[ "$confirm" == "yes" ]]; then
            apply_manifests
        else
            echo "Cancelled"
        fi
        ;;
    delete)
        delete_resources
        ;;
    *)
        echo "Usage: $0 [environment] [build|diff|apply|delete]"
        echo ""
        echo "Environments: production, staging"
        echo "Actions:"
        echo "  build  - Generate Kubernetes manifests"
        echo "  diff   - Show diff against current cluster state"
        echo "  apply  - Apply manifests to cluster"
        echo "  delete - Delete all resources"
        exit 1
        ;;
esac
