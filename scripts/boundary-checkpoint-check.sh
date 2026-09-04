#!/usr/bin/env bash
set -euo pipefail

# Ported from internal-devops/scripts/boundary-checkpoint-check.sh on 2026-09-04
# (its 2026-07-26 fail-closed rewrite). Re-port from there rather than editing
# the shared machinery in place; the surface list below is foundry-specific.

ROOT="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cd "$ROOT"

# Establishes the change set AND records how it was determined.
#
# THE DEFECT THIS FIXES (2026-07-26): every failure path here used to `return`
# with no output, and the caller could not tell "I determined the change set and
# no boundary surface was touched" from "I could not determine the change set at
# all". Both printed `inspected 0 ... surface(s)` and exited 0. Run outside a git
# tree — a shallow CI checkout, a tarball, a container without .git — this guard
# passed having examined nothing, while claiming to protect the public/private
# boundary. That is the vacuous-green class this repo has now removed six times
# over; see decisions/2026-07-26-fail-closed-seam-doctrine.md.
#
# Every success path emits a `#source:<how>` sentinel as its FIRST line, and the
# function returns non-zero when it genuinely cannot tell — which the caller turns
# into exit 2 (UNDETERMINED), never a pass. The sentinel exists because this runs
# inside `$(...)`, a subshell: a plain variable assignment here would be discarded
# on return, which is exactly how the first draft of this fix silently reported
# `source=unknown` on every run.
changed_files() {
  if [[ -n "${BOUNDARY_CHECK_FILES:-}" ]]; then
    printf '#source:explicit BOUNDARY_CHECK_FILES\n'
    printf '%s\n' ${BOUNDARY_CHECK_FILES}
    return 0
  fi

  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    return 1
  fi

  local base="${BOUNDARY_BASE_REF:-${GITHUB_BASE_REF:-main}}"
  local branch
  branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
  if [[ "$branch" == "$base" ]] && git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
    printf "#source:diff HEAD~1..HEAD (on base branch ${base})\n"
    git diff --name-only --diff-filter=ACMR HEAD~1..HEAD
    return 0
  fi

  if git rev-parse --verify "origin/${base}" >/dev/null 2>&1; then
    printf "#source:diff origin/${base}...HEAD\n"
    git diff --name-only --diff-filter=ACMR "origin/${base}...HEAD"
    return 0
  fi

  if git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
    # origin/<base> is absent — a shallow clone, or the base was never fetched.
    # This is NARROWER than the PR: it sees one commit, so a checkpoint removed
    # in an earlier commit of the same branch is invisible. Determinate, but the
    # run says so out loud rather than presenting it as a full check.
    printf "#source:diff HEAD~1..HEAD (NARROW: origin/${base} unavailable, only the last commit was examined)\n"
    git diff --name-only --diff-filter=ACMR HEAD~1..HEAD
    return 0
  fi

  printf '#source:git ls-files (single-commit repository, whole tree)\n'
  git ls-files
  return 0
}

# WHAT COUNTS AS A BOUNDARY SURFACE (foundry list, widened 2026-09-04).
#
# Note that `case` patterns are NOT pathname expansion: `*` matches `/` too, so
# `ops/*` covers `ops/bin/madfam.sh` and `docs/runbooks/*.md` covers nested
# runbooks. bash has no `**`, which is why `infrastructure/*` matches the parent
# and the `.sh` filter is applied inside the arm.
#
# The four additions below are the surfaces that carry private operational
# detail but sat outside the old list, which is how this repo reported
# "16/16 surfaces OK" while every one of its boundary findings lived in them:
#   ops/*                    operator tooling, compose files, env templates
#   scripts/*                repo automation, including these guards themselves
#   infrastructure/**/*.sh   bootstrap scripts that touch real hosts
#   packages/*/README.md     published package front doors
is_boundary_surface() {
  case "$1" in
    README.md|ROADMAP.md|AI_CONTEXT.md|AGENTS.md|ECOSYSTEM.md|CHANGELOG.md|CONTRIBUTING.md|SECURITY.md)
      return 0
      ;;
    docs/PUBLIC_REPO_BOUNDARY.md|docs/ECOSYSTEM_STATUS.md|docs/INFRASTRUCTURE_STATUS.md)
      return 0
      ;;
    docs/*ROADMAP*.md|docs/*roadmap*.md|docs/*STATUS*.md|docs/*status*.md|docs/production/*.md|docs/runbooks/*.md)
      return 0
      ;;
    ops/*)
      return 0
      ;;
    scripts/*)
      return 0
      ;;
    packages/*/README.md)
      return 0
      ;;
    infrastructure/*)
      [[ "$1" == *.sh ]] && return 0 || return 1
      ;;
  esac
  return 1
}

has_boundary_marker() {
  grep -Eiq 'boundary checkpoint|repository boundary|public repository boundary|repo-boundary contract|PUBLIC_REPO_BOUNDARY|repo-boundary-contract' "$1"
}

status=0
checked=0
considered=0
missing=0

# Capture the change set FIRST so a failure to determine it is distinguishable
# from an empty one. A process-substitution `while` loop would swallow the
# function's exit status entirely, which is how the old version lost this.
if ! FILES="$(changed_files)"; then
  cat >&2 <<'MSG'
[boundary-checkpoint] UNDETERMINED — could not establish the changed-file set.

Not a git work tree, so there is nothing to diff against. This check protects the
public/private boundary, so "I could not look" must never report the same result
as "I looked and it was clean". Run it from inside the repository, or pass an
explicit list via BOUNDARY_CHECK_FILES.
MSG
  printf 'Boundary checkpoint check UNDETERMINED — considered=0 surfaces=0 missing=0\n'
  exit 2
fi

SOURCE="unknown"
while IFS= read -r file; do
  [[ -n "$file" ]] || continue
  if [[ "$file" == '#source:'* ]]; then
    SOURCE="${file#\#source:}"
    continue
  fi
  considered=$((considered + 1))
  [[ -f "$file" ]] || continue
  is_boundary_surface "$file" || continue
  checked=$((checked + 1))

  if ! has_boundary_marker "$file"; then
    printf '[boundary-checkpoint] missing checkpoint marker: %s\n' "$file" >&2
    status=1
    missing=$((missing + 1))
  fi
done <<< "$FILES"

if [[ "$status" -ne 0 ]]; then
  cat >&2 <<'MSG'

Boundary checkpoint check failed.
Add a short boundary checkpoint to each changed public-facing surface
(doc, operator script, infrastructure script, or package README):
- date and owner
- public-safe summary
- private sink for omitted operational detail
- policy pointer to docs/PUBLIC_REPO_BOUNDARY.md or the repo-boundary contract
MSG
fi

# READ-PROOF. `considered=` is how many changed files were examined at all, so a
# clean run is distinguishable from a run that saw nothing; `source=` records HOW
# the change set was determined, so a narrowed fallback is visible rather than
# silently presented as a full check.
printf 'Boundary checkpoint check: considered=%s surfaces=%s missing=%s source=%s\n' \
  "$considered" "$checked" "$missing" "${SOURCE:-unknown}"
exit "$status"
