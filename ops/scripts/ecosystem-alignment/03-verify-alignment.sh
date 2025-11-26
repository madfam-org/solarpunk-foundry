#!/bin/bash
# 03-verify-alignment.sh
# Verifies all repos are properly aligned after migration
# Run from labspace root: ./scripts/ecosystem-alignment/03-verify-alignment.sh

set -e

LABSPACE_ROOT="/Users/aldoruizluna/labspace"

# Expected versions
EXPECTED_PNPM="pnpm@9.15.0"
EXPECTED_NEXTJS="15.1.6"
EXPECTED_REACT="18.3.1"
EXPECTED_TURBO="2.6.1"
EXPECTED_TAILWIND="3.4.17"
EXPECTED_ZOD="3.24.1"
EXPECTED_PRISMA="6.1.0"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Ecosystem Alignment Verification${NC}"
echo -e "${YELLOW}========================================${NC}"

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
)

total_issues=0

check_version() {
  local repo=$1
  local dep=$2
  local expected=$3
  local actual=$4

  if [ "$actual" != "null" ] && [ "$actual" != "$expected" ]; then
    echo -e "  ${RED}✗ $dep: $actual (expected $expected)${NC}"
    ((total_issues++))
  elif [ "$actual" != "null" ]; then
    echo -e "  ${GREEN}✓ $dep: $actual${NC}"
  fi
}

verify_repo() {
  local repo=$1
  local pkg_path="$LABSPACE_ROOT/$repo/package.json"

  if [ ! -f "$pkg_path" ]; then
    echo -e "${YELLOW}⚠ $repo - No package.json${NC}"
    return
  fi

  echo -e "\n${YELLOW}$repo${NC}"

  # Check packageManager
  local pm=$(node -e "const p=require('$pkg_path'); console.log(p.packageManager || 'null')" 2>/dev/null)
  if [ "$pm" != "$EXPECTED_PNPM" ]; then
    echo -e "  ${RED}✗ packageManager: $pm (expected $EXPECTED_PNPM)${NC}"
    ((total_issues++))
  else
    echo -e "  ${GREEN}✓ packageManager: $pm${NC}"
  fi

  # Check dependencies
  local next=$(node -e "const p=require('$pkg_path'); console.log(p.dependencies?.next || p.devDependencies?.next || 'null')" 2>/dev/null)
  local react=$(node -e "const p=require('$pkg_path'); console.log(p.dependencies?.react || p.devDependencies?.react || 'null')" 2>/dev/null)
  local turbo=$(node -e "const p=require('$pkg_path'); console.log(p.devDependencies?.turbo || 'null')" 2>/dev/null)
  local tailwind=$(node -e "const p=require('$pkg_path'); console.log(p.dependencies?.tailwindcss || p.devDependencies?.tailwindcss || 'null')" 2>/dev/null)
  local zod=$(node -e "const p=require('$pkg_path'); console.log(p.dependencies?.zod || p.devDependencies?.zod || 'null')" 2>/dev/null)
  local prisma=$(node -e "const p=require('$pkg_path'); console.log(p.dependencies?.prisma || p.devDependencies?.prisma || 'null')" 2>/dev/null)

  check_version "$repo" "next" "$EXPECTED_NEXTJS" "$next"
  check_version "$repo" "react" "$EXPECTED_REACT" "$react"
  check_version "$repo" "turbo" "$EXPECTED_TURBO" "$turbo"
  check_version "$repo" "tailwindcss" "$EXPECTED_TAILWIND" "$tailwind"
  check_version "$repo" "zod" "$EXPECTED_ZOD" "$zod"
  check_version "$repo" "prisma" "$EXPECTED_PRISMA" "$prisma"

  # Check for conflicting lockfiles
  local has_npm=false
  local has_yarn=false
  [ -f "$LABSPACE_ROOT/$repo/package-lock.json" ] && has_npm=true
  [ -f "$LABSPACE_ROOT/$repo/yarn.lock" ] && has_yarn=true

  if [ "$has_npm" = true ]; then
    echo -e "  ${RED}✗ Found package-lock.json (should be removed)${NC}"
    ((total_issues++))
  fi
  if [ "$has_yarn" = true ]; then
    echo -e "  ${RED}✗ Found yarn.lock (should be removed)${NC}"
    ((total_issues++))
  fi
}

for repo in "${REPOS[@]}"; do
  verify_repo "$repo"
done

echo -e "\n${YELLOW}========================================${NC}"
if [ $total_issues -eq 0 ]; then
  echo -e "${GREEN}✓ All repositories aligned!${NC}"
else
  echo -e "${RED}✗ Found $total_issues issues${NC}"
  echo -e "  Run migration scripts to fix"
fi
echo -e "${YELLOW}========================================${NC}"

# Generate summary report
echo -e "\n${YELLOW}Generating report...${NC}"

cat > "$LABSPACE_ROOT/claudedocs/ecosystem-alignment/VERIFICATION_REPORT.md" << EOF
# Ecosystem Alignment Verification Report

**Generated**: $(date +"%Y-%m-%d %H:%M:%S")
**Issues Found**: $total_issues

## Expected Versions

| Package | Version |
|---------|---------|
| pnpm | 9.15.0 |
| Next.js | $EXPECTED_NEXTJS |
| React | $EXPECTED_REACT |
| Turborepo | $EXPECTED_TURBO |
| Tailwind | $EXPECTED_TAILWIND |
| Zod | $EXPECTED_ZOD |
| Prisma | $EXPECTED_PRISMA |

## Status

$(if [ $total_issues -eq 0 ]; then echo "✅ All repositories are properly aligned"; else echo "⚠️ $total_issues issues need attention"; fi)

## Next Steps

$(if [ $total_issues -gt 0 ]; then
echo "1. Run \`./scripts/ecosystem-alignment/01-standardize-package-manager.sh\`"
echo "2. Run \`./scripts/ecosystem-alignment/02-align-framework-versions.sh\`"
echo "3. Run \`pnpm install\` in each affected repo"
echo "4. Run this verification script again"
else
echo "1. Commit changes to all repositories"
echo "2. Run CI/CD pipelines to verify builds"
echo "3. Deploy to staging environments for testing"
fi)
EOF

echo -e "${GREEN}Report saved to claudedocs/ecosystem-alignment/VERIFICATION_REPORT.md${NC}"
