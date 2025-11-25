#!/bin/bash

echo "=== Path Resolution Verification Test ==="
echo ""

# Test 1: Direct execution
echo "📋 Test 1: Direct Execution"
echo "Command: cd ~/labspace/solarpunk-foundry/ops/bin && ./madfam.sh"
echo ""

# Extract path resolution logic from madfam.sh
SOURCE=${BASH_SOURCE[0]}
while [ -L "$SOURCE" ]; do
  DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
  SOURCE=$(readlink "$SOURCE")
  [[ $SOURCE != /* ]] && SOURCE=$DIR/$SOURCE
done
SCRIPT_DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
FOUNDRY_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LABSPACE_ROOT="$(cd "$FOUNDRY_ROOT/.." && pwd)"

echo "  SCRIPT_DIR:    $SCRIPT_DIR"
echo "  FOUNDRY_ROOT:  $FOUNDRY_ROOT"
echo "  LABSPACE_ROOT: $LABSPACE_ROOT"
echo ""

# Test 2: Symlink execution
echo "📋 Test 2: Symlink Execution Simulation"
echo "Command: cd ~/labspace && ln -s solarpunk-foundry/ops/bin/madfam.sh madfam && ./madfam"
echo ""

# Create test symlink
TEST_SYMLINK="/tmp/madfam-test-symlink"
ln -sf "$HOME/labspace/solarpunk-foundry/ops/bin/madfam.sh" "$TEST_SYMLINK"

# Resolve symlink
SOURCE="$TEST_SYMLINK"
while [ -L "$SOURCE" ]; do
  DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
  SOURCE=$(readlink "$SOURCE")
  [[ $SOURCE != /* ]] && SOURCE=$DIR/$SOURCE
done
SCRIPT_DIR_SYMLINK=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
FOUNDRY_ROOT_SYMLINK="$(cd "$SCRIPT_DIR_SYMLINK/../.." && pwd)"
LABSPACE_ROOT_SYMLINK="$(cd "$FOUNDRY_ROOT_SYMLINK/.." && pwd)"

echo "  SCRIPT_DIR:    $SCRIPT_DIR_SYMLINK"
echo "  FOUNDRY_ROOT:  $FOUNDRY_ROOT_SYMLINK"
echo "  LABSPACE_ROOT: $LABSPACE_ROOT_SYMLINK"
echo ""

# Verification
echo "🔍 Verification Results:"
echo ""

EXPECTED_FOUNDRY="$HOME/labspace/solarpunk-foundry"
EXPECTED_LABSPACE="$HOME/labspace"

if [ "$FOUNDRY_ROOT" = "$EXPECTED_FOUNDRY" ]; then
    echo "  ✅ Direct execution: FOUNDRY_ROOT correct"
else
    echo "  ❌ Direct execution: FOUNDRY_ROOT incorrect"
    echo "     Expected: $EXPECTED_FOUNDRY"
    echo "     Got:      $FOUNDRY_ROOT"
fi

if [ "$FOUNDRY_ROOT_SYMLINK" = "$EXPECTED_FOUNDRY" ]; then
    echo "  ✅ Symlink execution: FOUNDRY_ROOT correct"
else
    echo "  ❌ Symlink execution: FOUNDRY_ROOT incorrect"
    echo "     Expected: $EXPECTED_FOUNDRY"
    echo "     Got:      $FOUNDRY_ROOT_SYMLINK"
fi

if [ "$LABSPACE_ROOT" = "$EXPECTED_LABSPACE" ]; then
    echo "  ✅ Direct execution: LABSPACE_ROOT correct"
else
    echo "  ❌ Direct execution: LABSPACE_ROOT incorrect"
fi

if [ "$LABSPACE_ROOT_SYMLINK" = "$EXPECTED_LABSPACE" ]; then
    echo "  ✅ Symlink execution: LABSPACE_ROOT correct"
else
    echo "  ❌ Symlink execution: LABSPACE_ROOT incorrect"
fi

# Check if configs exist at resolved paths
echo ""
echo "📁 Config File Verification:"
SHARED_COMPOSE="$FOUNDRY_ROOT_SYMLINK/ops/local/docker-compose.shared.yml"
if [ -f "$SHARED_COMPOSE" ]; then
    echo "  ✅ docker-compose.shared.yml found at correct location"
else
    echo "  ❌ docker-compose.shared.yml NOT found"
    echo "     Searched: $SHARED_COMPOSE"
fi

# Cleanup
rm -f "$TEST_SYMLINK"

echo ""
echo "=== Test Complete ==="
