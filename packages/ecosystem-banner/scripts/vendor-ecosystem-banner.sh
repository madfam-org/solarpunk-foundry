#!/usr/bin/env bash
# Copy @madfam/ecosystem-banner source into a consumer repo (no private npm required).
#
# Usage:
#   ./scripts/vendor-ecosystem-banner.sh /path/to/repo/apps/www/src/vendor/ecosystem-banner
#
# Consumer import:
#   import { EcosystemBanner } from '@/vendor/ecosystem-banner';
#
# WHAT THIS DOES NOT COPY, and why (Wave 2.7, 2026-09-05):
#   The platform list. Since 2.7 the ticker's membership is
#   `getBannerProducts()` from `@madfam/core/products`, so the vendored source
#   carries no product facts at all. The consuming repo must depend on
#   `@madfam/core` (public npm; the ecosystem-banner package itself is the only
#   part behind npm.madfam.io). That is the whole point: ONE vendored projection
#   with ONE committed hash, in `@madfam/core`, and no second copy anywhere -
#   not in this package, not in a consumer's vendor directory.
#
#   A consumer that wants a freshness check of its own asserts
#   `PRODUCT_PROJECTION.registryVersion` / `.sourceSha256` from
#   `@madfam/core/products` against the version it expects. See
#   `packages/core/README.md` -> "Downstream contract".

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-}"

if [[ -z "$TARGET" ]]; then
  echo "Usage: $0 <target-directory>" >&2
  exit 1
fi

mkdir -p "$TARGET"
cp "$ROOT/src/platforms.ts" "$ROOT/src/ecosystem-banner.tsx" "$ROOT/src/index.ts" "$TARGET/"

# Read-proof, not a bare "done": say whether the dependency the vendored source
# needs is actually declared, and never guess. "I could not find a package.json"
# and "the dependency is missing" must not print the same line.
dep_state="undetermined"
dir="$(cd "$TARGET" && pwd)"
while [[ "$dir" != "/" ]]; do
  if [[ -f "$dir/package.json" ]]; then
    if grep -q '"@madfam/core"' "$dir/package.json"; then
      dep_state="present"
    else
      dep_state="absent"
    fi
    break
  fi
  dir="$(dirname "$dir")"
done

if [[ "$dep_state" != "present" ]]; then
  echo "WARN: the vendored source imports '@madfam/core/products'; add @madfam/core to the consumer's dependencies." >&2
fi

echo "Vendored ecosystem-banner source to $TARGET: files=3 platform_lists=0 madfam_core_dependency=$dep_state"
