# SSH Access — pointer

**Last verified: 2026-07-25**

> **This public repository does not document production SSH targets, IP
> addresses, hostnames, hardware, or access rosters.** Those are Lane A and
> live in the private `internal-devops` repository.

This document is deliberately a pointer, and that is the correct shape for it.
What changed in this revision is the security-posture section at the bottom,
which previously stated four absolutes that the private runbook contradicts.

## If you have operator access

See `internal-devops/access/ssh-runbook.md` for:

- Node inventory (hostnames, addresses, hardware, location)
- SSH config snippets for `~/.ssh/config`
- The `authorized_keys` onboarding procedure
- Cloudflare Access troubleshooting
- Audit-log expectations
- Which access paths are MFA-gated and which are not

## The public-facing connection method

The supported operator path for MADFAM production SSH is a **Cloudflare Zero
Trust Tunnel**, using the host documented in `internal-devops`. You need:

1. **cloudflared installed**
   - macOS: `brew install cloudflared`
   - Debian/Ubuntu: follow Cloudflare's current Linux package instructions

2. **An Ed25519 SSH key**
   ```sh
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```

3. **Cloudflare Access authentication**
   ```sh
   cloudflared access login <SSH_ZERO_TRUST_HOST>
   ```

4. **Membership in the MADFAM Cloudflare Access policy** — request via the
   contact address in the repository README (`admin@madfam.io`).

An operator with write access then adds your public key to the appropriate
`authorized_keys`, and you connect as documented privately.

**Known intermittent:** Cloudflare Access token expiry on the client side
produces sporadic failures. Re-running `cloudflared access login` resolves it.
This is a client-side condition, not an infrastructure fault.
*(Recorded in the private domain map, 2026-07-01.)*

## Security posture — corrected 2026-07-25

The previous revision of this page stated four absolutes:

> ~~"No direct IP access — all SSH flows through the Cloudflare Tunnel."~~
> ~~"MFA enforced via Cloudflare Access policy."~~
> ~~"No root SSH."~~
> ~~"All connections audit-logged by Cloudflare."~~

**Each of those is contradicted as an absolute** by
`internal-devops/access/ssh-runbook.md` (last updated 2026-05-04), which
documents additional access paths that are key-only, not MFA-gated, and not
Cloudflare-audited — including at least one node whose documented access
account is privileged.

Accurate statement:

- **Cloudflare Access with MFA is the supported operator path**, and connections
  over it are audit-logged by Cloudflare.
- **Additional direct paths exist.** They are documented privately, they are
  SSH-key-only, they are **not** MFA-gated, and they are **not** covered by
  Cloudflare audit logging. They are not enumerated here.
- Use the Cloudflare Access path. If you find yourself needing a direct path,
  that is a break-glass event and must be recorded per the Enclii-first
  recording requirement — see [`runbooks/README.md`](./runbooks/README.md).

**Why the distinction matters:** publishing an aspirational posture as if it
were enforced is worse than publishing nothing, because it discourages the
audit that would find the gap. The gap itself is an operator item, not a
documentation one.

## Related note on "zero exposed ports"

The public description of the cluster says *zero exposed node ports*. That
means **no NodePort application ingress** — all public application traffic
arrives through the Cloudflare Tunnel. It does not mean nothing listens on the
nodes. See [`INFRASTRUCTURE_STATUS.md`](./INFRASTRUCTURE_STATUS.md#ingress).
