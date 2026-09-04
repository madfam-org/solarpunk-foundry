#!/usr/bin/env bash
# Boundary checkpoint (2026-09-04, platform ops): public repo automation test.
# All fixtures are synthetic. Policy: docs/PUBLIC_REPO_BOUNDARY.md

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GUARD="${SCRIPT_DIR}/../check-action-pins.sh"
TMPROOT="$(mktemp -d)"
trap 'rm -rf "$TMPROOT"' EXIT

SHA1='11d5960a326750d5838078e36cf38b85af677262'
pass=0
fail=0

# case <name> <expected-rc> <workflow body...>
case_run() {
  local name="$1" expected="$2" body="$3"
  local dir="${TMPROOT}/$(printf '%s' "$name" | tr ' /' '__')"
  mkdir -p "$dir/.github/workflows"
  ( cd "$dir" && git init -q )
  printf '%s\n' "$body" > "$dir/.github/workflows/w.yml"
  ( cd "$dir" && git add -A )
  local out rc
  out=$( cd "$dir" && bash "$GUARD" "$dir" 2>&1 ); rc=$?
  if [[ "$rc" == "$expected" ]]; then
    printf 'ok   %s\n' "$name"; pass=$((pass + 1))
  else
    printf 'FAIL %s (expected rc=%s got rc=%s)\n' "$name" "$expected" "$rc"
    printf '%s\n' "$out" | sed 's/^/       | /'
    fail=$((fail + 1))
  fi
}

case_run '@main fails'                1 "jobs:
  a:
    steps:
      - uses: owner/action@main"
case_run '@v4 fails'                  1 "jobs:
  a:
    steps:
      - uses: actions/checkout@v4"
case_run '@master fails'              1 "jobs:
  a:
    steps:
      - uses: aquasecurity/trivy-action@master"
case_run 'a 40-hex SHA passes'        0 "jobs:
  a:
    steps:
      - uses: actions/checkout@${SHA1} # v4.4.0"
case_run 'a local ./ action passes'   0 "jobs:
  a:
    steps:
      - uses: ./.github/actions/doc-guard"
case_run 'a short SHA fails'          1 "jobs:
  a:
    steps:
      - uses: actions/checkout@11d5960"
case_run 'no uses: at all is UNDETERMINED' 2 "jobs:
  a:
    steps:
      - run: echo hello"

# An empty tree is UNDETERMINED, not clean.
d="${TMPROOT}/empty"; mkdir -p "$d"; ( cd "$d" && git init -q )
out=$( cd "$d" && bash "$GUARD" "$d" 2>&1 ); rc=$?
if [[ "$rc" == 2 ]]; then
  printf 'ok   an empty tree is UNDETERMINED\n'; pass=$((pass + 1))
else
  printf 'FAIL an empty tree is UNDETERMINED (got rc=%s)\n' "$rc"; fail=$((fail + 1))
fi

printf '\naction-pin tests: pass=%s fail=%s\n' "$pass" "$fail"
[[ "$fail" -eq 0 ]]
