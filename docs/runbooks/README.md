# MADFAM Production Runbooks

Operational procedures for the MADFAM ecosystem on Hetzner/k3s infrastructure.

## Quick Reference

| Runbook | Purpose | When to Use |
|---------|---------|-------------|
| [Incident Response](./incident-response.md) | Handle production incidents | Service down, errors spike, alerts fire |
| [Backup & Restore](./backup-restore.md) | Data recovery procedures | Data loss, corruption, DR testing |
| [Rollback](./rollback.md) | Revert deployments | Bad release, regression detected |
| [Scaling](./scaling.md) | Adjust capacity | High load, resource exhaustion |
| [Certificate Renewal](./certificates.md) | SSL/TLS management | Cert expiry warnings |

## Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Cloudflare Tunnels                          │
│  *.janua.dev, *.enclii.madfam.io → cloudflared                 │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────┐
│                    Hetzner bare-metal (3-node k3s)              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   k3s Cluster                            │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │janua-api │ │janua-dash│ │janua-admin│ │janua-docs│   │   │
│  │  │  :4100   │ │  :4101   │ │  :4102   │ │  :4103   │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Data Layer (Docker)                      │   │
│  │  ┌──────────┐ ┌──────────┐                              │   │
│  │  │PostgreSQL│ │  Redis   │  ZFS Pool: tank              │   │
│  │  │  :5432   │ │  :6379   │  28TB, 3-way mirror          │   │
│  │  └──────────┘ └──────────┘                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Access

**SSH Access** (via Cloudflare Tunnel):
```bash
ssh ssh.madfam.io
```

**Kubernetes**:
```bash
ssh ssh.madfam.io "sudo kubectl get pods -n janua"
```

**Docker**:
```bash
ssh ssh.madfam.io "docker ps"
```

## Key Paths

| Path | Purpose |
|------|---------|
| `/opt/solarpunk/janua` | Janua repo and runtime |
| `/opt/solarpunk/enclii` | Enclii repo and runtime |
| `/opt/solarpunk/scripts` | Operational scripts |
| `/opt/solarpunk/secrets` | Sensitive configuration |
| `/tank/backups` | ZFS backup destination |

## Contact

- **On-call**: @aldoruizluna
- **GitHub**: github.com/madfam-io
- **Status**: status.janua.dev (planned)
