#!/usr/bin/env bash
set -euo pipefail

# Public-repo hygiene guard for solarpunk-foundry.
# Scans authored public docs for live credential-looking material and private
# operational detail that belongs in internal-devops.

ROOT="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cd "$ROOT"

status=0

scan_files() {
  find . \
    \( -path './.git' -o -path './node_modules' -o -path './dist' -o -path './build' -o -path './coverage' \) -prune -o \
    -type f \( -name '*.md' -o -name '*.mdx' -o -name '*.txt' -o -name 'README*' -o -name 'SECURITY*' -o -name 'CONTRIBUTING*' -o -name 'CHANGELOG*' \) -print
}

check_pattern() {
  local label="$1"
  local pattern="$2"
  local matches
  matches=$(scan_files | xargs grep -nE "$pattern" 2>/dev/null || true)
  if [[ -n "$matches" ]]; then
    printf '\n[public-hygiene] %s\n' "$label" >&2
    printf '%s\n' "$matches" >&2
    status=1
  fi
}

check_pattern 'Stripe live/test secret key pattern' 'sk_(live|test)_[A-Za-z0-9_]{16,}'
check_pattern 'GitHub token pattern' 'gh[pousr]_[A-Za-z0-9_]{20,}'
check_pattern 'AWS access key pattern' 'AKIA[0-9A-Z]{16}'
check_pattern 'Private key marker' '-----BEGIN [A-Z ]*PRIVATE KEY-----'
check_pattern 'Concrete admin bootstrap password assignment' "ADMIN_BOOTSTRAP_PASSWORD='[^<][^']{6,}'"
check_pattern 'Concrete JWT secret assignment' 'JANUA_JWT_SECRET=([^<$][^[:space:]]{12,})'
check_pattern 'Private kubeconfig reference' '--kubeconfig=/|\.kube/config|client-certificate-data|client-key-data|certificate-authority-data'

if [[ "$status" -ne 0 ]]; then
  cat >&2 <<'MSG'

Public hygiene check failed. Rotate first if any value may have been live, then
replace the public reference with a non-secret placeholder or move the detail to
internal-devops.
MSG
fi

exit "$status"
