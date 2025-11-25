# Geom-Core Unified API Design

> Generated: 2025-11-25  
> Status: DRAFT - For Review  
> Purpose: Define the multi-consumer API for geom-core

## Design Principles

1. **Consumer-Agnostic**: API works identically in browser (WASM), server (Python), CLI
2. **Handle-Based**: All shapes are represented by opaque handles, not raw geometry
3. **Immutable Operations**: Operations return new handles, don't mutate inputs
4. **Explicit Memory Management**: Consumers control when shapes are disposed
5. **Error Transparency**: All operations return results with success/error info

---

## Core Types

### TypeScript/JavaScript

```typescript
// Shape Handle - opaque reference to geometry
interface ShapeHandle {
  id: string;           // Unique identifier
  type: ShapeType;      // solid | surface | curve | point | compound
  bbox: BoundingBox;    // Cached bounding box
  hash: string;         // Content hash for caching
}

type ShapeType = 'solid' | 'surface' | 'curve' | 'point' | 'compound';

interface BoundingBox {
  min: Vec3;
  max: Vec3;
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// Operation result wrapper
interface GeomResult<T> {
  success: boolean;
  result?: T;
  error?: GeomError;
  performance?: PerformanceMetrics;
}

interface GeomError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

interface PerformanceMetrics {
  durationMs: number;
  memoryUsedBytes: number;
  cacheHit: boolean;
}

// Mesh data for visualization
interface MeshData {
  positions: Float32Array;  // [x,y,z, x,y,z, ...]
  normals: Float32Array;    // [nx,ny,nz, ...]
  indices: Uint32Array;     // Triangle indices
  uvs?: Float32Array;       // Optional UV coords
}

// Printability analysis
interface PrintabilityReport {
  isPrintable: boolean;
  volume: number;           // mm³
  surfaceArea: number;      // mm²
  boundingBox: BoundingBox;
  
  overhangs: OverhangInfo[];
  thinWalls: ThinWallInfo[];
  optimalOrientation?: Orientation;
  
  score: number;            // 0-100 printability score
  issues: PrintIssue[];
}

interface OverhangInfo {
  angle: number;            // degrees from vertical
  area: number;             // mm²
  position: Vec3;
  requiresSupport: boolean;
}

interface ThinWallInfo {
  thickness: number;        // mm
  position: Vec3;
  isBelowMinimum: boolean;
}
```

### Python

```python
from dataclasses import dataclass
from typing import Optional, List, Tuple
import numpy as np

@dataclass
class ShapeHandle:
    id: str
    type: str  # 'solid' | 'surface' | 'curve' | 'point' | 'compound'
    bbox_min: Tuple[float, float, float]
    bbox_max: Tuple[float, float, float]
    hash: str

@dataclass
class GeomResult:
    success: bool
    result: Optional[any] = None
    error: Optional[str] = None

@dataclass
class MeshData:
    positions: np.ndarray  # Nx3 float32
    normals: np.ndarray    # Nx3 float32
    indices: np.ndarray    # Mx3 uint32

@dataclass
class PrintabilityReport:
    is_printable: bool
    volume: float
    surface_area: float
    bbox_min: Tuple[float, float, float]
    bbox_max: Tuple[float, float, float]
    
    overhang_count: int
    thin_wall_count: int
    optimal_orientation: Optional[Tuple[float, float, float]]
    
    score: float  # 0-100
    issues: List[str]
```

---

## API Modules

### 1. Primitives Module

```typescript
interface PrimitivesAPI {
  // 3D Primitives
  makeBox(width: number, height: number, depth: number): GeomResult<ShapeHandle>;
  makeBoxAt(center: Vec3, width: number, height: number, depth: number): GeomResult<ShapeHandle>;
  
  makeSphere(radius: number): GeomResult<ShapeHandle>;
  makeSphereAt(center: Vec3, radius: number): GeomResult<ShapeHandle>;
  
  makeCylinder(radius: number, height: number): GeomResult<ShapeHandle>;
  makeCylinderAt(center: Vec3, axis: Vec3, radius: number, height: number): GeomResult<ShapeHandle>;
  
  makeCone(radius1: number, radius2: number, height: number): GeomResult<ShapeHandle>;
  makeTorus(majorRadius: number, minorRadius: number): GeomResult<ShapeHandle>;
  
  // 2D Primitives (for profiles)
  makeLine(start: Vec3, end: Vec3): GeomResult<ShapeHandle>;
  makeCircle(center: Vec3, radius: number, normal?: Vec3): GeomResult<ShapeHandle>;
  makeRectangle(center: Vec3, width: number, height: number): GeomResult<ShapeHandle>;
  makePolygon(points: Vec3[], closed?: boolean): GeomResult<ShapeHandle>;
  makeArc(center: Vec3, start: Vec3, end: Vec3): GeomResult<ShapeHandle>;
}
```

### 2. Boolean Operations Module

```typescript
interface BooleanAPI {
  union(shapes: ShapeHandle[]): GeomResult<ShapeHandle>;
  subtract(base: ShapeHandle, tools: ShapeHandle[]): GeomResult<ShapeHandle>;
  intersect(shapes: ShapeHandle[]): GeomResult<ShapeHandle>;
}
```

### 3. Features Module

```typescript
interface FeaturesAPI {
  // Profile-based
  extrude(profile: ShapeHandle, direction: Vec3, distance: number): GeomResult<ShapeHandle>;
  revolve(profile: ShapeHandle, axis: Vec3, origin: Vec3, angle: number): GeomResult<ShapeHandle>;
  sweep(profile: ShapeHandle, path: ShapeHandle): GeomResult<ShapeHandle>;
  loft(profiles: ShapeHandle[], ruled?: boolean): GeomResult<ShapeHandle>;
  
  // Edge modifications
  fillet(shape: ShapeHandle, radius: number, edges?: ShapeHandle[]): GeomResult<ShapeHandle>;
  chamfer(shape: ShapeHandle, distance: number, edges?: ShapeHandle[]): GeomResult<ShapeHandle>;
  
  // Shape modifications
  shell(shape: ShapeHandle, thickness: number, faces?: ShapeHandle[]): GeomResult<ShapeHandle>;
  offset(shape: ShapeHandle, distance: number): GeomResult<ShapeHandle>;
  draft(shape: ShapeHandle, angle: number, direction: Vec3): GeomResult<ShapeHandle>;
}
```

### 4. Transformations Module

```typescript
interface TransformAPI {
  translate(shape: ShapeHandle, offset: Vec3): GeomResult<ShapeHandle>;
  rotate(shape: ShapeHandle, axis: Vec3, origin: Vec3, angle: number): GeomResult<ShapeHandle>;
  scale(shape: ShapeHandle, factor: number | Vec3): GeomResult<ShapeHandle>;
  mirror(shape: ShapeHandle, plane: 'XY' | 'XZ' | 'YZ' | Plane): GeomResult<ShapeHandle>;
  transform(shape: ShapeHandle, matrix: Matrix4x4): GeomResult<ShapeHandle>;
  copy(shape: ShapeHandle): GeomResult<ShapeHandle>;
}
```

### 5. Analysis Module

```typescript
interface AnalysisAPI {
  // Measurements
  getVolume(shape: ShapeHandle): GeomResult<number>;
  getSurfaceArea(shape: ShapeHandle): GeomResult<number>;
  getBoundingBox(shape: ShapeHandle): GeomResult<BoundingBox>;
  getCenterOfMass(shape: ShapeHandle): GeomResult<Vec3>;
  
  // Validation
  isWatertight(shape: ShapeHandle): GeomResult<boolean>;
  isSolid(shape: ShapeHandle): GeomResult<boolean>;
  
  // Mesh generation
  tessellate(shape: ShapeHandle, options?: TessellateOptions): GeomResult<MeshData>;
  
  // Printability (for blueprint-harvester & cotiza-studio)
  analyzePrintability(shape: ShapeHandle, options?: PrintabilityOptions): GeomResult<PrintabilityReport>;
  findOptimalOrientation(shape: ShapeHandle): GeomResult<Orientation>;
  detectOverhangs(shape: ShapeHandle, maxAngle?: number): GeomResult<OverhangInfo[]>;
  detectThinWalls(shape: ShapeHandle, minThickness?: number): GeomResult<ThinWallInfo[]>;
}

interface TessellateOptions {
  linearDeflection?: number;  // Max distance from true surface
  angularDeflection?: number; // Max angle between mesh facets
  relative?: boolean;         // Deflection relative to bounding box
}

interface PrintabilityOptions {
  minWallThickness?: number;  // mm, default 0.8
  maxOverhangAngle?: number;  // degrees, default 45
  layerHeight?: number;       // mm, for overhang calculation
}
```

### 6. File I/O Module

```typescript
interface FileIOAPI {
  // Import
  importSTEP(data: ArrayBuffer | string): GeomResult<ShapeHandle>;
  importSTL(data: ArrayBuffer): GeomResult<ShapeHandle>;
  
  // Export
  exportSTEP(shape: ShapeHandle): GeomResult<string>;
  exportSTL(shape: ShapeHandle, binary?: boolean): GeomResult<ArrayBuffer | string>;
  exportOBJ(shape: ShapeHandle): GeomResult<string>;
  
  // Validation
  validateExport(data: string | ArrayBuffer, format: 'step' | 'stl' | 'obj'): GeomResult<ValidationResult>;
}
```

### 7. Memory Management Module

```typescript
interface MemoryAPI {
  dispose(shape: ShapeHandle): void;
  disposeAll(): void;
  getShapeCount(): number;
  getMemoryUsage(): MemoryStats;
}

interface MemoryStats {
  shapeCount: number;
  estimatedBytes: number;
  cacheHitRate: number;
}
```

---

## Unified Engine Interface

```typescript
// Main entry point for all consumers
interface GeomCore {
  // Module namespaces
  primitives: PrimitivesAPI;
  boolean: BooleanAPI;
  features: FeaturesAPI;
  transform: TransformAPI;
  analysis: AnalysisAPI;
  fileIO: FileIOAPI;
  memory: MemoryAPI;
  
  // Lifecycle
  initialize(): Promise<void>;
  isInitialized(): boolean;
  shutdown(): Promise<void>;
  
  // Health & diagnostics
  healthCheck(): GeomResult<HealthStatus>;
  getVersion(): string;
}

// Factory function
function createGeomCore(options?: GeomCoreOptions): Promise<GeomCore>;

interface GeomCoreOptions {
  // WASM loading
  wasmPath?: string;
  
  // Memory management
  maxShapes?: number;
  enableCaching?: boolean;
  
  // Workers (browser only)
  useWorkerPool?: boolean;
  workerCount?: number;
  
  // Error handling
  enableRecovery?: boolean;
  maxRetries?: number;
}
```

---

## Python Bindings

```python
import geom_core

# Initialize
engine = geom_core.GeomCore()

# Create geometry
box = engine.primitives.make_box(100, 50, 25)
sphere = engine.primitives.make_sphere_at((0, 0, 0), 30)

# Boolean operations
result = engine.boolean.subtract(box, [sphere])

# Analysis for cotiza-studio pricing
volume = engine.analysis.get_volume(result)
print(f"Volume: {volume.result} mm³")

# Printability for blueprint-harvester
report = engine.analysis.analyze_printability(result, {
    'min_wall_thickness': 0.8,
    'max_overhang_angle': 45
})
print(f"Printable: {report.result.is_printable}")
print(f"Score: {report.result.score}/100")

# Export for cotiza-studio
step_data = engine.file_io.export_step(result)

# Cleanup
engine.memory.dispose(result)
```

---

## Consumer-Specific Integration

### sim4d (CAD Application)
```typescript
import { createGeomCore } from '@madfam/geom-core';

// Full feature usage for CAD operations
const geom = await createGeomCore({
  wasmPath: '/wasm/geom-core.wasm',
  useWorkerPool: true,
  workerCount: 4,
  enableCaching: true
});

// Node graph operations delegate to geom-core
const box = await geom.primitives.makeBox(100, 100, 100);
const fillet = await geom.features.fillet(box.result!, 5);
const mesh = await geom.analysis.tessellate(fillet.result!);
```

### blueprint-harvester (Printability Analysis)
```python
from geom_core import GeomCore

def analyze_stl_for_printability(stl_data: bytes) -> dict:
    engine = GeomCore()
    
    # Load STL
    shape = engine.file_io.import_stl(stl_data)
    if not shape.success:
        return {'error': shape.error}
    
    # Full printability analysis
    report = engine.analysis.analyze_printability(shape.result, {
        'min_wall_thickness': 0.8,
        'max_overhang_angle': 45,
        'layer_height': 0.2
    })
    
    # Get optimal orientation
    orientation = engine.analysis.find_optimal_orientation(shape.result)
    
    return {
        'printable': report.result.is_printable,
        'score': report.result.score,
        'volume': report.result.volume,
        'issues': report.result.issues,
        'optimal_rotation': orientation.result
    }
```

### cotiza-studio (Pricing Calculations)
```typescript
import { createGeomCore } from '@madfam/geom-core';

async function calculatePricing(stepFile: ArrayBuffer, material: Material): Promise<Quote> {
  const geom = await createGeomCore();
  
  // Import STEP
  const shape = await geom.fileIO.importSTEP(stepFile);
  if (!shape.success) throw new Error(shape.error!.message);
  
  // Get measurements for pricing
  const volume = await geom.analysis.getVolume(shape.result!);
  const bbox = await geom.analysis.getBoundingBox(shape.result!);
  
  // Calculate material cost
  const volumeCm3 = volume.result! / 1000; // mm³ to cm³
  const materialCost = volumeCm3 * material.pricePerCm3;
  
  // Check printability affects pricing
  const printability = await geom.analysis.analyzePrintability(shape.result!);
  const supportCost = printability.result!.overhangs
    .filter(o => o.requiresSupport)
    .reduce((sum, o) => sum + o.area * 0.01, 0);
  
  return {
    materialCost,
    supportCost,
    total: materialCost + supportCost,
    volumeMm3: volume.result!,
    printabilityScore: printability.result!.score
  };
}
```

---

## Migration Path for sim4d

### Before (current engine-occt)
```typescript
// sim4d/packages/engine-core/src/geometry-api-factory.ts
const api = await GeometryAPIFactory.getAPI();
await api.invoke('MAKE_BOX', { width: 100, height: 100, depth: 100 });
```

### After (geom-core)
```typescript
// Option A: Direct replacement
import { createGeomCore } from '@madfam/geom-core';
const geom = await createGeomCore();
const box = await geom.primitives.makeBox(100, 100, 100);

// Option B: Compatibility shim (temporary)
import { createGeomCoreCompat } from '@madfam/geom-core/compat';
const api = await createGeomCoreCompat(); // Same interface as old WorkerAPI
await api.invoke('MAKE_BOX', { width: 100, height: 100, depth: 100 });
```

---

## Package Structure

```
@madfam/geom-core/
├── dist/
│   ├── index.js          # Main ESM entry
│   ├── index.d.ts        # TypeScript definitions
│   ├── worker.js         # Web Worker script
│   └── wasm/
│       └── geom-core.wasm
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── engine.ts
│   ├── modules/
│   │   ├── primitives.ts
│   │   ├── boolean.ts
│   │   ├── features.ts
│   │   ├── transform.ts
│   │   ├── analysis.ts
│   │   ├── fileio.ts
│   │   └── memory.ts
│   └── wasm/
│       └── bindings.ts
└── package.json
```

---

*This API design enables all MADFAM apps to share geometry processing with consistent behavior.*
