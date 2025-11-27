# Path Resolution Fix - Symlink Safe

## Problem Identified ❌

The original path resolution in `madfam.sh` used:
```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
```

**Issue**: When executed via symlink (e.g., `~/labspace/madfam`), `${BASH_SOURCE[0]}` resolves to the **symlink location** (`~/labspace`) rather than the **actual script location** (`~/labspace/solarpunk-foundry/ops/bin`).

**Result**: Script searched for configs in wrong directory:
- Expected: `~/labspace/solarpunk-foundry/ops/local/docker-compose.shared.yml`
- Got: `~/labspace/../ops/local/docker-compose.shared.yml` (resolves to `/Users/ops/local/...`)

## Solution Implemented ✅

Replaced with macOS-compatible symlink resolution loop:

```bash
# ============================================
# PATH RESOLUTION (Symlink Safe)
# ============================================
# Resolve true path of this script to handle symlinks (like ./madfam)
SOURCE=${BASH_SOURCE[0]}
while [ -L "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
  SOURCE=$(readlink "$SOURCE")
  [[ $SOURCE != /* ]] && SOURCE=$DIR/$SOURCE # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
SCRIPT_DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )

# Define Roots relative to the TRUE physical script location
FOUNDRY_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LABSPACE_ROOT="$(cd "$FOUNDRY_ROOT/.." && pwd)"
```

### How It Works

1. **Initialize**: `SOURCE=${BASH_SOURCE[0]}` (could be symlink)
2. **Loop**: While `SOURCE` is a symlink (`-L` test)
3. **Get Directory**: Save current symlink's directory
4. **Resolve**: Read the symlink target with `readlink`
5. **Handle Relative**: If target is relative, resolve it relative to symlink's directory
6. **Repeat**: Continue until we reach the actual file (not a symlink)
7. **Extract Dir**: Get the true physical directory of the script

## Verification Results ✅

### Test 1: Direct Execution
```bash
cd ~/labspace/solarpunk-foundry/ops/bin
./madfam.sh help
```

**Path Resolution**:
- `SCRIPT_DIR`: `/Users/aldoruizluna/labspace/solarpunk-foundry/ops/bin` ✅
- `FOUNDRY_ROOT`: `/Users/aldoruizluna/labspace/solarpunk-foundry` ✅
- `LABSPACE_ROOT`: `/Users/aldoruizluna/labspace` ✅

### Test 2: Symlink Execution
```bash
cd ~/labspace
ln -s solarpunk-foundry/ops/bin/madfam.sh madfam
./madfam help
```

**Path Resolution**:
- `SCRIPT_DIR`: `/Users/aldoruizluna/labspace/solarpunk-foundry/ops/bin` ✅
- `FOUNDRY_ROOT`: `/Users/aldoruizluna/labspace/solarpunk-foundry` ✅
- `LABSPACE_ROOT`: `/Users/aldoruizluna/labspace` ✅

### Test 3: Config File Discovery
```bash
SHARED_COMPOSE="$FOUNDRY_ROOT/ops/local/docker-compose.shared.yml"
```

**Result**: ✅ File found at correct location in both direct and symlink execution

## Benefits

1. **Symlink Safe**: Works correctly when called via symlink from any location
2. **Portable**: No hardcoded paths, resolves dynamically
3. **macOS Compatible**: Uses macOS-native `readlink` (not GNU version)
4. **Relative Path Handling**: Correctly resolves relative symlinks
5. **Multi-Level Symlinks**: Handles chains of symlinks (rare but supported)

## Usage Patterns Now Supported

### Pattern 1: Direct Execution
```bash
cd ~/labspace/solarpunk-foundry/ops/bin
./madfam.sh start
```

### Pattern 2: Symlink from Labspace
```bash
cd ~/labspace
ln -s solarpunk-foundry/ops/bin/madfam.sh madfam
./madfam start
```

### Pattern 3: PATH Addition
```bash
export PATH="$HOME/labspace/solarpunk-foundry/ops/bin:$PATH"
madfam.sh start  # from anywhere
```

### Pattern 4: Alias
```bash
alias madfam="$HOME/labspace/solarpunk-foundry/ops/bin/madfam.sh"
madfam start  # from anywhere
```

All patterns now correctly resolve to:
- `FOUNDRY_ROOT`: `~/labspace/solarpunk-foundry`
- Config files: `~/labspace/solarpunk-foundry/ops/local/*`
- DB scripts: `~/labspace/solarpunk-foundry/ops/db/*`

## Technical Details

### Why the Loop?

Simple `readlink` only resolves one level:
```bash
# If madfam -> madfam.sh -> actual_script.sh
readlink madfam  # Returns: madfam.sh (still a symlink!)
```

The loop handles:
- Multiple levels of symlinks
- Relative symlink targets
- Mixed absolute/relative symlink chains

### Why `-P` Flag?

```bash
cd -P  # Physical directory (resolve symlinks in path)
```

Ensures we get the true physical path, not the logical path that might contain symlinks.

### Why the Relative Path Check?

```bash
[[ $SOURCE != /* ]] && SOURCE=$DIR/$SOURCE
```

If `readlink` returns a relative path (e.g., `../real-script.sh`), we need to resolve it relative to the symlink's directory, not the current working directory.

## Testing

Run verification tests:
```bash
cd ~/labspace/solarpunk-foundry/ops/bin
./test-path-resolution.sh
```

Expected output:
```
✅ Direct execution: FOUNDRY_ROOT correct
✅ Symlink execution: FOUNDRY_ROOT correct
✅ Direct execution: LABSPACE_ROOT correct
✅ Symlink execution: LABSPACE_ROOT correct
✅ docker-compose.shared.yml found at correct location
```

## Files Modified

1. **solarpunk-foundry/ops/bin/madfam.sh**
   - Lines 9-18: Replaced simple path resolution with symlink-safe loop
   - Added detailed comments explaining the logic

## Status

✅ **FIXED** - Path resolution now works correctly in all execution contexts

---

**Date**: 2025-11-24  
**Engineer**: Bash Scripting Expert  
**Issue**: Symlink path resolution bug  
**Resolution**: Implemented symlink-safe path resolution loop
