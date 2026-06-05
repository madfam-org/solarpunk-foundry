# Public Repository Boundary

`solarpunk-foundry` is public. It documents ecosystem architecture, shared package contracts, templates, and public-safe operating principles.

This is the public ecosystem contract lane for the repo set.

## Canonical lane map

- `internal-devops`: private operational facts, secrets, costs, provider details, and incident internals.
- `solarpunk-foundry`: public ecosystem narrative, shared contracts, and sanitized runbook links.
- `enclii`: public service platform implementation and safe operational patterns.
- `tulana`: private service implementation and business/market data workflows.

Use [`internal-devops/docs/repo-boundary-contract.md`](https://github.com/madfam-org/internal-devops/blob/main/docs/repo-boundary-contract.md) as the governing policy.

## Belongs here

- Public ecosystem maps
- Architecture and integration patterns
- Shared package documentation
- Public-safe bootstrap examples
- Non-sensitive runbook structure
- Links to private operational sources without duplicating sensitive detail

## Does not belong here

- Live secrets, tokens, passwords, JWT signing material, OAuth client secrets, kubeconfigs, SSH keys, private keys, or `.env` values
- Private IPs, non-public hostnames, hardware inventory, node topology, or provider account details
- Cost ledgers, procurement details, customer data, sensitive audit findings, or incident internals
- Exact production break-glass commands that expose private infrastructure details

## Correct destinations

- Private operational docs: `internal-devops`
- Runtime secrets: Vault or the active external secret store
- Enclii platform implementation docs: `enclii`
- Public architecture summaries: this repository

## Example value rules

Use placeholders that cannot be confused for live secrets:

```text
<GENERATE_AT_RUNTIME>
<SECRET_FROM_VAULT>
<JANUA_JWT_SECRET_FROM_LOCAL_ENV>
<CLOUDFLARE_TOKEN_FROM_SECRET_STORE>
```

Do not use realistic-looking passwords, tokens, or static shared JWT examples in public docs.

## If a live value appears here

Rotate it first, then replace the public reference. Treat the repository history as public exposure unless proven otherwise.

## Automation

Pull requests that touch public documentation should run `scripts/public-hygiene-check.sh`. The guard blocks common token shapes, concrete bootstrap password assignments, concrete JWT secret assignments, kubeconfig references, and private-key markers.

If the guard blocks a legitimate non-secret example, prefer a placeholder over a realistic-looking value.

Pull requests that touch high-risk public doc surfaces (`README`, `ROADMAP`, `AI_CONTEXT`, `AGENTS`, changelog, status, production, or runbook docs) also run `scripts/boundary-checkpoint-check.sh`. Add a boundary checkpoint in the edited file before merge.

`production-readiness-ratchet.yml` runs in warn-only mode for infrastructure and package-shape regressions. Keep it warn-only until the repository baseline is clean; then promote it to enforcement.

## Operational redirects

Use `docs/OPERATIONAL_REDIRECTS.md` when a public document needs to point at private operational execution without duplicating sensitive detail.
