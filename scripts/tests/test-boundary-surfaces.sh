#!/usr/bin/env bash
# Boundary checkpoint (2026-09-04, platform ops): public repo automation test.
# Fixtures are synthetic; no node identities, credentials or private topology.
# Policy: docs/PUBLIC_REPO_BOUNDARY.md

set -uo pipefail

# Behavioural tests for scripts/boundary-checkpoint-check.sh.
#
# Two properties are asserted: the widened surface list actually covers the four
# categories added on 2026-09-04, and the guard reports UNDETERMINED rather than
# CLEAN when it cannot establish a change set.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GUARD="${SCRIPT_DIR}/../boundary-checkpoint-check.sh"
TMPROOT="$(mktemp -d)"
trap 'rm -rf "$TMPROOT"' EXIT

pass=0
fail=0

new_repo() {
  local dir="${TMPROOT}/$1"
  mkdir -p "$dir"
  ( cd "$dir" && git init -q )
  printf '%s\n' "$dir"
}

# expect_surface <name> <path> <marked|markerless> <expected-rc>
expect_surface() {
  local name="$1" path="$2" marked="$3" expected="$4"
  local dir; dir="$(new_repo "fixture-$(printf '%s' "$path" | tr '/.' '__')-$marked")"
  mkdir -p "$dir/$(dirname "$path")"
  if [[ "$marked" == marked ]]; then
    printf 'Boundary checkpoint: public-safe summary only.\n' > "$dir/$path"
  else
    printf 'no marker here\n' > "$dir/$path"
  fi
  local out rc
  out=$( cd "$dir" && BOUNDARY_CHECK_FILES="$path" bash "$GUARD" "$dir" 2>&1 ); rc=$?
  if [[ "$rc" == "$expected" ]]; then
    printf 'ok   %s\n' "$name"; pass=$((pass + 1))
  else
    printf 'FAIL %s (expected rc=%s got rc=%s)\n' "$name" "$expected" "$rc"
    printf '%s\n' "$out" | sed 's/^/       | /'
    fail=$((fail + 1))
  fi
}

# The four categories added on 2026-09-04. Each is a finding when markerless.
expect_surface 'ops/* is a boundary surface'                 'ops/x.yml' markerless 1
expect_surface 'scripts/* is a boundary surface'             'scripts/publish-ui.sh' markerless 1
expect_surface 'infrastructure/**/*.sh is a boundary surface' 'infrastructure/bootstrap/01-system-bootstrap.sh' markerless 1
expect_surface 'packages/*/README.md is a boundary surface'  'packages/core/README.md' markerless 1

# Negative controls: package source is not a surface, and a non-.sh file under
# infrastructure/ is not one either.
expect_surface 'packages/*/src is not a boundary surface'    'packages/core/src/index.ts' markerless 0
expect_surface 'infrastructure/*.md is not a boundary surface' 'infrastructure/bootstrap/notes.md' markerless 0

# A marked surface passes.
expect_surface 'a marked surface passes'                     'scripts/publish-ui.sh' marked 0

# Fail closed: outside a git work tree the guard is UNDETERMINED, not clean.
out=$( cd "$TMPROOT" && mkdir -p notagit && cd notagit && bash "$GUARD" "$TMPROOT/notagit" 2>&1 ); rc=$?
if [[ "$rc" == 2 ]] && printf '%s' "$out" | grep -qF 'UNDETERMINED'; then
  printf 'ok   outside a git tree is UNDETERMINED (exit 2)\n'; pass=$((pass + 1))
else
  printf 'FAIL outside a git tree is UNDETERMINED (exit 2) (got rc=%s)\n' "$rc"
  printf '%s\n' "$out" | sed 's/^/       | /'
  fail=$((fail + 1))
fi

# READ-PROOF: the summary line names how the change set was determined.
dir="$(new_repo readproof)"
printf 'x\n' > "$dir/README.md"
out=$( cd "$dir" && BOUNDARY_CHECK_FILES="README.md" bash "$GUARD" "$dir" 2>&1 )
if printf '%s' "$out" | grep -qF 'source=explicit BOUNDARY_CHECK_FILES'; then
  printf 'ok   summary records how the change set was determined\n'; pass=$((pass + 1))
else
  printf 'FAIL summary records how the change set was determined\n'; fail=$((fail + 1))
fi

printf '\nboundary-surface tests: pass=%s fail=%s\n' "$pass" "$fail"
[[ "$fail" -eq 0 ]]
