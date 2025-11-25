#!/bin/bash

echo "=== Phase 3: Updating .env and .env.example files ==="
echo ""

# Function to update or add environment variable
update_env_var() {
    local file=$1
    local var_name=$2
    local new_value=$3
    
    if [ -f "$file" ]; then
        if grep -q "^${var_name}=" "$file" 2>/dev/null; then
            sed -i.bak "s|^${var_name}=.*|${var_name}=${new_value}|g" "$file"
            echo "✓ Updated $file ($var_name=$new_value)"
        elif grep -q "^#${var_name}=" "$file" 2>/dev/null; then
            sed -i.bak "s|^#${var_name}=.*|${var_name}=${new_value}|g" "$file"
            echo "✓ Uncommented and updated $file ($var_name=$new_value)"
        else
            echo "${var_name}=${new_value}" >> "$file"
            echo "✓ Added to $file ($var_name=$new_value)"
        fi
    fi
}

# FORJ - Business Zone (8220, 3050, 3051)
echo "📦 FORJ"
update_env_var "forj/.env.example" "API_PORT" "8220"
update_env_var "forj/.env.example" "WEB_PORT" "3050"
update_env_var "forj/.env.example" "DASHBOARD_PORT" "3051"
update_env_var "forj/.env.example" "NEXT_PUBLIC_API_URL" "http://localhost:8220"

# FORTUNA - Data Zone (8110, 8111, 8112)
echo "📊 FORTUNA"
update_env_var "fortuna/.env.example" "API_PORT" "8110"
update_env_var "fortuna/.env.example" "NLP_SERVICE_PORT" "8111"
update_env_var "fortuna/.env.example" "JOBS_SERVICE_PORT" "8112"

# FORGESIGHT - Data Zone (8100, 3010, 3011, 3012)
echo "🔍 FORGESIGHT"
update_env_var "forgesight/.env.example" "API_PORT" "8100"
update_env_var "forgesight/apps/app/.env.example" "PORT" "3011"
update_env_var "forgesight/apps/app/.env.example" "NEXT_PUBLIC_API_URL" "http://localhost:8100"

# BLUEPRINT HARVESTER - Data Zone (8120, 3020-3022)
echo "📐 BLUEPRINT HARVESTER"
update_env_var "blueprint-harvester/.env.example" "API_PORT" "8120"
update_env_var "blueprint-harvester/apps/web/.env.example" "PORT" "3020"
update_env_var "blueprint-harvester/apps/web/.env.example" "NEXT_PUBLIC_API_URL" "http://localhost:8120"

# AUREO LABS - Frontend Zone (3092)
echo "✨ AUREO LABS"
update_env_var "aureo-labs/.env.example" "PORT" "3092"

# PRIMAVERA3D - Frontend Zone (3093, 3094)
echo "🎨 PRIMAVERA3D"
update_env_var "primavera3d/.env.example" "WEB_PORT" "3093"
update_env_var "primavera3d/.env.example" "DOCS_PORT" "3094"

# MADFAM SITE - Frontend Zone (3090, 3091)
echo "🌐 MADFAM SITE"
update_env_var "madfam-site/apps/web/.env.example" "PORT" "3090"
update_env_var "madfam-site/apps/cms/.env.example" "PORT" "3091"

# BLOOM SCROLL - Frontend Zone (3095)
echo "📜 BLOOM SCROLL"
update_env_var "bloom-scroll/backend/.env.example" "PORT" "3095"
update_env_var "bloom-scroll/infrastructure/.env.example" "APP_PORT" "3095"

# SIM4D - Frontend/Business Zone (3080, 3081, 8260)
echo "🎮 SIM4D"
update_env_var "sim4d/apps/studio/.env.example" "PORT" "3080"
update_env_var "sim4d/apps/studio/.env.example" "NEXT_PUBLIC_API_URL" "http://localhost:8260"

# Clean up backup files
echo ""
echo "🧹 Cleaning up backup files..."
find . -name "*.bak" -type f -delete

echo ""
echo "✅ All .env files updated with assigned ports!"
