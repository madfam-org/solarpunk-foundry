# SSH Access (Pointer)

> **This public repo does not document production SSH targets, IPs,
> hardware, or hostnames.** Operational details for node access live
> in the private `internal-devops` repo.

## If you have operator access

See `internal-devops/access/ssh-runbook.md` for:

- Node inventory (hostnames, IPs, hardware specs, location)
- SSH config snippets you can paste into `~/.ssh/config`
- `authorized_keys` onboarding procedure
- Cloudflare Access troubleshooting steps
- Audit-log expectations

## If you just need the public-facing connection method

All MADFAM production SSH goes through a Cloudflare Zero Trust Tunnel
at `ssh.madfam.io`. You need:

1. **cloudflared installed**
   - macOS: `brew install cloudflared`
   - Debian/Ubuntu:
     ```sh
     curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-archive-keyring.gpg
     echo "deb [signed-by=/usr/share/keyrings/cloudflare-archive-keyring.gpg] https://pkg.cloudflare.com/cloudflared focal main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
     sudo apt update && sudo apt install cloudflared
     ```

2. **Ed25519 SSH key** (`ssh-keygen -t ed25519 -C "your-email@example.com"`)

3. **Cloudflare Access authentication**
   ```sh
   cloudflared access login ssh.madfam.io
   ```

4. **Membership in the MADFAM Cloudflare Access policy** — request via
   the contact email in the repo-level README.

Once those are in place, an operator with write access to the node
adds your public key to the right `authorized_keys` and you connect
as documented in `internal-devops`.

## Security posture (public-safe summary)

- No root SSH. User is a non-privileged service account with `sudo`.
- No direct IP access — all SSH flows through the Cloudflare Tunnel.
- MFA enforced via Cloudflare Access policy.
- All connections audit-logged by Cloudflare.

---

*Last updated: 2026-04-17*
