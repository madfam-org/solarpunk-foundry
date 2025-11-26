# geom-core ↔ sim4d Integration Audit Report

**Date**: 2025-11-25  
**Status**: Work In Progress (WIP)  
**Author**: Claude Code Audit

---

## Executive Summary

This audit analyzes the integration status between `geom-core` (unified geometry engine) and `sim4d` (BrepFlow CAD application) within the MADFAM ecosystem. The goal is to ensure sim4d can pull all geometric operations from geom-core with **zero-lag execution**.

### Key Findings

| Aspect | Status | Notes |
|--------|--------|-------|
| **Operation Coverage** | 🟡 Parallel | Both repos have complete, independent implementations |
| **Integration Status** | 🔴 Not Connected | sim4d has no dependency on geom-core |
| **Zero-Lag Architecture** | 🟢 Ready in geom-core | Full implementation with routing, precomputation |
| **API Compatibility** | 🟡 Similar | Parameter structures align but differ in naming |

---

## 1. Repository Analysis

### 1.1 geom-core (`@madfam/geom-core`)

**Purpose**: Unified B-Rep geometry engine for MADFAM ecosystem with zero-lag browser execution and remote GPU compute offloading.

**Package Structure**:
```
geom-core/
├── src/typescript/
│   ├── bindings/
│   │   ├── GeometryEngine.ts     # Core OCCT wrapper (~800 lines)
│   │   └── types.ts              # Unified type definitions
│   ├── sdk/
│   │   └── GeomCoreSDK.ts        # Smart routing SDK (~700 lines)
│   └── index.ts                  # Public API exports
├── docs/
│   └── ZERO_LAG_ARCHITECTURE.md  # Architecture documentation
└── package.json
```

**Key Capabilities**:
- ✅ Complete GeometryEngine with all CAD operations
- ✅ Zero-Lag Architecture (local WASM + remote GPU routing)
- ✅ Precomputation hints for speculative execution
- ✅ Memory management with LRU eviction
- ✅ Complexity estimation for smart routing
- ✅ WebSocket support for real-time remote compute

### 1.2 sim4d (BrepFlow - `brepflow`)

**Purpose**: Web-first, node-based parametric CAD on exact B-Rep/NURBS.

**Relevant Package Structure**:
```
sim4d/packages/engine-occt/
├── src/
│   ├── bindings/               # Modular OCCT bindings
│   │   ├── index.ts           # RealOCCT facade class
│   │   ├── primitives.ts      # 3D/2D primitive creation
│   │   ├── boolean-ops.ts     # Union, Subtract, Intersect
│   │   ├── features.ts        # Extrude, Revolve, Fillet, etc.
│   │   ├── transformations.ts # Translate, Rotate, Scale, Mirror
│   │   ├── analysis.ts        # Tessellate, Properties, Volume
│   │   ├── assembly.ts        # Assembly, Mates, Patterns
│   │   ├── types.ts           # OCCT type interfaces
│   │   └── utils.ts           # Helper utilities
│   ├── worker.ts              # Web Worker message handler
│   ├── occt-wrapper.ts        # OCCTWrapper class
│   ├── worker-types.ts        # Worker message types
│   └── index.ts               # Package exports
└── package.json
```

**Key Capabilities**:
- ✅ Modular OCCT bindings architecture
- ✅ Worker-based async execution
- ✅ Production and fallback APIs
- ✅ Message-based operation handling
- ⚠️ No smart routing (all local execution)
- ⚠️ No precomputation/speculative execution
- ⚠️ No remote GPU compute offloading

---

## 2. Operation Mapping Matrix

### 2.1 3D Primitives

| Operation | geom-core | sim4d | API Compatibility |
|-----------|-----------|-------|-------------------|
| Box | `makeBox(BoxParams)` | `makeBox(params)` | 🟡 Similar - different param naming |
| Sphere | `makeSphere(SphereParams)` | `makeSphere(params)` | 🟡 Similar |
| Cylinder | `makeCylinder(CylinderParams)` | `makeCylinder(params)` | 🟡 Similar |
| Cone | `makeCone(ConeParams)` | `makeCone(params)` | 🟡 Similar |
| Torus | `makeTorus(TorusParams)` | `makeTorus(params)` | 🟡 Similar |

### 2.2 2D Primitives

| Operation | geom-core | sim4d | API Compatibility |
|-----------|-----------|-------|-------------------|
| Line | `createLine(LineParams)` | `createLine(params)` | 🟡 Similar |
| Circle | `createCircle(CircleParams)` | `createCircle(params)` | 🟡 Similar |
| Rectangle | `createRectangle(RectangleParams)` | `createRectangle(params)` | 🟡 Similar |
| Arc | `createArc(ArcParams)` | `createArc(params)` | 🟡 Similar |
| Point | - | `createPointShape(params)` | 🔴 Missing in geom-core |
| Ellipse | - | `createEllipse(params)` | 🔴 Missing in geom-core |
| Polygon | `createPolygon(PolygonParams)` | `createPolygon(params)` | 🟡 Similar |

### 2.3 Boolean Operations

| Operation | geom-core | sim4d | API Compatibility |
|-----------|-----------|-------|-------------------|
| Union | `booleanUnion({ shapes })` | `booleanUnion({ shapes })` | 🟢 Compatible |
| Subtract | `booleanSubtract({ base, tools })` | `booleanSubtract({ base, tools })` | 🟢 Compatible |
| Intersect | `booleanIntersect({ shapes })` | `booleanIntersect({ shapes })` | 🟢 Compatible |

### 2.4 Feature Operations

| Operation | geom-core | sim4d | API Compatibility |
|-----------|-----------|-------|-------------------|
| Extrude | `extrude(ExtrudeParams)` | `makeExtrude(params)` | 🟡 Method name differs |
| Revolve | `revolve(RevolveParams)` | `makeRevolve(params)` | 🟡 Method name differs |
| Sweep | `sweep(SweepParams)` | `makeSweep(params)` | 🟡 Method name differs |
| Loft | `loft(LoftParams)` | `makeLoft(params)` | 🟡 Method name differs |
| Fillet | `fillet(FilletParams)` | `makeFillet(params)` | 🟡 Method name differs |
| Chamfer | `chamfer(ChamferParams)` | `makeChamfer(params)` | 🟡 Method name differs |
| Shell | `shell(ShellParams)` | `makeShell(params)` | 🟡 Method name differs |
| Draft | - | `makeDraft(params)` | 🔴 Missing in geom-core |
| Offset | `offset(OffsetParams)` | `makeOffset(params)` | 🟡 Method name differs |

### 2.5 Transformations

| Operation | geom-core | sim4d | API Compatibility |
|-----------|-----------|-------|-------------------|
| Transform (matrix) | `transform(TransformParams)` | `transform(params)` | 🟢 Compatible |
| Translate | `translate(TranslateParams)` | `translate(params)` | 🟢 Compatible |
| Rotate | `rotate(RotateParams)` | `rotate(params)` | 🟢 Compatible |
| Scale | `scale(ScaleParams)` | `scale(params)` | 🟢 Compatible |
| Mirror | `mirror(MirrorParams)` | `mirror(params)` | 🟢 Compatible |

### 2.6 Analysis Operations

| Operation | geom-core | sim4d | API Compatibility |
|-----------|-----------|-------|-------------------|
| Tessellate | `tessellate(shapeId, options)` | `tessellate(params)` | 🟡 Signature differs |
| Get Properties | `getProperties(shapeId)` | `getProperties(params)` | 🟡 Signature differs |
| Get Volume | `getVolume(shapeId)` | `getVolume(params)` | 🟡 Signature differs |
| Get Surface Area | `getSurfaceArea(shapeId)` | `getArea(params)` | 🟡 Method name differs |
| Center of Mass | - | `getCenterOfMass(params)` | 🔴 Missing in geom-core SDK |

### 2.7 Assembly Operations (sim4d only)

| Operation | geom-core | sim4d | Status |
|-----------|-----------|-------|--------|
| Create Assembly | ❌ | `createAssembly(params)` | 🔴 Not in geom-core |
| Create Mate | ❌ | `createMate(params)` | 🔴 Not in geom-core |
| Create Pattern | ❌ | `createPattern(params)` | 🔴 Not in geom-core |

### 2.8 I/O Operations (sim4d worker only)

| Operation | geom-core | sim4d | Status |
|-----------|-----------|-------|--------|
| Import STEP | ❌ | `IMPORT_STEP` | 🔴 Not in geom-core |
| Export STEP | ❌ | `EXPORT_STEP` | 🔴 Not in geom-core |
| Export STL | ❌ | `EXPORT_STL` | 🔴 Not in geom-core |
| Export IGES | ❌ | `EXPORT_IGES` | 🔴 Not in geom-core |
| Export OBJ | ❌ | `EXPORT_OBJ` | 🔴 Not in geom-core |
| Export BREP | ❌ | `EXPORT_BREP` | 🔴 Not in geom-core |

---

## 3. Zero-Lag Architecture Assessment

### 3.1 geom-core Zero-Lag Implementation

**Fully Implemented Features**:

```typescript
// Operation Classification (from ZERO_LAG_ARCHITECTURE.md)
Instant (<16ms):      Primitives, transforms, simple queries
Interactive (<100ms): Simple booleans, fillets on low-poly
Background (<1s):     Complex booleans, tessellation
Heavy (>1s):          → Route to remote GPU compute
```

**Smart Routing System**:
```typescript
// GeomCoreSDK.ts - executeWithRouting()
- Complexity estimation (0-1 score)
- Automatic local/remote decision
- Precomputation cache with 30s TTL
- WebSocket real-time remote updates
- Memory pressure callbacks
- Slow operation notifications
```

**SDK Tiers**:
- `createBrowserSDK()`: Local WASM only, 256MB memory, 60fps target
- `createPaidTierSDK()`: Remote GPU compute, WebSocket, 512MB memory

### 3.2 sim4d Current State

**No Zero-Lag Architecture**:
- All operations execute locally in Web Worker
- No complexity estimation or routing
- No precomputation hints
- No remote compute offloading
- No memory pressure management

**Worker-Based Execution**:
```typescript
// worker.ts - message handler
- Direct OCCT WASM execution
- Synchronous operation processing
- Production API with fallback to bindings
```

---

## 4. Integration Gap Analysis

### 4.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **No dependency link** | sim4d cannot consume geom-core | 🔴 Critical |
| **Different package ecosystems** | @madfam vs @brepflow namespaces | 🔴 Critical |
| **Missing I/O in geom-core** | STEP/STL/IGES export needed | 🟡 High |
| **Missing assembly in geom-core** | Pattern/mate operations needed | 🟡 High |
| **Type definition divergence** | ShapeHandle structures differ | 🟡 Medium |

### 4.2 Type Compatibility Issues

**geom-core ShapeHandle**:
```typescript
interface ShapeHandle {
  id: string;
  type: ShapeType;  // 'solid' | 'surface' | 'curve' | ...
  bbox: BoundingBox;
  hash: string;
  volume?: number;
  surfaceArea?: number;
  centerOfMass?: Vec3;
}
```

**sim4d ShapeHandle** (from @brepflow/types):
```typescript
interface ShapeHandle {
  id: string;
  type: string;  // Less strict typing
  bbox?: BoundingBox;
  hash?: string;
  // Different optional fields
}
```

### 4.3 Worker Architecture Mismatch

**sim4d Pattern**:
```
Main Thread → Worker Message → OCCT Operation → Result Message
```

**geom-core Pattern**:
```
SDK → Complexity Check → Route Decision → Local/Remote → Result
                                        ↓
                                  Precomputation Cache
```

---

## 5. Migration Roadmap

### Phase 1: Foundation (Prerequisite)

**Goal**: Establish geom-core as the single source of truth for geometry operations.

| Task | Description | Effort |
|------|-------------|--------|
| 1.1 | Add missing 2D primitives to geom-core (Point, Ellipse) | 1 day |
| 1.2 | Add Draft operation to geom-core features | 0.5 day |
| 1.3 | Add I/O operations (STEP, STL, IGES, OBJ, BREP) | 2 days |
| 1.4 | Add Assembly operations (optional for initial integration) | 2 days |
| 1.5 | Unify ShapeHandle type definitions | 1 day |
| 1.6 | Publish geom-core to npm as @madfam/geom-core | 0.5 day |

### Phase 2: Integration Layer

**Goal**: Create adapter layer for sim4d to consume geom-core.

| Task | Description | Effort |
|------|-------------|--------|
| 2.1 | Add @madfam/geom-core dependency to sim4d | 0.5 day |
| 2.2 | Create GeomCoreAdapter in engine-occt | 2 days |
| 2.3 | Map sim4d operation names to geom-core methods | 1 day |
| 2.4 | Implement worker bridge for GeomCoreSDK | 2 days |
| 2.5 | Wire up zero-lag routing in BrepFlow | 1 day |

### Phase 3: Feature Parity Validation

**Goal**: Ensure all sim4d operations work through geom-core.

| Task | Description | Effort |
|------|-------------|--------|
| 3.1 | Create comprehensive operation test suite | 2 days |
| 3.2 | Validate all 3D/2D primitives | 1 day |
| 3.3 | Validate boolean operations | 1 day |
| 3.4 | Validate feature operations | 1 day |
| 3.5 | Validate transforms and analysis | 1 day |
| 3.6 | Performance benchmarking (local vs geom-core) | 1 day |

### Phase 4: Deprecation & Cleanup

**Goal**: Remove redundant code from sim4d.

| Task | Description | Effort |
|------|-------------|--------|
| 4.1 | Mark engine-occt bindings as deprecated | 0.5 day |
| 4.2 | Migrate all consumers to adapter | 2 days |
| 4.3 | Remove redundant OCCT wrapper code | 1 day |
| 4.4 | Update documentation | 1 day |

---

## 6. Recommended Integration Architecture

### 6.1 Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      sim4d (BrepFlow)                        │
├─────────────────────────────────────────────────────────────┤
│  Studio │ Viewport │ Nodes │ CLI                            │
├─────────────────────────────────────────────────────────────┤
│                   engine-core (Adapter Layer)                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  GeomCoreAdapter                                        ││
│  │  - Maps BrepFlow operations to geom-core SDK            ││
│  │  - Handles worker message translation                   ││
│  │  - Manages shape handle conversion                      ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                   @madfam/geom-core                          │
│  ┌─────────────────┐  ┌─────────────────────────────────────┐│
│  │ GeomCoreSDK     │  │ GeometryEngine                      ││
│  │ - Smart Routing │  │ - OCCT WASM Operations              ││
│  │ - Precompute    │  │ - Primitives, Booleans, Features    ││
│  │ - Memory Mgmt   │  │ - Transforms, Analysis              ││
│  └────────┬────────┘  └────────────────────────────────────┘│
│           │                                                  │
│  ┌────────▼────────┐  ┌─────────────────────────────────────┐│
│  │ Local Executor  │  │ Remote Executor (Paid Tier)         ││
│  │ WASM Worker     │  │ WebSocket → GPU Server              ││
│  └─────────────────┘  └─────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Integration Code Example

```typescript
// sim4d/packages/engine-core/src/geom-core-adapter.ts

import { 
  createBrowserSDK, 
  createGeometryEngine,
  type GeomCoreSDK,
  type ShapeHandle as GeomCoreShape
} from '@madfam/geom-core';
import type { ShapeHandle as BrepFlowShape } from '@brepflow/types';

export class GeomCoreAdapter {
  private sdk: GeomCoreSDK;

  async initialize(occtModule: any): Promise<void> {
    const engine = createGeometryEngine(occtModule);
    this.sdk = createBrowserSDK(engine);
  }

  // Adapt BrepFlow operation to geom-core
  async execute(operation: string, params: unknown): Promise<BrepFlowShape> {
    const mapped = this.mapOperation(operation);
    const result = await this.sdk[mapped.method](mapped.params);
    
    if (!result.success) {
      throw new Error(result.error?.message);
    }
    
    return this.convertHandle(result.value);
  }

  private mapOperation(op: string): { method: string; params: unknown } {
    const mapping: Record<string, string> = {
      'MAKE_BOX': 'makeBox',
      'MAKE_SPHERE': 'makeSphere',
      'BOOLEAN_UNION': 'booleanUnion',
      'EXTRUDE': 'extrude',
      // ... full mapping
    };
    return { method: mapping[op] || op, params };
  }

  private convertHandle(gcShape: GeomCoreShape): BrepFlowShape {
    return {
      id: gcShape.id,
      type: gcShape.type,
      bbox: gcShape.bbox,
      hash: gcShape.hash,
    };
  }
}
```

---

## 7. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WASM module size increase | Medium | Medium | Lazy-load modules, tree-shaking |
| Performance regression | Low | High | Benchmark before/after, gradual rollout |
| Breaking changes | Medium | High | Adapter layer isolation, version pinning |
| Type compatibility issues | High | Medium | Shared types package, runtime validation |

---

## 8. Conclusions & Recommendations

### Current State
- **sim4d and geom-core operate independently** with parallel OCCT implementations
- **No integration exists** between the two repositories
- **geom-core has superior architecture** with zero-lag features ready
- **sim4d has complete CAD functionality** but lacks smart routing

### Recommendations

1. **Prioritize Phase 1** - Complete geom-core feature parity (I/O, missing primitives)
2. **Create shared types package** - `@madfam/geom-types` for cross-repo compatibility
3. **Build adapter layer first** - Minimize disruption to sim4d consumers
4. **Incremental migration** - Route operations one category at a time
5. **Maintain backward compatibility** - sim4d worker API should remain stable

### Success Criteria

- [ ] All 35+ sim4d operations route through geom-core
- [ ] Zero-lag architecture active (precomputation, routing)
- [ ] No performance regression (< 5% overhead)
- [ ] sim4d test suite passes with geom-core backend
- [ ] Remote GPU compute available for paid tier users

---

## Appendix A: Complete Operation Inventory

### geom-core Operations (28 total)

**3D Primitives (5)**: makeBox, makeSphere, makeCylinder, makeCone, makeTorus  
**2D Primitives (5)**: createLine, createCircle, createRectangle, createArc, createPolygon  
**Booleans (3)**: booleanUnion, booleanSubtract, booleanIntersect  
**Features (8)**: extrude, revolve, sweep, loft, fillet, chamfer, shell, offset  
**Transforms (5)**: transform, translate, rotate, scale, mirror  
**Analysis (4)**: tessellate, getProperties, getVolume, getSurfaceArea

### sim4d Operations (38+ total)

**3D Primitives (5)**: MAKE_BOX, MAKE_SPHERE, MAKE_CYLINDER, MAKE_CONE, MAKE_TORUS  
**2D Primitives (7)**: CREATE_LINE, CREATE_CIRCLE, CREATE_RECTANGLE, CREATE_ARC, CREATE_POINT, CREATE_ELLIPSE, CREATE_POLYGON  
**Booleans (3)**: BOOLEAN_UNION, BOOLEAN_SUBTRACT, BOOLEAN_INTERSECT  
**Features (9)**: EXTRUDE, REVOLVE, SWEEP, LOFT, FILLET, CHAMFER, SHELL, DRAFT, OFFSET  
**Transforms (5)**: TRANSFORM, TRANSLATE, ROTATE, SCALE, MIRROR  
**Analysis (4)**: TESSELLATE, GET_PROPERTIES, GET_VOLUME, GET_CENTER_OF_MASS  
**I/O (6)**: IMPORT_STEP, EXPORT_STEP, EXPORT_STL, EXPORT_IGES, EXPORT_OBJ, EXPORT_BREP  
**Assembly (3)**: CREATE_ASSEMBLY, CREATE_MATE, CREATE_PATTERN  
**Utility (4)**: DELETE_SHAPE, CLEAR_ALL, GET_STATUS, HEALTH_CHECK, COPY_SHAPE

---

*Report generated by Claude Code Audit - 2025-11-25*
