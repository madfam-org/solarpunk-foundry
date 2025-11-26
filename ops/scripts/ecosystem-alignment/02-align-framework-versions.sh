#!/bin/bash
# 02-align-framework-versions.sh
# Aligns Next.js, React, Turborepo, Tailwind, Zod versions across all repos
# Run from labspace root: ./scripts/ecosystem-alignment/02-align-framework-versions.sh

set -e

LABSPACE_ROOT="/Users/aldoruizluna/labspace"

# Target versions - ALIGNED ECOSYSTEM
TARGET_NEXTJS="15.1.6"
TARGET_REACT="18.3.1"
TARGET_REACT_DOM="18.3.1"
TARGET_TURBO="2.6.1"
TARGET_TAILWIND="3.4.17"
TARGET_ZOD="3.24.1"
TARGET_PRISMA="6.1.0"
TARGET_PRISMA_CLIENT="6.1.0"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Framework Version Alignment Script${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "Target versions:"
echo -e "  Next.js:    ${GREEN}$TARGET_NEXTJS${NC}"
echo -e "  React:      ${GREEN}$TARGET_REACT${NC}"
echo -e "  Turborepo:  ${GREEN}$TARGET_TURBO${NC}"
echo -e "  Tailwind:   ${GREEN}$TARGET_TAILWIND${NC}"
echo -e "  Zod:        ${GREEN}$TARGET_ZOD${NC}"
echo -e "  Prisma:     ${GREEN}$TARGET_PRISMA${NC}"
echo -e "${YELLOW}========================================${NC}"

# Repos that use these frameworks
NEXTJS_REPOS=(
  "aureo-labs"
  "avala"
  "coforma-studio"
  "dhanam"
  "forj"
  "madfam-site"
  "primavera3d"
  "sim4d"
)

TURBO_REPOS=(
  "avala"
  "brepflow"
  "coforma-studio"
  "dhanam"
  "digifab-quoting"
  "forj"
  "madfam-site"
  "primavera3d"
  "sim4d"
)

PRISMA_REPOS=(
  "avala"
  "coforma-studio"
  "forj"
  "janua"
  "madfam-site"
)

update_package_version() {
  local pkg_path=$1
  local dep_name=$2
  local target_version=$3
  local dep_type=$4  # "dependencies" or "devDependencies"

  node -e "
    const fs = require('fs');
    const pkgPath = '$pkg_path';
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    if (pkg.$dep_type && pkg.$dep_type['$dep_name']) {
      const oldVersion = pkg.$dep_type['$dep_name'];
      pkg.$dep_type['$dep_name'] = '$target_version';
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      console.log('  $dep_name: ' + oldVersion + ' → $target_version');
    }
  " 2>/dev/null || true
}

check_and_update_dep() {
  local pkg_path=$1
  local dep_name=$2
  local target_version=$3

  # Check both dependencies and devDependencies
  update_package_version "$pkg_path" "$dep_name" "$target_version" "dependencies"
  update_package_version "$pkg_path" "$dep_name" "$target_version" "devDependencies"
}

process_repo() {
  local repo=$1
  local repo_path="$LABSPACE_ROOT/$repo"
  local pkg_path="$repo_path/package.json"

  if [ ! -f "$pkg_path" ]; then
    return 0
  fi

  echo -e "\n${BLUE}Processing: $repo${NC}"

  # Update Next.js
  check_and_update_dep "$pkg_path" "next" "$TARGET_NEXTJS"

  # Update React
  check_and_update_dep "$pkg_path" "react" "$TARGET_REACT"
  check_and_update_dep "$pkg_path" "react-dom" "$TARGET_REACT_DOM"

  # Update Turborepo
  check_and_update_dep "$pkg_path" "turbo" "$TARGET_TURBO"

  # Update Tailwind
  check_and_update_dep "$pkg_path" "tailwindcss" "$TARGET_TAILWIND"

  # Update Zod
  check_and_update_dep "$pkg_path" "zod" "$TARGET_ZOD"

  # Update Prisma
  check_and_update_dep "$pkg_path" "prisma" "$TARGET_PRISMA"
  check_and_update_dep "$pkg_path" "@prisma/client" "$TARGET_PRISMA_CLIENT"

  # Check for workspace packages (apps/*, packages/*)
  for subdir in apps packages; do
    if [ -d "$repo_path/$subdir" ]; then
      for subpkg in "$repo_path/$subdir"/*/package.json; do
        if [ -f "$subpkg" ]; then
          local subname=$(dirname "$subpkg" | xargs basename)
          echo -e "  ${YELLOW}Sub-package: $subdir/$subname${NC}"
          check_and_update_dep "$subpkg" "next" "$TARGET_NEXTJS"
          check_and_update_dep "$subpkg" "react" "$TARGET_REACT"
          check_and_update_dep "$subpkg" "react-dom" "$TARGET_REACT_DOM"
          check_and_update_dep "$subpkg" "tailwindcss" "$TARGET_TAILWIND"
          check_and_update_dep "$subpkg" "zod" "$TARGET_ZOD"
          check_and_update_dep "$subpkg" "prisma" "$TARGET_PRISMA"
          check_and_update_dep "$subpkg" "@prisma/client" "$TARGET_PRISMA_CLIENT"
        fi
      done
    fi
  done

  echo -e "${GREEN}✓ $repo updated${NC}"
}

# Get all repos with package.json
ALL_REPOS=(
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
)

echo -e "\n${YELLOW}Starting version alignment...${NC}"

for repo in "${ALL_REPOS[@]}"; do
  process_repo "$repo"
done

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${GREEN}Version Alignment Complete${NC}"
echo -e "${YELLOW}========================================${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Run 'pnpm install' in each repo to update lockfiles"
echo "2. Run 'pnpm build' to verify builds pass"
echo "3. Run tests: 'pnpm test'"
echo "4. Commit with message: 'chore: align framework versions'"
echo ""
echo -e "${RED}IMPORTANT: Review Tailwind v4 → v3 migration in madfam-site${NC}"
echo "  - Update tailwind.config.js format"
echo "  - Replace @import 'tailwindcss' with classic imports"
