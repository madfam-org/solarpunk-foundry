#!/usr/bin/env bash
#
# link-ecosystem.sh - Link @madfam/ui for local development across ecosystem
#
# This script links the local @madfam/ui package to all MADFAM ecosystem projects,
# enabling real-time development without publishing.
#
# Usage:
#   ./scripts/link-ecosystem.sh           # Link to all detected projects
#   ./scripts/link-ecosystem.sh --unlink  # Remove all links
#   ./scripts/link-ecosystem.sh janua     # Link to specific project only

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
UI_DIR="$ROOT_DIR/packages/ui"
LABSPACE="${LABSPACE:-$HOME/labspace}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ ${NC}$1"; }
log_success() { echo -e "${GREEN}✓ ${NC}$1"; }
log_warn() { echo -e "${YELLOW}⚠ ${NC}$1"; }
log_error() { echo -e "${RED}✗ ${NC}$1"; }
log_header() { echo -e "\n${CYAN}═══ $1 ═══${NC}"; }

# MADFAM ecosystem projects that may use @madfam/ui
ECOSYSTEM_PROJECTS=(
  "janua"
  "enclii"
  "dhanam"
  "forgesight"
  "fortuna"
  "cotiza"
  "avala"
  "forj"
  "coforma"
  "sim4d"
  "galvana"
  "bloomscroll"
  "compendium"
  "blueprint"
)

# Parse arguments
UNLINK=false
SPECIFIC_PROJECT=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --unlink)
      UNLINK=true
      shift
      ;;
    -*)
      log_error "Unknown option: $1"
      exit 1
      ;;
    *)
      SPECIFIC_PROJECT="$1"
      shift
      ;;
  esac
done

# Ensure UI package is built
log_header "Preparing @madfam/ui"

cd "$UI_DIR"

if [[ ! -d "dist" ]]; then
  log_info "Building @madfam/ui..."
  pnpm build
  log_success "Build complete"
else
  log_info "Using existing dist (run 'pnpm build' to rebuild)"
fi

# Get version
VERSION=$(node -p "require('./package.json').version")
log_info "@madfam/ui@$VERSION"

# Link the package globally (or prepare for workspace linking)
if $UNLINK; then
  log_header "Unlinking @madfam/ui"
else
  log_header "Linking @madfam/ui"
fi

# Detect package manager and link appropriately
link_to_project() {
  local project_dir="$1"
  local project_name="$(basename "$project_dir")"

  if [[ ! -d "$project_dir" ]]; then
    return 1
  fi

  # Check if project uses @madfam/ui
  local pkg_json="$project_dir/package.json"
  local has_workspace=false

  # Check for pnpm workspace
  if [[ -f "$project_dir/pnpm-workspace.yaml" ]]; then
    has_workspace=true
  fi

  cd "$project_dir"

  if $UNLINK; then
    # Unlink
    if [[ -f "pnpm-lock.yaml" ]]; then
      log_info "Unlinking from $project_name (pnpm)..."
      pnpm unlink @madfam/ui 2>/dev/null || true
    elif [[ -f "package-lock.json" ]]; then
      log_info "Unlinking from $project_name (npm)..."
      npm unlink @madfam/ui 2>/dev/null || true
    elif [[ -f "yarn.lock" ]]; then
      log_info "Unlinking from $project_name (yarn)..."
      yarn unlink @madfam/ui 2>/dev/null || true
    fi
    log_success "Unlinked from $project_name"
  else
    # Link
    if [[ -f "pnpm-lock.yaml" ]]; then
      log_info "Linking to $project_name (pnpm)..."
      pnpm link "$UI_DIR" 2>/dev/null || pnpm add "link:$UI_DIR"
    elif [[ -f "package-lock.json" ]]; then
      log_info "Linking to $project_name (npm)..."
      npm link "$UI_DIR"
    elif [[ -f "yarn.lock" ]]; then
      log_info "Linking to $project_name (yarn)..."
      yarn link @madfam/ui 2>/dev/null || yarn add "link:$UI_DIR"
    else
      log_warn "$project_name: No lockfile detected, skipping"
      return 1
    fi
    log_success "Linked to $project_name"
  fi

  return 0
}

# Process projects
log_header "Processing Ecosystem Projects"

linked_count=0
skipped_count=0

if [[ -n "$SPECIFIC_PROJECT" ]]; then
  # Link to specific project only
  project_dir="$LABSPACE/$SPECIFIC_PROJECT"
  if link_to_project "$project_dir"; then
    ((linked_count++))
  else
    log_error "Project not found: $project_dir"
    exit 1
  fi
else
  # Link to all ecosystem projects
  for project in "${ECOSYSTEM_PROJECTS[@]}"; do
    project_dir="$LABSPACE/$project"

    if [[ -d "$project_dir" ]]; then
      if link_to_project "$project_dir"; then
        ((linked_count++))
      fi
    else
      ((skipped_count++))
    fi
  done
fi

# Summary
log_header "Summary"

if $UNLINK; then
  log_success "Unlinked from $linked_count projects"
else
  log_success "Linked to $linked_count projects"
fi

if [[ $skipped_count -gt 0 ]]; then
  log_info "Skipped $skipped_count projects (not found in $LABSPACE)"
fi

echo ""
if ! $UNLINK; then
  log_info "Changes to @madfam/ui will be reflected immediately."
  log_info "Run 'pnpm dev' in packages/ui for watch mode."
  echo ""
  log_info "To unlink: ./scripts/link-ecosystem.sh --unlink"
fi
