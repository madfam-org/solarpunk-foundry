#!/bin/bash

# ============================================
# Database Verification Script
# ============================================
# Verifies that all expected databases exist
# in the shared PostgreSQL instance

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTAINER_NAME="madfam-postgres-shared"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   PostgreSQL Database Verification    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}✗${NC} PostgreSQL container is not running"
    echo "  Run: ./madfam.sh start"
    exit 1
fi

echo -e "${GREEN}✓${NC} PostgreSQL container is running"
echo ""

# Expected databases
EXPECTED_DBS=(
    "postgres"
    "madfam"
    "janua_db"
    "cotiza_db"
    "forgesight_db"
    "dhanam_db"
    "avala_db"
    "fortuna_db"
    "blueprint_db"
)

echo -e "${BLUE}Checking databases...${NC}"
echo ""

# Get list of databases
DATABASES=$(docker exec "$CONTAINER_NAME" psql -U madfam -t -c "SELECT datname FROM pg_database WHERE datistemplate = false;")

# Check each expected database
ALL_FOUND=true
for db in "${EXPECTED_DBS[@]}"; do
    if echo "$DATABASES" | grep -q "^ *${db}$"; then
        echo -e "  ${GREEN}✓${NC} $db"
    else
        echo -e "  ${RED}✗${NC} $db ${YELLOW}(MISSING)${NC}"
        ALL_FOUND=false
    fi
done

echo ""

if $ALL_FOUND; then
    echo -e "${GREEN}✓${NC} All databases verified successfully!"
    echo ""

    # Show database sizes
    echo -e "${BLUE}Database sizes:${NC}"
    docker exec "$CONTAINER_NAME" psql -U madfam -c "\l+" | grep -E "(madfam|janua_db|cotiza_db|forgesight_db|dhanam_db|avala_db|fortuna_db|blueprint_db)"

    exit 0
else
    echo -e "${RED}✗${NC} Some databases are missing!"
    echo ""
    echo "To fix this:"
    echo "  1. Stop and clean the infrastructure:"
    echo "     ./madfam.sh stop --clean"
    echo ""
    echo "  2. Restart to reinitialize databases:"
    echo "     ./madfam.sh start"
    exit 1
fi
