#!/usr/bin/env bash
set -euo pipefail

# Public-repo hygiene guard for solarpunk-foundry.
#
# Scans every TRACKED TEXT FILE for live credential-looking material and private
# operational detail that belongs in internal-devops.
#
# THE DEFECT THIS FIXES (2026-09-04): the file set used to be a `find` over
# `*.md|*.mdx|*.txt|README*|SECURITY*|CONTRIBUTING*|CHANGELOG*`, roughly 70 of
# the ~292 tracked files. `.npmrc`, `.yml`, `.sh`, `.ts` and `.json` were never
# read, so a committed registry credential in a `.npmrc` passed this guard for
# its entire life while the run printed nothing and exited 0.
#
# Exit codes:
#   0  scanned, nothing found
#   1  findings
#   2  UNDETERMINED — the tracked file set could not be established, so nothing
#      was scanned. A guard that could not look must not report what a clean
#      look reports (decisions/2026-07-26-fail-closed-seam-doctrine.md).

ROOT="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cd "$ROOT"

status=0
classes_skipped=0

# Every tracked file that `grep -I` considers text. `git ls-files` (not `find`)
# so untracked build output and anything gitignored is out of scope by
# construction, and a file becomes scannable the moment it is added.
scan_files() {
  git ls-files -z 2>/dev/null | xargs -0 -r grep -IlZ '' 2>/dev/null | tr '\0' '\n'
}

FILES=()
while IFS= read -r _f; do
  [[ -n "$_f" ]] || continue
  FILES+=("$_f")
done < <(scan_files)

if [[ "${#FILES[@]}" -eq 0 ]]; then
  cat >&2 <<'MSG'
[public-hygiene] UNDETERMINED — could not establish the tracked file set.

`git ls-files` returned nothing scannable: not a git work tree, an empty index,
or `git` unavailable. Nothing was scanned, so this run is not evidence of
anything. Run it from inside the repository checkout.
MSG
  printf 'Public hygiene check UNDETERMINED — files_scanned=0 classes_skipped=0\n'
  exit 2
fi

# $3 (optional) - an ERE of placeholder shapes; a matched line that also matches
#   it is dropped, so documented `${VAR}` / `%s` / `YOUR_TOKEN` / `<REDACTED>` /
#   `__CHANGE_ME_*__` forms are not reported as credentials.
# $4 (optional) - "redact": print `file:line` only, never the matched text. Used
#   for the private-pattern class: this repo is public and so are its CI logs,
#   so a guard that echoed the private literal it just found would publish it.
#
# grep is invoked as `grep -e "$pattern" --` and its exit status is inspected.
# A pattern beginning with `--` used to be swallowed as an unrecognised option
# behind `2>/dev/null || true`, which silently disabled the kubeconfig class;
# rc > 1 is now UNDETERMINED, not clean.
check_pattern() {
  local label="$1"
  local pattern="$2"
  local exclude="${3:-}"
  local mode="${4:-}"
  local matches rc=0
  matches=$(grep -nHE -e "$pattern" -- "${FILES[@]}") || rc=$?
  if [[ "$rc" -gt 1 ]]; then
    printf '\n[public-hygiene] UNDETERMINED - grep failed (rc=%s) on class: %s\n' "$rc" "$label" >&2
    printf 'Public hygiene check UNDETERMINED - files_scanned=%s classes_skipped=%s\n' "${#FILES[@]}" "$classes_skipped"
    exit 2
  fi
  # Lines that DEFINE a pattern rather than carry a value: this script and its
  # test necessarily contain the shapes they hunt for. The marker is per-line,
  # never per-file, so neither file becomes a blind spot.
  if [[ -n "$matches" ]]; then
    matches=$(printf '%s\n' "$matches" | grep -Fv 'hygiene-self-reference' || true)
  fi
  if [[ -n "$matches" && -n "$exclude" ]]; then
    matches=$(printf '%s\n' "$matches" | grep -Ev "$exclude" || true)
  fi
  if [[ -n "$matches" && "$mode" == "redact" ]]; then
    matches=$(printf '%s\n' "$matches" | cut -d: -f1,2)
  fi
  if [[ -n "$matches" ]]; then
    printf '\n[public-hygiene] %s\n' "$label" >&2
    printf '%s\n' "$matches" >&2
    status=1
  fi
}

# Measured against this tree: these shapes cover every placeholder the repo
# actually ships (`${NPM_MADFAM_TOKEN}`, `%s`, `YOUR_TOKEN`, `<REDACTED>`,
# `__CHANGE_ME_JWT_SECRET_MIN_32_CHARS__`, `sk_test_mock_key_replace_with_real`).
PLACEHOLDER_SHAPES='\$\{|YOUR_|REDACTED|CHANGEME|CHANGE_ME|PLACEHOLDER|<[A-Z_]+>|%s|_mock_|replace_with' # hygiene-self-reference

check_pattern 'Stripe live/test secret key pattern' 'sk_(live|test)_[A-Za-z0-9_]{16,}' "$PLACEHOLDER_SHAPES" # hygiene-self-reference
check_pattern 'GitHub token pattern' 'gh[pousr]_[A-Za-z0-9_]{20,}' "$PLACEHOLDER_SHAPES" # hygiene-self-reference
check_pattern 'AWS access key pattern' 'AKIA[0-9A-Z]{16}' # hygiene-self-reference
check_pattern 'Private key marker' '-----BEGIN [A-Z ]*PRIVATE KEY-----' # hygiene-self-reference
check_pattern 'Concrete admin bootstrap password assignment' "ADMIN_BOOTSTRAP_PASSWORD='[^<][^']{6,}'" "$PLACEHOLDER_SHAPES" # hygiene-self-reference
check_pattern 'Concrete JWT secret assignment' 'JANUA_JWT_SECRET=[^<$[][^[:space:]]{12,}' "$PLACEHOLDER_SHAPES" # hygiene-self-reference
# Scoped to kubeconfig CREDENTIAL MATERIAL and break-glass invocations naming a
# private path. A bare mention of the default `~/.kube/config` location is not
# an exposure -- local dev tooling that mounts the developer's own kubeconfig
# into a container names it, and the boundary doc bans break-glass COMMANDS,
# not the path. The `--kubeconfig=/` alternative still catches the command form. (hygiene-self-reference)
check_pattern 'Kubeconfig credential material or break-glass invocation' '--kubeconfig=/|client-certificate-data|client-key-data|certificate-authority-data' # hygiene-self-reference

# npm registry auth with a concrete value. Deliberately anchored on `:_auth=` /
# `:_authToken=` rather than the looser `//host/:_` shape: measured against this
# tree, the loose form hits four benign env-var and documentation lines.
check_pattern 'npm registry auth with a concrete value' \
  ':_auth(Token)?=[A-Za-z0-9+/=_.-]{16,}' "$PLACEHOLDER_SHAPES" # hygiene-self-reference

# Cloudflare tunnel identifiers are UUIDs; the shape is the only tell.
check_pattern 'Tunnel-identifier UUID shape' \
  '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}' # hygiene-self-reference

# Public IPv4 literals. Private, loopback, link-local, documentation (TEST-NET)
# and reserved ranges are excluded, so illustrative addresses and container
# subnets stay usable in docs while a real node address does not.
check_ipv4() {
  local raw skip matches rc=0
  raw=$(grep -nHEo -e '\b([0-9]{1,3}[.]){3}[0-9]{1,3}\b' -- "${FILES[@]}") || rc=$?
  if [[ "$rc" -gt 1 ]]; then
    printf '\n[public-hygiene] UNDETERMINED - grep failed (rc=%s) on class: public IPv4\n' "$rc" >&2
    exit 2
  fi
  [[ -n "$raw" ]] || return 0
  # `grep -o` prints only the address, so the per-line self-reference marker is
  # not visible in it; collect the marked `file:line` keys separately and drop
  # matches that belong to them.
  skip=$(grep -nHF 'hygiene-self-reference' -- "${FILES[@]}" | cut -d: -f1,2 || true)
  matches=$(printf '%s\n' "$raw" | awk -F: -v skips="$skip" '
    BEGIN { n = split(skips, a, "\n"); for (i = 1; i <= n; i++) if (a[i] != "") s[a[i]] = 1 }
    { if (!(($1 ":" $2) in s)) print }')
  matches=$(printf '%s\n' "$matches" | grep -Ev ':(10[.]|127[.]|169[.]254[.]|192[.]168[.]|172[.](1[6-9]|2[0-9]|3[01])[.]|192[.]0[.]2[.]|198[.]51[.]100[.]|203[.]0[.]113[.]|0[.]0[.]0[.]0$|255[.])' || true)
  if [[ -n "$matches" ]]; then
    printf '\n[public-hygiene] %s\n' 'Public IPv4 literal (RFC1918, loopback, link-local and TEST-NET excluded)' >&2
    printf '%s\n' "$matches" >&2
    status=1
  fi
}
check_ipv4

# Node-identity class. The literals (node hostnames, node IPs) live in the
# PRIVATE repo and are read from a file outside this checkout. They are NOT
# hashed into this script: `foundry-<role>-NN` is a dozen guesses and IPv4 is
# 2^32, so a hash would buy obfuscation while implying secrecy.
#
# When the file is unreadable the class is reported as SKIPPED and counted in
# `classes_skipped=`, so a green run never implies the class was checked. The
# check that actually runs in CI for this class is
# internal-devops/scripts/check-public-repo-node-identity.py.
PRIVATE_PATTERNS="${MADFAM_HYGIENE_PATTERNS:-../internal-devops/security/public-hygiene-private-patterns.txt}"
if [[ -r "$PRIVATE_PATTERNS" ]]; then
  while IFS= read -r _pattern || [[ -n "$_pattern" ]]; do
    [[ -n "$_pattern" ]] || continue
    case "$_pattern" in \#*) continue ;; esac
    check_pattern 'Private-pattern match (node identity; text withheld — this log is public)' \
      "$_pattern" '' redact
  done < "$PRIVATE_PATTERNS"
else
  printf '[public-hygiene] node-identity class SKIPPED — private pattern file not available: %s\n' \
    "$PRIVATE_PATTERNS" >&2
  classes_skipped=1
fi

if [[ "$status" -ne 0 ]]; then
  cat >&2 <<'MSG'

Public hygiene check failed. Rotate first if any value may have been live, then
replace the public reference with a non-secret placeholder or move the detail to
internal-devops.
MSG
fi

# READ-PROOF. `files_scanned=` distinguishes a clean run from a run that saw
# nothing; `classes_skipped=` names how many exposure classes this run could not
# check at all.
printf 'Public hygiene check: files_scanned=%s classes_skipped=%s\n' "${#FILES[@]}" "$classes_skipped"
exit "$status"
