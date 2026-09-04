# Public Repository Boundary

**Last verified: 2026-07-25** — the automation section was checked against
`scripts/` and `.github/workflows/` on that date.

`solarpunk-foundry` is public. It documents ecosystem architecture, shared
package contracts, templates, and public-safe operating principles. It is the
public ecosystem contract lane for the MADFAM repository set.

## Canonical lane map

| Lane | Repository | Contents |
|---|---|---|
| A | `internal-devops` *(private)* | Operational facts, secrets, costs, provider details, node identity, incident internals |
| B | `solarpunk-foundry` *(public)* | Ecosystem narrative, shared contracts, sanitized runbook links |
| C | `enclii` *(public)* | Service platform implementation and safe operational patterns |
| D | `tulana` *(private)* | Private service implementation, business and market data workflows |

The governing policy is `internal-devops/docs/repo-boundary-contract.md`
(private repository — referenced by name only; the URL 404s without
organisation access). It carries `Last updated: 2026-06-14`.

## Belongs here

- Public ecosystem maps
- Architecture and integration patterns
- Shared package documentation
- Public-safe bootstrap examples
- Non-sensitive runbook *structure* — the shape of a procedure, never the
  commands
- Links to private operational sources, without duplicating the detail

## Does not belong here

- Live secrets, tokens, passwords, JWT signing material, OAuth client secrets,
  kubeconfigs, SSH keys, private keys, or `.env` values
- **Node hostnames**
- **Public IP addresses**
- **Hardware model numbers or capacity figures**
- **Cloudflare tunnel identifiers**
- Private IPs, non-public hostnames, node topology detail, provider account
  details
- Vault paths or secret names with retrieval detail
- Cost ledgers, procurement details, customer data
- Sensitive audit findings, incident internals, or incident evidence trails
- Exact production break-glass commands
- SSH access rosters

## What *is* public about the infrastructure

Stated positively, so the boundary is a line rather than a fog. The following
shape is already public and stays public:

> A 3-node bare-metal k3s cluster on Hetzner — two dedicated servers plus one
> cloud VPS builder — with ingress via a single Cloudflare Tunnel and zero
> exposed node ports for application traffic. Block storage is Longhorn CSI;
> object storage is Cloudflare R2. GitOps is ArgoCD in an App-of-Apps pattern.

Anything more specific than that paragraph needs a deliberate decision, not a
default.

## Correct destinations

| Content | Destination |
|---|---|
| Private operational docs | `internal-devops` |
| Runtime secrets | Vault / the active external secret store |
| Enclii platform implementation | `enclii` |
| Public architecture summaries | this repository |

## Example value rules

Use placeholders that cannot be mistaken for live values:

```text
<GENERATE_AT_RUNTIME>
<SECRET_FROM_VAULT>
<CLOUDFLARE_TOKEN_FROM_SECRET_STORE>
<SSH_ZERO_TRUST_HOST>
```

Do not use realistic-looking passwords or tokens in public docs.

> **Do not use `<JANUA_JWT_SECRET_FROM_LOCAL_ENV>` or any placeholder implying
> a shared symmetric JWT secret.** Janua verification is RS256 against a public
> JWKS endpoint; a shared secret is not part of the contract, and a placeholder
> for one teaches the wrong architecture. See
> [`JANUA_INTEGRATION.md`](./JANUA_INTEGRATION.md).

## If a live value appears here

Rotate it first, then replace the public reference. **Treat repository history
as public exposure unless proven otherwise** — deleting the line from `HEAD`
does not remove it from git history, so the rotation is still owed.

## Automation — what it does and does not catch

*Verified 2026-09-04 by reading the scripts and the workflow directory.*

| Guard | Location | Coverage |
|---|---|---|
| `public-hygiene-check.sh` | `scripts/`, run by `.github/workflows/public-hygiene.yml` | 10 pattern classes over **every tracked text file** (see below) |
| `public-hygiene` self-test | `scripts/tests/test-public-hygiene.sh`, run by the same workflow | 10 cases proving the guard fails on a planted credential, a public IPv4 and a tunnel UUID, and reports UNDETERMINED when it cannot look |
| `boundary-checkpoint-check.sh` | `scripts/` | Requires a boundary checkpoint in edited high-risk doc surfaces (README, ROADMAP, AI_CONTEXT, AGENTS, changelog, status, production, runbook docs) |
| `check-production-readiness-ratchet.py` | `scripts/`, run by `.github/workflows/production-readiness-ratchet.yml` | Infrastructure and package-shape regressions, **warn-only** |

### Coverage as of 2026-09-04

**File scope.** The scan is `git ls-files` filtered to text files — 292 of 292
tracked files at the time of writing. Until 2026-09-04 it was a `find` over
`*.md`, `*.mdx`, `*.txt` and `README*` / `SECURITY*` / `CONTRIBUTING*` /
`CHANGELOG*`, roughly 70 files; `.npmrc`, `.yml`, `.sh`, `.ts` and `.json` were
never opened. A committed registry credential in `packages/core/.npmrc` passed
this guard for its entire life as a result.

| Class | Status |
|---|---|
| Stripe / GitHub / AWS key shapes, PEM private-key markers | covered |
| Concrete admin-bootstrap password and JWT secret assignments | covered |
| Kubeconfig credential material (the embedded client- and CA-certificate data keys) and break-glass invocations passing an absolute kubeconfig path | covered |
| npm registry auth with a concrete value (`:_auth` / `:_authToken`) | **covered** (new) |
| Cloudflare tunnel identifiers (UUID shape) | **covered** (new) |
| Public IPv4 addresses | **covered** (new) — RFC1918, loopback, link-local, TEST-NET and reserved ranges excluded so illustrative addresses stay usable |
| Node hostname literals | **not covered here, by design** — see below |

**Node identities are enforced from the private repo.** The literals cannot be
written into a public script, and hashing them would buy obfuscation while
implying secrecy (`foundry-<role>-NN` is a dozen guesses; IPv4 is 2^32). Two
mechanisms cover the class instead:

1. `MADFAM_HYGIENE_PATTERNS` — a path to a private pattern file (one ERE per
   line), default `../internal-devops/security/public-hygiene-private-patterns.txt`.
   When it is readable the class runs and matches print `file:line` only, never
   the matched text, because this repository's CI logs are public.
2. `internal-devops/scripts/check-public-repo-node-identity.py`, which reads the
   private node inventory and greps sibling public checkouts.

Every run ends with `files_scanned=<n> classes_skipped=<n>`. **`classes_skipped=1`
means the node-identity class was not checked at all** — a green run with a
skipped class is not a clean bill of health for that class.

**Fail-closed.** If the tracked file set cannot be established the guard prints
`UNDETERMINED` and exits 2, which fails CI exactly like exit 1. A guard that
could not look must not report what a clean look reports.

**Self-reference marker.** This script and its test necessarily contain the
shapes they hunt for. A line carrying `hygiene-self-reference` is excluded from
findings. The marker is per line, never per file, so neither file becomes a
blind spot — and a line that carries it is visible to any reviewer grepping for
the marker.

**Consequence:** passing CI is not evidence that a change is boundary-clean.
Human review against the "does not belong here" list above is still the control
that matters. The 2026-07-25 revision of this section listed four known gaps and
said closing them was out of scope; three of the four are closed above, and the
fourth (node hostnames) is deliberately enforced from the private repo instead.

If the guard blocks a legitimate non-secret example, prefer a placeholder over
a realistic-looking value.

## Operational redirects

Use [`OPERATIONAL_REDIRECTS.md`](./OPERATIONAL_REDIRECTS.md) when a public
document needs to point at private operational execution without duplicating
sensitive detail.

## Checklist when editing a public doc

- [ ] No secrets, tokens, or bootstrap-like credentials
- [ ] No node hostnames, IP addresses, hardware, capacity, costs, or tunnel IDs
- [ ] No raw break-glass commands
- [ ] Over-specific private detail replaced with a pointer by path
- [ ] Every factual claim carries a source and a verification date
- [ ] Aspirational or superseded content is **labelled in place**, not deleted
- [ ] Boundary note present for newly added context
