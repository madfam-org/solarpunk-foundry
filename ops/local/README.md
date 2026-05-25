# MADFAM Local Development Stack

Complete local development environment for the MADFAM ecosystem.

## Quick Start

```bash
# 1. Start shared infrastructure
cd ~/labspace/solarpunk-foundry/ops/local
docker compose -f docker-compose.shared.yml up -d

# 2. (Optional) Start observability stack (PostHog)
./start-observability.sh

# 3. Verify all services are running
docker ps

# 4. Start individual apps (choose what you need)
cd ~/labspace/janua && docker compose -f docker-compose.dev.yml up -d
cd ~/labspace/digifab-quoting && docker compose -f docker-compose.dev.yml up -d
cd ~/labspace/dhanam && docker compose -f docker-compose.dev.yml up -d
cd ~/labspace/avala && docker compose -f docker-compose.dev.yml up -d
cd ~/labspace/forj && docker compose -f docker-compose.dev.yml up -d
```

## Shared Infrastructure

| Service | Container | Port | URL |
|---------|-----------|------|-----|
| PostgreSQL | madfam-postgres-shared | 5432 | `postgresql://madfam:madfam_dev_password@localhost:5432` |
| Redis | madfam-redis-shared | 6379 | `redis://:redis_dev_password@localhost:6379` |
| MinIO API | madfam-minio-shared | 9000 | http://localhost:9000 |
| MinIO Console | madfam-minio-shared | 9001 | http://localhost:9001 |
| MailHog SMTP | madfam-mailhog | 1025 | smtp://localhost:1025 |
| MailHog UI | madfam-mailhog | 8025 | http://localhost:8025 |

## Observability Stack (Optional)

| Service | Container | Port | URL |
|---------|-----------|------|-----|
| PostHog | madfam-posthog | 8100 | http://localhost:8100 |
| PostHog ClickHouse | madfam-posthog-clickhouse | - | Internal |
| PostHog Kafka | madfam-posthog-kafka | - | Internal |
| PostHog Redis | madfam-posthog-redis | - | Internal |
| PostHog PostgreSQL | madfam-posthog-postgres | - | Internal |

### Starting Observability

```bash
./start-observability.sh
```

### First-Time PostHog Setup

1. Open http://localhost:8100
2. Create your admin account
3. Copy your Project API Key
4. Add to your apps' `.env` files:

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_key
NEXT_PUBLIC_POSTHOG_HOST=http://localhost:8100
```

### Using @madfam/analytics

Install the shared analytics package:

```bash
pnpm add @madfam/analytics
```

See `packages/analytics/README.md` for usage instructions.

## Application Ports

### Core Apps
| App | API Port | Web Port |
|-----|----------|----------|
| Janua | 4000 | 4001 |
| Cotiza (digifab-quoting) | 3010 | 3011 |
| Forgesight | 3020 | 3021 |
| MADFAM Site | - | 3000 |

### Extended Apps
| App | API Port | Web Port |
|-----|----------|----------|
| Dhanam | 3030 | 3031 |
| Avala | 3040 | 3041 |
| Forj | 3051 | 3052 (Dashboard) |

## Databases

Each app has its own database in the shared PostgreSQL instance:

| App | Database | Redis DB |
|-----|----------|----------|
| Janua | janua_db | 0 |
| Cotiza | cotiza_db | 1 |
| Forgesight | forgesight_db | 2 |
| Dhanam | dhanam_db | 3 |
| Avala | avala_db | 4 |
| Forj | forj_db | 5 |
| Fortuna | fortuna_db | 6 |
| Blueprint | blueprint_db | 7 |

## S3 Buckets (MinIO)

| App | Bucket |
|-----|--------|
| Janua | janua-uploads |
| Cotiza | cotiza-stl-files |
| Forgesight | forgesight-vendor-data |
| Dhanam | dhanam-uploads |
| Avala | avala-uploads |
| Forj | forj-uploads |
| Blueprint | blueprint-harvester-models |

## Authentication

All apps use Janua as the central authentication hub:

- **JWT Secret**: `<JANUA_JWT_SECRET_FROM_LOCAL_ENV>`
- **Janua API**: http://localhost:4000 (external) / http://janua-api:4000 (internal)

## Email Testing

All emails are captured by MailHog in development:

- **SMTP**: localhost:1025
- **Web UI**: http://localhost:8025

## Useful Commands

```bash
# View all running containers
docker ps

# View logs for a specific container
docker logs -f madfam-postgres-shared

# Connect to PostgreSQL
docker exec -it madfam-postgres-shared psql -U madfam -d janua_db

# Connect to Redis
docker exec -it madfam-redis-shared redis-cli -a redis_dev_password

# Stop all shared infrastructure
docker compose -f docker-compose.shared.yml down

# Stop all and remove volumes (DESTRUCTIVE)
docker compose -f docker-compose.shared.yml down -v
```

## Troubleshooting

### Network Issues
Ensure the shared network exists:
```bash
docker network ls | grep madfam-shared-network
# If missing, start the shared infrastructure first
```

### Database Not Found
Run the provisioner:
```bash
docker exec madfam-postgres-shared psql -U madfam -f /docker-entrypoint-initdb.d/01-init-dbs.sql
```

### MinIO Buckets Missing
Re-run the provisioner:
```bash
docker compose -f docker-compose.shared.yml up minio-provisioner
```
