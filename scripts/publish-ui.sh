#!/usr/bin/env bash
#
# publish-ui.sh - Build and publish @madfam/ui to npm.madfam.io
#
# Prerequisites:
#   - NPM_MADFAM_TOKEN environment variable set
#   - npm.madfam.io accessible
#
# Usage:
#   ./scripts/publish-ui.sh           # Build and publish
#   ./scripts/publish-ui.sh --dry-run # Test without publishing
#   ./scripts/publish-ui.sh --patch   # Bump patch version and publish
#   ./scripts/publish-ui.sh --minor   # Bump minor version and publish
#   ./scripts/publish-ui.sh --major   # Bump major version and publish

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
UI_DIR="$ROOT_DIR/packages/ui"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}ℹ ${NC}$1"; }
log_success() { echo -e "${GREEN}✓ ${NC}$1"; }
log_warn() { echo -e "${YELLOW}⚠ ${NC}$1"; }
log_error() { echo -e "${RED}✗ ${NC}$1"; }

# Parse arguments
DRY_RUN=false
BUMP=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --patch|--minor|--major)
      BUMP="${1#--}"
      shift
      ;;
    *)
      log_error "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Verify registry is accessible
log_info "Checking npm.madfam.io accessibility..."
if ! curl -s --fail https://npm.madfam.io/-/ping > /dev/null 2>&1; then
  log_error "Cannot reach npm.madfam.io"
  exit 1
fi
log_success "Registry accessible"

# Verify auth token
if [[ -z "${NPM_MADFAM_TOKEN:-}" ]]; then
  # Try to read from .npmrc
  if [[ -f "$HOME/.npmrc" ]] && grep -q "npm.madfam.io/:_authToken" "$HOME/.npmrc"; then
    log_info "Using token from ~/.npmrc"
  elif [[ -f "$ROOT_DIR/.npmrc" ]] && grep -q "npm.madfam.io/:_authToken" "$ROOT_DIR/.npmrc"; then
    log_info "Using token from project .npmrc"
  else
    log_error "NPM_MADFAM_TOKEN not set and no token in .npmrc"
    log_info "Set NPM_MADFAM_TOKEN or add to ~/.npmrc:"
    log_info "  //npm.madfam.io/:_authToken=YOUR_TOKEN"
    exit 1
  fi
else
  log_success "Auth token found"
fi

# Change to UI directory
cd "$UI_DIR"

# Bump version if requested
if [[ -n "$BUMP" ]]; then
  log_info "Bumping $BUMP version..."
  if $DRY_RUN; then
    log_warn "[DRY RUN] Would bump $BUMP version"
  else
    npm version "$BUMP" --no-git-tag-version
    NEW_VERSION=$(node -p "require('./package.json').version")
    log_success "Version bumped to $NEW_VERSION"
  fi
fi

# Get current version
VERSION=$(node -p "require('./package.json').version")
log_info "Publishing @madfam/ui@$VERSION"

# Clean and build
log_info "Cleaning dist..."
rm -rf dist

log_info "Building package..."
pnpm build

if [[ ! -d "dist" ]]; then
  log_error "Build failed - dist directory not created"
  exit 1
fi
log_success "Build complete"

# Type check
log_info "Running type check..."
if pnpm typecheck; then
  log_success "Type check passed"
else
  log_error "Type check failed"
  exit 1
fi

# Publish
if $DRY_RUN; then
  log_warn "[DRY RUN] Would publish @madfam/ui@$VERSION to npm.madfam.io"
  log_info "Files that would be published:"
  npm pack --dry-run 2>/dev/null || pnpm pack --dry-run
else
  log_info "Publishing to npm.madfam.io..."

  # Use npm publish with explicit registry
  npm publish --registry https://npm.madfam.io

  log_success "Published @madfam/ui@$VERSION to npm.madfam.io"
fi

echo ""
log_success "Done!"
if ! $DRY_RUN; then
  echo ""
  log_info "To use in your project:"
  echo "  pnpm add @madfam/ui"
  echo ""
  log_info "Or link locally for development:"
  echo "  ./scripts/link-ecosystem.sh"
fi
