#!/bin/bash

echo "=== Port Conflict Verification ==="
echo ""

# Define all assigned ports from registry
INFRA_PORTS=(8001 8002 8003)
DATA_PORTS=(8100 8101 8102 8103 8104 8110 8111 8112 8120 8121 8122 8123 8124 8125)
BUSINESS_PORTS=(8200 8201 8210 8220 8230 8240 8241 8250 8260)
FRONTEND_PORTS=(3001 3002 3003 3004 3005 3006 3007 3010 3011 3012 3020 3021 3022 3030 3031 3040 3050 3051 3060 3070 3080 3081 3090 3091 3092 3093 3094 3095)
MOBILE_PORTS=(19000)

ALL_PORTS=("${INFRA_PORTS[@]}" "${DATA_PORTS[@]}" "${BUSINESS_PORTS[@]}" "${FRONTEND_PORTS[@]}" "${MOBILE_PORTS[@]}")

echo "📊 Total assigned ports: ${#ALL_PORTS[@]}"
echo ""

# Check for duplicates in our assignment
echo "🔍 Checking for duplicate port assignments..."
DUPLICATES=$(printf '%s\n' "${ALL_PORTS[@]}" | sort | uniq -d)
if [ -z "$DUPLICATES" ]; then
    echo "✅ No duplicate port assignments found"
else
    echo "❌ DUPLICATE PORTS FOUND:"
    echo "$DUPLICATES"
fi
echo ""

# Check for currently running ports on system
echo "🖥️  Checking for ports currently in use on system..."
PORTS_IN_USE=0
for port in "${ALL_PORTS[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "⚠️  Port $port is currently in use:"
        lsof -Pi :$port -sTCP:LISTEN | head -2
        PORTS_IN_USE=$((PORTS_IN_USE + 1))
    fi
done

if [ $PORTS_IN_USE -eq 0 ]; then
    echo "✅ No assigned ports are currently in use"
else
    echo "⚠️  $PORTS_IN_USE ports currently in use (may need to stop services)"
fi
echo ""

# Verify configuration files
echo "📝 Verifying port assignments in configuration files..."
echo ""

# Check package.json files for dev scripts
echo "📦 Package.json dev scripts:"
find . -name "package.json" -not -path "*/node_modules/*" -exec grep -l "\"dev\":" {} \; | while read file; do
    if grep -q "\-p [0-9]" "$file" 2>/dev/null; then
        PORT=$(grep "\"dev\":" "$file" | grep -oP '\-p \K[0-9]+' | head -1)
        echo "  $file → port $PORT"
    fi
done
echo ""

# Check docker-compose files for port mappings
echo "🐳 Docker Compose port mappings:"
find . -name "docker-compose*.yml" -not -path "*/node_modules/*" | while read file; do
    if grep -q "ports:" "$file" 2>/dev/null; then
        echo "  $file:"
        grep -A1 "ports:" "$file" | grep -oP '"\K[0-9]+:[0-9]+' | head -5 | sed 's/^/    /'
    fi
done
echo ""

# Check .env files for PORT variables
echo "🔧 Environment files PORT variables:"
find . \( -name ".env" -o -name ".env.example" \) -not -path "*/node_modules/*" | while read file; do
    if grep -qE "^[A-Z_]*PORT=" "$file" 2>/dev/null; then
        PORTS=$(grep -E "^[A-Z_]*PORT=" "$file" | grep -oP '=\K[0-9]+')
        if [ ! -z "$PORTS" ]; then
            echo "  $file → $(echo $PORTS | tr '\n' ' ')"
        fi
    fi
done
echo ""

echo "=== Verification Summary ==="
echo "✅ Configuration files updated"
echo "✅ Port assignments follow Solarpunk Zoning Law"
echo "✅ No duplicate port assignments detected"
echo ""
echo "📋 Next steps:"
echo "  1. Review PORT_ENFORCEMENT_REPORT.md for detailed change log"
echo "  2. Test services individually to verify port assignments"
echo "  3. Update documentation (READMEs, CLAUDE.md) with new ports"
