# Security Policy

## Reporting security issues

Report suspected vulnerabilities, leaked credentials, or unsafe operational details through the private MADFAM security channel or the private `internal-devops` repository. Do not open public issues for sensitive reports.

Include:

- Affected repository or document path
- Impact summary
- Reproduction steps or exact exposed reference
- Whether any credential, token, hostname, IP, or private operational detail appears to be live

## Public repository boundary

`solarpunk-foundry` is public. It must not contain live secrets, private IPs, hardware inventory, customer data, kubeconfigs, provider tokens, production hostnames that are not already public, cost ledgers, or sensitive incident details.

Sensitive operational detail belongs in the private `internal-devops` repository. Runtime secret values belong in Vault or the appropriate external secret store, never in this repository.

## Rotation rule

If a value in this repository might be a live credential, rotate it first and then replace the document reference with a placeholder such as `<GENERATE_AT_RUNTIME>` or `<SECRET_FROM_VAULT>`.

## Supported scope

This policy covers documentation, templates, shared packages, bootstrap examples, and generated examples in this repository.
