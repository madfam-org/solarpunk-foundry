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

*Verified 2026-07-25 by reading the scripts and the workflow directory.*

| Guard | Location | Coverage |
|---|---|---|
| `public-hygiene-check.sh` | `scripts/`, run by `.github/workflows/public-hygiene.yml` | 7 patterns: Stripe key shapes, GitHub token shapes, AWS access keys, PEM private-key markers, concrete admin-bootstrap password assignment, concrete JWT secret assignment, kubeconfig markers |
| `boundary-checkpoint-check.sh` | `scripts/` | Requires a boundary checkpoint in edited high-risk doc surfaces (README, ROADMAP, AI_CONTEXT, AGENTS, changelog, status, production, runbook docs) |
| `check-production-readiness-ratchet.py` | `scripts/`, run by `.github/workflows/production-readiness-ratchet.yml` | Infrastructure and package-shape regressions, **warn-only** |

### Known coverage gaps

State these plainly, because the guard has been read as broader than it is:

1. **No pattern for Cloudflare tunnel identifiers.**
2. **No pattern for public IPv4 addresses.**
3. **No pattern for node hostname literals.**

Those are three of the categories this document bans most emphatically, and the
guard does not look for any of them.

4. **File-type scope is narrow.** The scan covers `*.md`, `*.mdx`, `*.txt` and
   `README*` / `SECURITY*` / `CONTRIBUTING*` / `CHANGELOG*`. It does **not**
   scan `.tf`, `.yaml`, `.yml`, `.conf`, `.sh`, or `.json`.

**Consequence:** passing CI is not evidence that a change is boundary-clean.
Human review against the "does not belong here" list above is still the control
that matters. Closing gaps 1–4 is a worthwhile change to `scripts/` — outside
the scope of this document, which is why it is recorded here rather than
assumed fixed.

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
