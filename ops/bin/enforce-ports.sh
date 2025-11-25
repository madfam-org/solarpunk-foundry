#!/bin/bash
set -e

echo "🚀 Enforcing Solarpunk Zoning Law - Port Configuration Update"
echo "=============================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

MODIFIED_FILES=()

# Function to update package.json dev script
update_package_json() {
    local file=$1
    local old_port=$2
    local new_port=$3
    
    if [ -f "$file" ]; then
        if grep -q "\"dev\".*$old_port" "$file" 2>/dev/null; then
            sed -i.bak "s/\"dev\":\([^\"]*\)$old_port/\"dev\":\1$new_port/g" "$file"
            echo -e "${GREEN}✓${NC} Updated $file (port $old_port → $new_port)"
            MODIFIED_FILES+=("$file")
            rm "${file}.bak" 2>/dev/null || true
        fi
    fi
}

# Function to update docker-compose.yml
update_docker_compose() {
    local file=$1
    local service=$2
    local old_port=$3
    local new_port=$4
    
    if [ -f "$file" ]; then
        if grep -q "\"$old_port:" "$file" 2>/dev/null; then
            sed -i.bak "s/\"$old_port:\([0-9]*\)\"/\"$new_port:\1\"/g" "$file"
            echo -e "${GREEN}✓${NC} Updated $file ($service: $old_port → $new_port)"
            MODIFIED_FILES+=("$file")
            rm "${file}.bak" 2>/dev/null || true
        fi
    fi
}

# Function to update .env files
update_env_file() {
    local file=$1
    local var_name=$2
    local old_port=$3
    local new_port=$4
    
    if [ -f "$file" ]; then
        if grep -q "$var_name.*$old_port" "$file" 2>/dev/null; then
            sed -i.bak "s/$var_name=\([^:]*:\)$old_port/$var_name=\1$new_port/g" "$file"
            sed -i.bak "s/$var_name=$old_port/$var_name=$new_port/g" "$file"
            echo -e "${GREEN}✓${NC} Updated $file ($var_name port $old_port → $new_port)"
            MODIFIED_FILES+=("$file")
            rm "${file}.bak" 2>/dev/null || true
        fi
    fi
}

cd ~/labspace

echo "📦 Updating Infrastructure Zone (8000-8099)..."
echo "----------------------------------------------"

# Janua API (4000 → 8001)
update_env_file "janua/apps/api/.env.example" "PORT" "4000" "8001"
update_docker_compose "janua/docker-compose.yml" "api" "4000" "8001"

# Janua Frontend Apps
update_env_file "janua/apps/landing/.env.example" "PORT" "3000" "3001"
update_env_file "janua/apps/landing/.env.example" "NEXT_PUBLIC_API_URL" "4000" "8001"
update_env_file "janua/apps/dashboard/.env.example" "PORT" "3001" "3002"
update_env_file "janua/apps/demo/.env.example" "PORT" "3002" "3003"
update_env_file "janua/apps/docs/.env.example" "PORT" "3003" "3005"

# Enclii (8080 → 8002)
update_env_file "enclii/.env.example" "ENCLII_PORT" "8080" "8002"

echo ""
echo "📡 Updating Data Zone (8100-8199)..."
echo "-------------------------------------"

# Forge Sight API (8000 → 8100)
update_env_file "forgesight/.env.example" "API_PORT" "8000" "8100"
update_env_file "forgesight/services/api/.env.example" "PORT" "8000" "8100"
update_docker_compose "forgesight/docker-compose.yml" "api" "8000" "8100"

# Forge Sight Frontends
update_env_file "forgesight/apps/www/.env.example" "PORT" "3000" "3010"
update_env_file "forgesight/apps/www/.env.example" "NEXT_PUBLIC_API_URL" "8000" "8100"
update_env_file "forgesight/apps/app/.env.example" "PORT" "3001" "3011"
update_env_file "forgesight/apps/app/.env.example" "NEXT_PUBLIC_API_URL" "8000" "8100"

# Fortuna API (8080 → 8110)
update_env_file "fortuna/.env.example" "API_PORT" "8080" "8110"
update_docker_compose "fortuna/docker-compose.yml" "api" "8080" "8110"

# Blueprint Harvester API (8000 → 8120)
update_env_file "blueprint-harvester/.env.example" "API_PORT" "8000" "8120"

echo ""
echo "⚙️  Updating Business Zone (8200-8299)..."
echo "------------------------------------------"

# Cotiza/digifab-quoting API (4000 → 8200)
update_env_file "digifab-quoting/apps/api/.env.example" "PORT" "4000" "8200"
update_docker_compose "digifab-quoting/docker-compose.yml" "api" "4000" "8200"
update_env_file "digifab-quoting/apps/web/.env.example" "NEXT_PUBLIC_API_URL" "4000" "8200"
update_env_file "digifab-quoting/apps/web/.env.example" "PORT" "3002" "3030"

# Dhanam API (4000 → 8210)
update_env_file "dhanam/apps/api/.env.example" "PORT" "4000" "8210"
update_docker_compose "dhanam/docker-compose.yml" "api" "4000" "8210"
update_env_file "dhanam/apps/web/.env.example" "NEXT_PUBLIC_API_URL" "4000" "8210"
update_env_file "dhanam/apps/web/.env.example" "PORT" "3000" "3040"

# Forj API (3001 → 8220)
update_env_file "forj/apps/api/.env.example" "PORT" "3001" "8220"
update_env_file "forj/apps/web/.env.example" "NEXT_PUBLIC_API_URL" "3001" "8220"
update_env_file "forj/apps/web/.env.example" "PORT" "3000" "3050"
update_env_file "forj/apps/dashboard/.env.example" "PORT" "3002" "3051"

# Galvana/electrochem-sim API (8080 → 8240)
update_env_file "electrochem-sim/.env.example" "API_PORT" "8080" "8240"
update_env_file "electrochem-sim/apps/web/.env.example" "NEXT_PUBLIC_API_URL" "8080" "8240"
update_env_file "electrochem-sim/apps/web/.env.example" "PORT" "3000" "3060"

# AVALA API (4000 → 8250)
update_env_file "avala/.env.example" "PORT" "4000" "8250"
update_env_file "avala/apps/web/.env.example" "NEXT_PUBLIC_API_URL" "4000" "8250"
update_env_file "avala/apps/web/.env.example" "PORT" "3000" "3070"

# Sim4D (8080 → 8260)
update_env_file "sim4d/.env.example" "COLLAB_PORT" "8080" "8260"
update_docker_compose "sim4d/docker-compose.yml" "collab" "8080" "8260"

echo ""
echo "🌐 Updating Frontend Zone (3000-3099)..."
echo "-----------------------------------------"

# MADFAM Site
update_env_file "madfam-site/apps/web/.env.example" "PORT" "3000" "3090"

# Aureo Labs
if [ -f "aureo-labs/.env.example" ]; then
    update_env_file "aureo-labs/.env.example" "PORT" "3000" "3092"
fi

# Primavera3D
update_env_file "primavera3d/apps/web/.env.example" "PORT" "3000" "3093"
update_env_file "primavera3d/apps/docs/.env.example" "PORT" "3001" "3094"

echo ""
echo "=============================================================="
echo "✅ Port enforcement complete!"
echo ""
echo "📊 Summary:"
echo "  Modified files: ${#MODIFIED_FILES[@]}"
if [ ${#MODIFIED_FILES[@]} -gt 0 ]; then
    echo ""
    echo "Modified files:"
    for file in "${MODIFIED_FILES[@]}"; do
        echo "  - $file"
    done
fi

echo ""
echo "🔍 Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Test locally: docker compose up -d"
echo "  3. Check for port conflicts: ./check-ports.sh"
echo "  4. Commit changes: git add . && git commit -m 'chore: enforce Solarpunk Zoning Law port assignments'"
