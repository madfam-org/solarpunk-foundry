# Geom-Core Extraction Plan

> Generated: 2025-11-25  
> Status: DRAFT - For Review  
> Scope: Extract geometry code from sim4d to geom-core for multi-consumer usage

## Executive Summary

This document outlines the plan to consolidate geometry processing code into `geom-core` as the single source of truth for all MADFAM ecosystem geometry operations. This enables "maximum dogfooding" where sim4d, blueprint-harvester, and cotiza-studio all consume the same geometry engine.

---

## Current State Analysis

### geom-core (C++ Library)
**Location**: `geom-core/`

**Already Implemented**:
| Feature | Status | File |
|---------|--------|------|
| STL loading (binary) | ✅ Complete | `Analyzer.cpp` |
| STEP loading via OCCT | ✅ Complete | `Analyzer.cpp` |
| Volume calculation | ✅ Complete | `Analyzer.cpp` |
| Watertight checking | ✅ Complete | `Analyzer.cpp` |
| Bounding box | ✅ Complete | `Analyzer.cpp` |
| Printability analysis (overhangs) | ✅ Complete | `PrintabilityAnalyzer.cpp` |
| Wall thickness analysis | ✅ Complete | `PrintabilityAnalyzer.cpp` |
| Auto-orientation | ✅ Complete | `Orientation.cpp` |
| Python bindings (pybind11) | ✅ Complete | `python_bindings.cpp` |
| WASM bindings (Emscripten) | ✅ Complete | `wasm_bindings.cpp` |
| Visualization data export | ✅ Complete | `Analyzer.cpp` |

**Missing for Multi-Consumer**:
- Boolean operations (union, subtract, intersect)
- Primitive creation (box, sphere, cylinder, etc.)
- Feature operations (fillet, chamfer, shell, extrude, revolve)
- Transformations (translate, rotate, scale)
- STEP/STL/IGES export
- 2D primitives (line, circle, arc, polygon)

### sim4d/packages/engine-occt (TypeScript WASM Wrapper)
**Location**: `sim4d/packages/engine-occt/`

**Complete OCCT WASM Integration**:
| Module | Capabilities | Key Files |
|--------|--------------|-----------|
| **Primitives** | Box, Sphere, Cylinder, Cone, Torus, Line, Circle, Rectangle, Arc, Polygon, Ellipse | `bindings/primitives.ts` |
| **Boolean Ops** | Union, Subtract, Intersect | `bindings/boolean-ops.ts` |
| **Features** | Extrude, Revolve, Sweep, Loft, Fillet, Chamfer, Shell, Draft, Offset | `bindings/features.ts` |
| **Analysis** | Volume, Area, Center of Mass, Bounding Box, Tessellation | `bindings/analysis.ts` |
| **Transforms** | Translate, Rotate, Scale, Mirror, Matrix Transform | `bindings/transformations.ts` |
| **File I/O** | STEP import/export, STL export, IGES export (optional) | `occt-production.ts` |
| **Validation** | Shape validation, Mesh validation, Export validation | `geometry-validator.ts` |
| **Memory Mgmt** | Shape tracking, Cleanup, Cache management | `memory-manager.ts` |
| **Workers** | Worker pool, Error recovery, WASM capability detection | `worker-pool.ts`, `error-recovery.ts` |

**WASM Binaries Available**:
- `wasm/occt-core.wasm` - Core OCCT module
- `wasm/occt.wasm` - Full OCCT module  
- `wasm/occt_geometry.wasm` - Geometry-specific module

---

## Extraction Mapping

### Phase 1: Core Geometry Operations → geom-core

| sim4d Source | geom-core Destination | Consumers |
|--------------|----------------------|-----------|
| `bindings/primitives.ts` | `src/Primitives.cpp` | sim4d, blueprint-harvester |
| `bindings/boolean-ops.ts` | `src/BooleanOps.cpp` | sim4d |
| `bindings/analysis.ts` | `src/Analyzer.cpp` (extend) | sim4d, blueprint-harvester, cotiza-studio |
| `bindings/features.ts` | `src/Features.cpp` | sim4d |
| `bindings/transformations.ts` | `src/Transformations.cpp` | sim4d, blueprint-harvester |

### Phase 2: File I/O → geom-core

| sim4d Source | geom-core Destination | Consumers |
|--------------|----------------------|-----------|
| `occt-production.ts:importSTEP` | `src/FileIO.cpp` | sim4d, cotiza-studio |
| `occt-production.ts:exportSTEP` | `src/FileIO.cpp` | sim4d, cotiza-studio |
| `occt-production.ts:exportSTL` | `src/FileIO.cpp` | sim4d, cotiza-studio |
| `geometry-validator.ts` | `src/Validator.cpp` | sim4d, blueprint-harvester |

### Phase 3: Printability → geom-core (Already Present)

| Capability | Status | Consumers |
|------------|--------|-----------|
| Overhang detection | ✅ Already in geom-core | blueprint-harvester |
| Wall thickness analysis | ✅ Already in geom-core | blueprint-harvester, cotiza-studio |
| Auto-orientation | ✅ Already in geom-core | blueprint-harvester |
| Volume/mass calculation | ✅ Already in geom-core | cotiza-studio (pricing) |

---

## What Stays in sim4d

| Component | Reason |
|-----------|--------|
| UI Components | Application-specific React components |
| Collaboration/Sync | WebSocket, operational transform logic |
| Node Graph System | DAG engine, scripting, constraints |
| Viewport Rendering | Three.js integration, camera controls |
| Version Control | Project versioning, undo/redo |
| CLI Tools | Project scaffolding, build tools |

---

## Architecture Decision: WASM Strategy

### Current State
- **geom-core**: C++ compiled to WASM via Emscripten
- **sim4d/engine-occt**: TypeScript wrapper around separate OCCT WASM

### Recommended Approach
**Option A: Unified WASM Module** ⭐ RECOMMENDED
- Merge OCCT capabilities into geom-core C++ codebase
- Single WASM build with all geometry capabilities
- Single TypeScript API layer

**Benefits**:
- Single WASM module to load (~20-30MB)
- Consistent API across all consumers
- Simpler dependency management
- Better tree-shaking potential

**Implementation**:
1. Add OCCT source dependencies to geom-core CMakeLists.txt
2. Port TypeScript binding logic to C++ classes
3. Update WASM bindings to expose all operations
4. Create unified TypeScript SDK package (`@madfam/geom-core`)

---

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                      geom-core                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ C++ Core: OCCT + Analysis + Printability            │    │
│  └─────────────────────────────────────────────────────┘    │
│           │                    │                            │
│    ┌──────┴────────┐    ┌─────┴──────┐                     │
│    │ Python Bindings│    │WASM Bindings│                    │
│    └───────────────┘    └────────────┘                      │
└─────────────────────────────────────────────────────────────┘
              │                        │
              ▼                        ▼
┌─────────────────────┐    ┌─────────────────────────────────┐
│ blueprint-harvester  │    │          @madfam/geom-core       │
│ (Python Server)      │    │        (TypeScript SDK)          │
└─────────────────────┘    └─────────────────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
              ┌──────────┐      ┌──────────┐      ┌──────────┐
              │  sim4d   │      │ cotiza-  │      │ forj     │
              │ (CAD App)│      │  studio  │      │(Future)  │
              └──────────┘      └──────────┘      └──────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
1. **Set up OCCT in geom-core**
   - Add OCCT as CMake dependency
   - Configure WASM build with OCCT
   - Test basic primitive creation

2. **Port Primitives Module**
   - `Primitives.cpp`: Box, Sphere, Cylinder, Cone, Torus
   - WASM bindings for primitives
   - Python bindings for primitives

### Phase 2: Operations (Week 3-4)
1. **Port Boolean Operations**
   - `BooleanOps.cpp`: Union, Subtract, Intersect
   - WASM/Python bindings

2. **Port Features**
   - `Features.cpp`: Extrude, Revolve, Sweep, Loft, Fillet, Chamfer
   - WASM/Python bindings

3. **Port Transformations**
   - `Transformations.cpp`: Translate, Rotate, Scale, Mirror
   - WASM/Python bindings

### Phase 3: File I/O (Week 5)
1. **Port File Operations**
   - `FileIO.cpp`: STEP import/export, STL export
   - Validation logic

### Phase 4: SDK & Integration (Week 6)
1. **Create @madfam/geom-core TypeScript SDK**
   - Type definitions from existing `@brepflow/types`
   - Worker pool integration
   - Error recovery

2. **Wire sim4d to use geom-core**
   - Update `engine-occt` to delegate to geom-core
   - Maintain backward compatibility

3. **Wire blueprint-harvester**
   - Python import of geom-core
   - Printability analysis pipeline

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| OCCT license compatibility | OCCT is LGPL, compatible with MIT |
| WASM size increase | Use Emscripten dead code elimination, lazy loading |
| API breaking changes | Version SDK, maintain backward compat shim |
| Build complexity | Docker-based build environment |
| Performance regression | Benchmark suite before/after |

---

## Success Criteria

- [ ] Single `@madfam/geom-core` package for all JS/TS consumers
- [ ] Python bindings work with blueprint-harvester
- [ ] sim4d maintains feature parity
- [ ] cotiza-studio can calculate volume/mass for pricing
- [ ] Blueprint-harvester printability analysis works
- [ ] < 50MB total WASM size
- [ ] < 5% performance regression on key operations

---

## Next Steps

1. **Immediate**: Review this plan with stakeholders
2. **This Week**: Create geom-core branch for OCCT integration
3. **Next Week**: Begin Phase 1 implementation

---

*This document should be updated as implementation progresses.*
