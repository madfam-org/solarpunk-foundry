# Honest-Status Scorecard (template)

> **Mandate:** `internal-devops` RFC 0024 P3.1 — every repo that makes a
> readiness or "production" claim publishes an evidence-backed status
> scorecard instead of aspirational copy.
>
> **Modeled on:** internal MADFAM GA-readiness scorecards and truth-audit
> docs (machine-checked readiness scores, named blockers; exemplar pointers
> live in the private `internal-devops` repo — RFC 0024 P3) and capability
> tiers, smoke gates, dated evidence snapshots).

## How to use

1. Copy this file into your repo (suggested: `docs/HONEST_STATUS.md`).
   **Copy, don't depend** — you own and maintain your instance.
2. Every claim goes in exactly one of three states: **Verified in
   production**, **Built but unverified**, or **Claimed but not built**.
   If you cannot link evidence, the claim is not verified — move it down.
3. Evidence must be reproducible: a command anyone can run, a CI/report
   artifact, or a live URL check — with the date you last ran it.
4. Re-verify on every release and at least at the stated review cadence.
   Stale evidence (older than the next-review date) demotes the claim.
5. If a claim in any other doc (README, landing page, spec) conflicts with
   this scorecard, this scorecard wins; correct the other doc.
6. Boundary checkpoint: in public repos, keep evidence public-safe — no
   credentials, private topology, costs, or incident internals (see
   `docs/PUBLIC_REPO_BOUNDARY.md`); run `scripts/public-hygiene-check.sh`
   equivalents where available.

Once filled in: retitle this document `<Repo name> Honest Status`, keep
the mandate block, delete instructions 1–6, and replace every
`<placeholder>` below.

---

Updated: `<YYYY-MM-DD>` · Verified by: `<name/agent>` ·
Overall readiness: **`<NN>`% (`<n>`/`<total>` checks)**

Honest positioning (one line, no hedging):
`<e.g. "Internal beta: close. Public GA: not yet.">`

## 1. Verified in production

Only claims with dated, reproducible evidence. "Route returns 200" is
availability, not product truth — say which.

| Claim | Evidence (command / link / artifact) | Verified on |
|-------|--------------------------------------|-------------|
| `<claim>` | `<command or URL>` → `<observed result>` | `<YYYY-MM-DD>` |
| `<claim>` | `<CI run / report artifact link>` | `<YYYY-MM-DD>` |

Verification commands (runnable by anyone with repo access):

```bash
# <e.g. make smoke-prod, pnpm ga:readiness, curl -fsS https://<host>/health>
```

## 2. Built but unverified

Code/config exists, but no production (or production-equivalent) evidence
yet. State exactly what proof is missing.

| Claim | What exists | Missing verification |
|-------|-------------|----------------------|
| `<claim>` | `<code path / test / staging result>` | `<the check that would promote it to section 1>` |

## 3. Claimed but not built

Anything asserted in README/landing/spec/marketing that has no
implementation. List it here and fix or delete the overclaiming doc.

| Claim | Where claimed | Reality | Corrective action |
|-------|---------------|---------|-------------------|
| `<claim>` | `<doc/URL>` | `<not implemented / mock / roadmap>` | `<PR or doc edit>` |

## 4. Blockers

Named blockers, each with an owner and an explicit unblock criterion —
"N blocked, 0 clear" style. No anonymous blockers.

| # | Blocker | Owner | Severity | Unblock criterion |
|---|---------|-------|----------|-------------------|
| 1 | `<blocker>` | `<person/team>` | `<critical / high / medium>` | `<observable pass condition>` |

Severity guide: **critical** = blocks the honest-positioning line above;
**high** = blocks the next tier claim; **medium** = quality/confidence gap.

## 5. Overall readiness score

Score = verified checks / total checks, computed — not vibes. Prefer a
machine-generated number (e.g. a `ga:readiness` script emitting `passed/total`).

| Tier | Score | Meaning for public copy |
|------|-------|-------------------------|
| Not claimable | 0–39% | Prototype/spike; no availability language anywhere |
| Internal alpha | 40–59% | Team-only use; no public promises |
| Public beta | 60–79% | Available with stated limits; blockers listed publicly |
| GA candidate | 80–94% | All critical blockers clear; evidence package complete |
| GA | 95–100% | Every section-1 check green and re-verified this cycle |

Current: **`<NN>`% → `<tier>`**. Do not use a higher tier's language in any
doc, landing page, or agent context until this scorecard supports it.

## 6. Verification date and next review

| Field | Value |
|-------|-------|
| Last full verification | `<YYYY-MM-DD>` |
| Verified by | `<name/agent>` |
| Method | `<commands / CI run link>` |
| Next review due | `<YYYY-MM-DD (max +30 days, or every release)>` |
| Review trigger | `<release, blocker cleared, claim flipped>` |

If the next-review date passes without re-verification, prepend
**"STALE — evidence expired `<date>`"** to the title of this document.
