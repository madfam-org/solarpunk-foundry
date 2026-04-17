#!/bin/bash
set -e

echo "🔧 Phase 2: Additional Port Enforcement"
echo "========================================"
echo ""

cd ~/labspace

# Update root-level .env.example files
echo "📝 Updating root-level configuration files..."

# Janua root
if [ -f "janua/.env.example" ]; then
    sed -i.bak 's/API_PORT=4000/API_PORT=8001/g' janua/.env.example
    sed -i.bak 's/:4000/:8001/g' janua/.env.example
    echo "✓ Updated janua/.env.example"
    rm janua/.env.example.bak 2>/dev/null || true
fi

# Forgesight root
if [ -f "forgesight/.env.example" ]; then
    sed -i.bak 's/API_PORT=8000/API_PORT=8100/g' forgesight/.env.example
    sed -i.bak 's/:8000/:8100/g' forgesight/.env.example
    echo "✓ Updated forgesight/.env.example"
    rm forgesight/.env.example.bak 2>/dev/null || true
fi

# Fortuna root
if [ -f "fortuna/.env.example" ]; then
    sed -i.bak 's/API_PORT=8080/API_PORT=8110/g' fortuna/.env.example
    sed -i.bak 's/:8080/:8110/g' fortuna/.env.example
    echo "✓ Updated fortuna/.env.example"
    rm fortuna/.env.example.bak 2>/dev/null || true
fi

# Digifab-quoting root
if [ -f "digifab-quoting/.env.example" ]; then
    sed -i.bak 's/API_PORT=4000/API_PORT=8200/g' digifab-quoting/.env.example
    sed -i.bak 's/:4000/:8200/g' digifab-quoting/.env.example
    sed -i.bak 's/WEB_PORT=3002/WEB_PORT=3030/g' digifab-quoting/.env.example
    sed -i.bak 's/:3002/:3030/g' digifab-quoting/.env.example
    echo "✓ Updated digifab-quoting/.env.example"
    rm digifab-quoting/.env.example.bak 2>/dev/null || true
fi

# Forj root
if [ -f "forj/.env.example" ]; then
    sed -i.bak 's/API_PORT=3001/API_PORT=8220/g' forj/.env.example
    sed -i.bak 's/:3001/:8220/g' forj/.env.example
    sed -i.bak 's/WEB_PORT=3000/WEB_PORT=3050/g' forj/.env.example
    sed -i.bak 's/:3000/:3050/g' forj/.env.example
    echo "✓ Updated forj/.env.example"
    rm forj/.env.example.bak 2>/dev/null || true
fi

# Primavera3D root
if [ -f "primavera3d/.env.example" ]; then
    sed -i.bak 's/:3000/:3093/g' primavera3d/.env.example
    sed -i.bak 's/PORT=3000/PORT=3093/g' primavera3d/.env.example
    echo "✓ Updated primavera3d/.env.example"
    rm primavera3d/.env.example.bak 2>/dev/null || true
fi

# Innovaciones MADFAM
if [ -f "madfam/.env.example" ]; then
    sed -i.bak 's/:3000/:3092/g' madfam/.env.example
    sed -i.bak 's/PORT=3000/PORT=3092/g' madfam/.env.example
    echo "✓ Updated madfam/.env.example"
    rm madfam/.env.example.bak 2>/dev/null || true
fi

# Update NEXT_PUBLIC_API_URL in all frontend .env.example files
echo ""
echo "🔗 Updating API URL references in frontend apps..."

# Janua apps
for app in landing dashboard demo docs admin marketing; do
    if [ -f "janua/apps/$app/.env.example" ]; then
        sed -i.bak 's|http://localhost:4000|http://localhost:8001|g' "janua/apps/$app/.env.example"
        sed -i.bak 's|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://localhost:8001|g' "janua/apps/$app/.env.example"
        echo "✓ Updated janua/apps/$app/.env.example API URL"
        rm "janua/apps/$app/.env.example.bak" 2>/dev/null || true
    fi
done

# Forgesight apps
if [ -f "forgesight/apps/www/.env.example" ]; then
    sed -i.bak 's|http://localhost:8000|http://localhost:8100|g' forgesight/apps/www/.env.example
    echo "✓ Updated forgesight/apps/www/.env.example API URL"
    rm forgesight/apps/www/.env.example.bak 2>/dev/null || true
fi

# Dhanam mobile
if [ -f "dhanam/apps/mobile/.env.example" ]; then
    sed -i.bak 's|http://localhost:4000|http://localhost:8210|g' dhanam/apps/mobile/.env.example
    sed -i.bak 's|API_URL=.*4000|API_URL=http://localhost:8210|g' dhanam/apps/mobile/.env.example
    echo "✓ Updated dhanam/apps/mobile/.env.example API URL"
    rm dhanam/apps/mobile/.env.example.bak 2>/dev/null || true
fi

# Forj apps
if [ -f "forj/apps/dashboard/.env.example" ]; then
    sed -i.bak 's|http://localhost:3001|http://localhost:8220|g' forj/apps/dashboard/.env.example
    echo "✓ Updated forj/apps/dashboard/.env.example API URL"
    rm forj/apps/dashboard/.env.example.bak 2>/dev/null || true
fi

# Update package.json dev scripts that specify ports
echo ""
echo "📦 Updating package.json dev scripts..."

# MADFAM Site
if [ -f "madfam-site/apps/web/package.json" ]; then
    sed -i.bak 's/"dev": "next dev"/"dev": "next dev -p 3090"/g' madfam-site/apps/web/package.json
    echo "✓ Updated madfam-site/apps/web/package.json"
    rm madfam-site/apps/web/package.json.bak 2>/dev/null || true
fi

# Sim4D apps
if [ -f "sim4d/apps/studio/package.json" ]; then
    sed -i.bak 's/"dev": "next dev"/"dev": "next dev -p 3080"/g' sim4d/apps/studio/package.json
    echo "✓ Updated sim4d/apps/studio/package.json"
    rm sim4d/apps/studio/package.json.bak 2>/dev/null || true
fi

if [ -f "sim4d/apps/marketing/package.json" ]; then
    sed -i.bak 's/"dev": "next dev"/"dev": "next dev -p 3081"/g' sim4d/apps/marketing/package.json
    echo "✓ Updated sim4d/apps/marketing/package.json"
    rm sim4d/apps/marketing/package.json.bak 2>/dev/null || true
fi

echo ""
echo "✅ Phase 2 complete!"
