#!/usr/bin/env bash
set -uo pipefail

# Behavioural tests for scripts/public-hygiene-check.sh.
#
# Each case builds a throwaway git repository, plants one shape, and asserts the
# guard's exit code and output. A guard nobody has ever seen fail is not a guard;
# these cases are the proof that it fails on the class it claims to cover.
#
# Every line below that plants a secret-shaped literal carries the
# `hygiene-self-reference` marker, so the guard's own scan of this repository
# skips the plant while the temporary file it WRITES carries no marker and is
# therefore scanned normally.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GUARD="${SCRIPT_DIR}/../public-hygiene-check.sh"
TMPROOT="$(mktemp -d)"
trap 'rm -rf "$TMPROOT"' EXIT

pass=0
fail=0

new_repo() {
  local dir="${TMPROOT}/$1"
  mkdir -p "${dir}/scripts"
  git -C "$dir" init -q 2>/dev/null || (cd "$dir" && git init -q)
  cp "$GUARD" "${dir}/scripts/public-hygiene-check.sh"
  printf '%s\n' "$dir"
}

# run <repo-dir> [private-pattern-file]
run_guard() {
  local dir="$1"
  local patterns="${2:-/nonexistent/public-hygiene-private-patterns.txt}"
  ( cd "$dir" && MADFAM_HYGIENE_PATTERNS="$patterns" bash scripts/public-hygiene-check.sh "$dir" 2>&1 )
}

check() {
  local name="$1" expected_rc="$2" actual_rc="$3" output="$4" expect_text="${5:-}"
  local ok=1
  [[ "$actual_rc" == "$expected_rc" ]] || ok=0
  if [[ -n "$expect_text" ]] && ! printf '%s' "$output" | grep -qF "$expect_text"; then
    ok=0
  fi
  if [[ "$ok" == 1 ]]; then
    printf 'ok   %s\n' "$name"
    pass=$((pass + 1))
  else
    printf 'FAIL %s (expected rc=%s got rc=%s%s)\n' \
      "$name" "$expected_rc" "$actual_rc" \
      "${expect_text:+, expected text: $expect_text}"
    printf '%s\n' "$output" | sed 's/^/       | /'
    fail=$((fail + 1))
  fi
}

# 1. The true positive this widening exists for: a committed registry credential
#    in a file type the old `find`-based scan never opened.
d="$(new_repo planted-auth)"
printf '//npm.madfam.io/:_auth=dGVzdC1vbmx5LW5vdC1hLXJlYWwtY3JlZGVudGlhbA==\n' > "$d/.npmrc" # hygiene-self-reference
git -C "$d" add -A
out="$(run_guard "$d")"; rc=$?
check 'planted .npmrc _auth value is a finding' 1 "$rc" "$out" 'npm registry auth with a concrete value'

# 2. Documented placeholder forms are not credentials.
d="$(new_repo placeholders)"
{
  printf '//npm.madfam.io/:_authToken=${NPM_MADFAM_TOKEN}\n'
  printf '//npm.madfam.io/:_authToken=%%s\n'
  printf '//npm.madfam.io/:_auth=YOUR_TOKEN_GOES_HERE_ABCDEF\n'
  printf '//npm.madfam.io/:_auth=<REDACTED_FOR_DOCS_ABCDEF>\n'
} > "$d/.npmrc" # hygiene-self-reference
git -C "$d" add -A
out="$(run_guard "$d")"; rc=$?
check 'placeholder auth forms are not findings' 0 "$rc" "$out" 'files_scanned='

# 3. Private, loopback and documentation IPv4 ranges are not findings.
d="$(new_repo private-ipv4)"
printf 'bridge 10.0.0.1 and 172.18.0.0 and 127.0.0.1 and 192.168.1.1 and 203.0.113.9\n' > "$d/notes.md" # hygiene-self-reference
git -C "$d" add -A
out="$(run_guard "$d")"; rc=$?
check 'RFC1918/loopback/TEST-NET IPv4 are not findings' 0 "$rc" "$out"

# 4. A public-range IPv4 literal is a finding.
d="$(new_repo public-ipv4)"
printf 'node reachable at 93.184.216.34\n' > "$d/notes.md" # hygiene-self-reference
git -C "$d" add -A
out="$(run_guard "$d")"; rc=$?
check 'public IPv4 literal is a finding' 1 "$rc" "$out" 'Public IPv4 literal'

# 5. A tunnel-identifier UUID shape is a finding.
d="$(new_repo tunnel-uuid)"
printf 'tunnel: 3a7c1f2e-8b4d-4c6a-9e01-5f2b7d8c9a10\n' > "$d/notes.md" # hygiene-self-reference
git -C "$d" add -A
out="$(run_guard "$d")"; rc=$?
check 'tunnel UUID shape is a finding' 1 "$rc" "$out" 'Tunnel-identifier UUID shape'

# 6. Fail closed: nothing scannable means UNDETERMINED, never CLEAN.
d="$(new_repo empty-index)"
out="$(run_guard "$d")"; rc=$?
check 'empty tracked file set is UNDETERMINED (exit 2)' 2 "$rc" "$out" 'UNDETERMINED'

# 7. A class that could not be checked is announced, not silently passed.
d="$(new_repo skipped-class)"
printf 'nothing to see here\n' > "$d/notes.md"
git -C "$d" add -A
out="$(run_guard "$d")"; rc=$?
check 'missing private pattern file reports classes_skipped=1' 0 "$rc" "$out" 'classes_skipped=1'

# 8. With the private pattern file present the class runs, counts as checked, and
#    reports file:line WITHOUT echoing the private literal into a public log.
d="$(new_repo private-patterns)"
printf 'host foundry-secret-node-01 is here\n' > "$d/notes.md"
git -C "$d" add -A
printf '# comment line, ignored\nfoundry-secret-node-[0-9]+\n' > "${TMPROOT}/patterns.txt"
out="$(run_guard "$d" "${TMPROOT}/patterns.txt")"; rc=$?
check 'private pattern file is honoured' 1 "$rc" "$out" 'classes_skipped=0'
check 'private pattern match is redacted to file:line' 1 "$rc" "$out" 'notes.md:1'
if printf '%s' "$out" | grep -qF 'foundry-secret-node-01'; then
  printf 'FAIL private literal was echoed into the log\n'; fail=$((fail + 1))
else
  printf 'ok   private literal is not echoed into the log\n'; pass=$((pass + 1))
fi

printf '\npublic-hygiene tests: pass=%s fail=%s\n' "$pass" "$fail"
[[ "$fail" -eq 0 ]]
