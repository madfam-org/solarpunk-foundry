# Contributing

`solarpunk-foundry` is the public blueprint and shared-package layer for the MADFAM ecosystem.

Before submitting changes:

- Keep public/private boundaries intact.
- Do not add live secrets, private infrastructure details, customer data, cost ledgers, kubeconfigs, or sensitive incident details.
- Put private operational runbooks and remediation notes in `internal-devops`.
- Use placeholders for credentials and mark whether values come from Vault, Enclii, or local development.
- Preserve the Enclii-first operations contract: routine production work should use Enclii web, API, or CLI; raw cluster/provider access is break-glass only.

For docs changes, update related cross-repo references when the public ecosystem shape changes.
