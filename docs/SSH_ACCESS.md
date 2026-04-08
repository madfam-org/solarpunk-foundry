# SSH Access Guide

> **Cloudflare Zero Trust Tunnel Access for MADFAM Infrastructure**

## Quick Start

```bash
ssh ssh.madfam.io
```

That's it. You'll connect as `solarpunk` user. Use `sudo` for admin commands.

---

## Prerequisites

### 1. Install cloudflared

**macOS:**
```bash
brew install cloudflared
```

**Linux:**
```bash
# Debian/Ubuntu
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/cloudflare-archive-keyring.gpg] https://pkg.cloudflare.com/cloudflared focal main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt update && sudo apt install cloudflared
```

### 2. Configure SSH

Add to `~/.ssh/config`:

```
Host ssh.madfam.io
    User solarpunk
    ProxyCommand /usr/local/bin/cloudflared access ssh --hostname %h
    IdentityFile ~/.ssh/id_ed25519

# Control plane (EX44, 37.27.235.104)
Host foundry-cp
    HostName ssh.madfam.io
    User solarpunk
    ProxyCommand /usr/local/bin/cloudflared access ssh --hostname %h
    IdentityFile ~/.ssh/id_ed25519

# Worker node (AX41, 95.217.198.239) - formerly foundry-core
Host foundry-worker-01
    HostName ssh.madfam.io
    User solarpunk
    ProxyCommand /usr/local/bin/cloudflared access ssh --hostname %h
    IdentityFile ~/.ssh/id_ed25519
```

**Note:** On Linux, cloudflared is usually at `/usr/bin/cloudflared`. Adjust the ProxyCommand path accordingly.

### 3. Generate SSH Key (if needed)

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

### 4. Add Your Key to Server

Have an existing team member add your public key:

```bash
# On the server (via existing SSH access)
echo 'ssh-ed25519 AAAA... your-email@example.com' >> /home/solarpunk/.ssh/authorized_keys
```

### 5. Authenticate with Cloudflare

First-time connection will prompt browser authentication:

```bash
cloudflared access login ssh.madfam.io
# Browser opens for Cloudflare Access authentication
```

---

## Connection Details

| Property | Value |
|----------|-------|
| SSH Host | `ssh.madfam.io` |
| User | `solarpunk` |
| Control Plane | foundry-cp (EX44, 37.27.235.104, i5-13500 14C/20T, 128GB) |
| Worker Node | foundry-worker-01 (AX41, 95.217.198.239) -- formerly foundry-core |
| Builder Node | foundry-builder-01 |
| K3s API | 37.27.235.104:6443 |
| Topology | 3-node K3s cluster |
| Location | Hetzner HEL1 (Helsinki, Finland) |
| Access Method | Cloudflare Zero Trust Tunnel |

---

## Common Commands

```bash
# Connect
ssh ssh.madfam.io

# Run command directly
ssh ssh.madfam.io "docker ps"

# Admin commands (require sudo)
ssh ssh.madfam.io "sudo systemctl status cloudflared"

# Port forward (e.g., for database access)
ssh -L 5432:localhost:5432 ssh.madfam.io
```

---

## Troubleshooting

### Host Key Verification Failed
```bash
ssh-keygen -R ssh.madfam.io
ssh -o StrictHostKeyChecking=accept-new ssh.madfam.io
```

### Permission Denied (publickey)
1. Verify your key is added to `/home/solarpunk/.ssh/authorized_keys`
2. Ensure `User solarpunk` (not root) in SSH config
3. Re-authenticate: `cloudflared access login ssh.madfam.io`

### Connection Timeout
1. Check cloudflared is installed: `which cloudflared`
2. Verify ProxyCommand path matches your cloudflared location
3. Test cloudflared directly: `cloudflared access ssh --hostname ssh.madfam.io`

### Token Expired
```bash
cloudflared access login ssh.madfam.io
```

---

## Security Notes

- **No root login**: SSH as root is disabled. Use `solarpunk` + `sudo`
- **No direct IP access**: All access via Cloudflare Zero Trust tunnel
- **MFA required**: Cloudflare Access enforces authentication
- **Audit logged**: All connections logged via Cloudflare

---

## Authorized Emails

Access is restricted to these Cloudflare Access policy members:
- admin@madfam.io
- innovacionesmadfam@proton.me

Contact these addresses to request access.

---

*Last updated: December 2025*
