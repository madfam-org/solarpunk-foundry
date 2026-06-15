#!/usr/bin/env bash
# Copy @madfam/ecosystem-banner source into a consumer repo (no private npm required).
#
# Usage:
#   ./scripts/vendor-ecosystem-banner.sh /path/to/repo/apps/www/src/vendor/ecosystem-banner
#
# Consumer import:
#   import { EcosystemBanner } from '@/vendor/ecosystem-banner';

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-}"

if [[ -z "$TARGET" ]]; then
  echo "Usage: $0 <target-directory>" >&2
  exit 1
fi

mkdir -p "$TARGET"
cp "$ROOT/src/platforms.ts" "$ROOT/src/ecosystem-banner.tsx" "$ROOT/src/index.ts" "$TARGET/"
echo "Vendored ecosystem-banner source to $TARGET"
