# Solarpunk Foundry Infrastructure

> Shared infrastructure configurations for the MADFAM ecosystem

## Directory Structure

```
infrastructure/
├── INFRASTRUCTURE.md      # Layer 1 "Soil" reference guide (Hetzner, ZFS, Docker)
├── terraform/             # Hetzner + Cloudflare provisioning
│   ├── main.tf
│   ├── cloudflare.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── modules/           # Reusable Terraform modules
│   └── templates/         # Service deployment templates
├── kubernetes/            # K8s manifests and patterns
│   ├── api-deployment.yml
│   └── production/        # Production-specific configs
├── monitoring/            # Observability stack
│   ├── prometheus.yml
│   ├── apm-stack.yml
│   └── grafana-dashboard.json
├── database/              # PostgreSQL patterns
│   ├── replication-setup.yml
│   └── postgresql-primary.conf
├── redis/                 # Redis cluster config
│   └── redis-cluster.yml
├── backup/                # Backup strategies
│   ├── backup-strategy.md
│   └── postgres-backup.sh
└── nginx/                 # Reverse proxy configs
    └── nginx-ssl.conf
```

## Quick Reference

### Current Production Server

| Property | Value |
|----------|-------|
| Provider | Hetzner (AX41-NVMe) |
| Location | Finland (HEL1) |
| IP | `95.217.198.239` |
| Hostname | `enclii-core` |
| OS | Ubuntu 24.04 LTS |
| Storage | ZFS Mirror (rpool) |

### Service Port Allocation

| Block | Range | Project |
|-------|-------|---------|
| 4100-4199 | Janua | Identity & Auth |
| 4200-4299 | Enclii | PaaS Platform |
| 4300-4399 | ForgeSight | Pricing Data |
| 4400-4499 | Fortuna | Problem Intel |
| 4500-4599 | Cotiza | Quoting Engine |
| 4600-4699 | AVALA | Verification |
| 4700-4799 | Dhanam | Treasury |

See `docs/PORT_ALLOCATION.md` for complete registry.

## Usage

### Terraform Provisioning

```bash
cd infrastructure/terraform

# Initialize
terraform init

# Plan changes
terraform plan -var-file=terraform.tfvars

# Apply
terraform apply -var-file=terraform.tfvars
```

### Database Backup

```bash
# Manual backup
./infrastructure/backup/postgres-backup.sh

# Or via ZFS snapshot (preferred)
ssh root@95.217.198.239 "zfs snapshot rpool/data/postgres@$(date +%Y%m%d)"
```

### Monitoring Stack

```bash
# Deploy monitoring
docker-compose -f infrastructure/monitoring/apm-stack.yml up -d
```

## Project-Specific Deployment

Each project maintains its own deployment configs:

| Project | Location | Contents |
|---------|----------|----------|
| Janua | `janua/deployment/` | Helm chart, production compose, dev compose |
| Enclii | `enclii/deployment/` | Builder configs, registry setup |
| Others | `<project>/deployment/` | Project-specific deployment |

Shared infrastructure patterns live here in foundry.

## Related Documentation

- [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) - Complete server setup reference
- [PORT_ALLOCATION.md](../docs/PORT_ALLOCATION.md) - Service port registry
- [DOGFOODING_GUIDE.md](../docs/DOGFOODING_GUIDE.md) - Local development setup

---

*Solarpunk Foundry Infrastructure - Self-hosted, sovereign, sustainable*
