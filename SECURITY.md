# Security Policy

## Reporting security issues

**Use GitHub private vulnerability reporting:** open this repository's
**Security** tab and choose **Report a vulnerability**
(<https://github.com/madfam-org/solarpunk-foundry/security/advisories/new>).
The report is visible only to the repository's maintainers until an advisory is
published.

Do not open public issues, discussions or pull requests for sensitive reports.
If the **Report a vulnerability** button is not shown, private reporting has not
been switched on for this repository yet (a maintainer settings action, recorded
2026-09-23). In that case open a public issue titled "Security contact request"
that contains **no details** of the problem, and a maintainer will reply with a
private channel.

Include:

- Affected repository or document path
- Impact summary
- Reproduction steps or exact exposed reference
- Whether any credential, token, hostname, IP, or private operational detail appears to be live

## Public repository boundary

`solarpunk-foundry` is public, permanently (owner decision, 2026-09-04). It must
not contain live secrets, private IPs, hardware inventory, customer data,
kubeconfigs, provider tokens, production hostnames that are not already public,
cost ledgers, or sensitive incident details. Policy:
[`docs/PUBLIC_REPO_BOUNDARY.md`](docs/PUBLIC_REPO_BOUNDARY.md).

Sensitive operational detail belongs in the private `internal-devops` repository. Runtime secret values belong in Vault or the appropriate external secret store, never in this repository.

## Rotation rule

If a value in this repository might be a live credential, rotate it first and then replace the document reference with a placeholder such as `<GENERATE_AT_RUNTIME>` or `<SECRET_FROM_VAULT>`.

## Supported scope

This policy covers documentation, templates, shared packages, bootstrap examples, and generated examples in this repository.
