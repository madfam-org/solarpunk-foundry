#!/bin/bash
# 01-standardize-package-manager.sh
# Standardizes all repos to pnpm 9.15.0
# Run from labspace root: ./scripts/ecosystem-alignment/01-standardize-package-manager.sh

set -e

LABSPACE_ROOT="/Users/aldoruizluna/labspace"
TARGET_PNPM="pnpm@9.15.0"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Package Manager Standardization Script${NC}"
echo -e "${YELLOW}Target: $TARGET_PNPM${NC}"
echo -e "${YELLOW}========================================${NC}"

# Repos with package.json that need migration
REPOS=(
  "aureo-labs"
  "avala"
  "brepflow"
  "coforma-studio"
  "dhanam"
  "digifab-quoting"
  "forgesight"
  "forj"
  "geom-core"
  "janua"
  "madfam-site"
  "primavera3d"
  "sim4d"
  "blueprint-harvester"
  "madfam-analytics"
  "madfam-ui"
  "madfam-configs"
  "madfam-packages/billing"
)

migrate_repo() {
  local repo=$1
  local repo_path="$LABSPACE_ROOT/$repo"

  if [ ! -d "$repo_path" ]; then
    echo -e "${RED}✗ $repo - Directory not found${NC}"
    return 1
  fi

  if [ ! -f "$repo_path/package.json" ]; then
    echo -e "${YELLOW}⚠ $repo - No package.json found, skipping${NC}"
    return 0
  fi

  echo -e "\n${GREEN}Processing: $repo${NC}"
  cd "$repo_path"

  # Check current state
  local has_npm_lock=false
  local has_yarn_lock=false
  local has_pnpm_lock=false

  [ -f "package-lock.json" ] && has_npm_lock=true
  [ -f "yarn.lock" ] && has_yarn_lock=true
  [ -f "pnpm-lock.yaml" ] && has_pnpm_lock=true

  echo "  Current lockfiles: npm=$has_npm_lock, yarn=$has_yarn_lock, pnpm=$has_pnpm_lock"

  # Remove conflicting lockfiles (keep pnpm if exists)
  if [ "$has_npm_lock" = true ]; then
    echo "  Removing package-lock.json..."
    rm -f package-lock.json
  fi

  if [ "$has_yarn_lock" = true ]; then
    echo "  Removing yarn.lock..."
    rm -f yarn.lock
  fi

  # Update packageManager field in package.json
  echo "  Setting packageManager to $TARGET_PNPM..."

  # Use node to update package.json properly
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.packageManager = '$TARGET_PNPM';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  "

  echo -e "${GREEN}✓ $repo - Updated${NC}"

  cd "$LABSPACE_ROOT"
}

# Main execution
echo -e "\n${YELLOW}Starting migration...${NC}\n"

success_count=0
fail_count=0

for repo in "${REPOS[@]}"; do
  if migrate_repo "$repo"; then
    ((success_count++))
  else
    ((fail_count++))
  fi
done

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${GREEN}Migration Complete${NC}"
echo -e "  Success: $success_count"
echo -e "  Failed: $fail_count"
echo -e "${YELLOW}========================================${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Run 'pnpm install' in each repo to generate lockfiles"
echo "2. Test builds: 'pnpm build'"
echo "3. Commit changes with message: 'chore: standardize to pnpm 9.15.0'"
