# SSH Access — pointer

**Last verified: 2026-07-25** · security-posture section reduced 2026-09-23

> **This public repository does not document production SSH targets, IP
> addresses, hostnames, hardware, or access rosters.** Those are Lane A and
> live in the private `internal-devops` repository.

This document is deliberately a pointer, and that is the correct shape for it.

## If you have operator access

See `internal-devops/access/ssh-runbook.md` for:

- Node inventory (hostnames, addresses, hardware, location)
- SSH config snippets for `~/.ssh/config`
- The `authorized_keys` onboarding procedure
- Cloudflare Access troubleshooting
- Audit-log expectations
- Break-glass alternatives and their controls

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

## Security posture

*Reduced 2026-09-23 (coherence audit B-C04).* **The supported path for operator SSH is
Cloudflare Access** (MFA-gated, audit-logged by Cloudflare). Any alternative path is a
break-glass event: it is documented privately in `internal-devops`, not here, and its use
must be recorded per the Enclii-first recording requirement — see
[`runbooks/README.md`](./runbooks/README.md).

## Related note on "zero exposed ports"

The public description of the cluster says *zero exposed node ports*. That
means **no NodePort application ingress** — all public application traffic
arrives through the Cloudflare Tunnel. It does not mean nothing listens on the
nodes. See [`INFRASTRUCTURE_STATUS.md`](./archive/INFRASTRUCTURE_STATUS.md#ingress).
