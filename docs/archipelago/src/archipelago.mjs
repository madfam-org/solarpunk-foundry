import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const T_START = performance.now();
const D = window.ARCH, S = window.ARCH_STATE, UI = window.ARCH_UI;
const stage = document.getElementById('stage');
const COARSE = matchMedia('(pointer: coarse)').matches;
const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
let reduced = mqReduce.matches;
mqReduce.addEventListener('change', (e) => { reduced = e.matches; MOTION_U.value = reduced ? 0 : 1; AMP_U.value = reduced ? 0.25 : 0.7; });

const ISL = D.islands;
const byId = new Map(ISL.map((i) => [i.id, i]));
ISL.forEach((i, k) => { i.idx = k; });
const UP = new THREE.Vector3(0, 1, 0);
const WORLD_R = 860;
const MAXI = 64;
const clamp = THREE.MathUtils.clamp, lerp = THREE.MathUtils.lerp;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
function hashStr(s) { let h = 2166136261; for (let k = 0; k < s.length; k++) { h ^= s.charCodeAt(k); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function noise2(seed) {
  const r = rng(seed); const p = new Uint8Array(512); const base = Array.from({ length: 256 }, (_, k) => k);
  for (let k = 255; k > 0; k--) { const j = Math.floor(r() * (k + 1)); const tmp = base[k]; base[k] = base[j]; base[j] = tmp; }
  for (let k = 0; k < 512; k++) p[k] = base[k & 255];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const grad = (h, x, y) => (((h & 1) ? -x : x) + ((h & 2) ? -y : y));
  return (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255; const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = fade(xf), v = fade(yf);
    const aa = p[p[X] + Y], ab = p[p[X] + Y + 1], ba = p[p[X + 1] + Y], bb = p[p[X + 1] + Y + 1];
    const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u); const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
    return lerp(x1, x2, v) * 0.7;
  };
}

/* Shared uniforms: one clock, one wave amplitude and one fade table drive every merged batch. */
const TIME_U = { value: 0 };
const AMP_U = { value: reduced ? 0.25 : 0.7 };
const MOTION_U = { value: reduced ? 0 : 1 };
const PX_SCALE = { value: 600 };
const FADE_ARR = new Float32Array(MAXI);
const FADE_U = { value: FADE_ARR };
const FADE_COL = { value: new THREE.Color('#cfe4e5') };
const PERF_INIT = { distMs: 0, buildMs: 0, compileMs: 0, firstFrameMs: 0 };

/* ---------------- renderer, scenes, camera ---------------- */
const DPR_DEVICE = window.devicePixelRatio || 1;
const DPR_MAX = Math.min(DPR_DEVICE, 2);
// MSAA only where the display is not already dense; a 2x display is smooth without it.
const AA = typeof window.__ARCH_AA === 'boolean' ? window.__ARCH_AA : DPR_DEVICE < 1.5;
// A page that loads hidden is usually being captured for a thumbnail; keep its buffer readable.
const PRESERVE = typeof window.__ARCH_PRESERVE === 'boolean' ? window.__ARCH_PRESERVE : document.visibilityState === 'hidden';
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: AA, powerPreference: 'high-performance', preserveDrawingBuffer: PRESERVE, stencil: false });
} catch (err) {
  UI.fail('This browser could not start WebGL, so the 3D view is off. The pilot book still lists every island; pick one to read its card.');
  throw err;
}
const W = () => stage.clientWidth || window.innerWidth;
const H = () => stage.clientHeight || window.innerHeight;
renderer.setPixelRatio(DPR_MAX);
renderer.setSize(W(), H());
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.setAttribute('aria-hidden', 'true');
stage.appendChild(renderer.domElement);
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(W(), H());
labelRenderer.domElement.className = 'labels';
stage.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcfe4e5, 1500, 4600);
const labelScene = new THREE.Scene(); // CSS2D objects only, so label passes never walk the 3D graph
const camera = new THREE.PerspectiveCamera(48, W() > 1 && H() > 1 ? W() / H() : 1.6, 1, 14000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.475; controls.minDistance = 30; controls.maxDistance = 2600;
controls.screenSpacePanning = false;

/* ---------------- palettes: day and night ---------------- */
const C = (h) => new THREE.Color(h);
const PAL = {
  day: { skyTop: C('#5aa7cb'), skyHor: C('#d6ebec'), fog: C('#cfe4e5'), deep: C('#176579'), shallow: C('#48c2bc'), foam: C('#f6fbf8'), sun: C('#fff0cf'), hemiSky: C('#d4ebff'), hemiGround: C('#5d6b4c') },
  night: { skyTop: C('#061426'), skyHor: C('#1b3b4b'), fog: C('#14303c'), deep: C('#082c3c'), shallow: C('#16676f'), foam: C('#a2cbc6'), sun: C('#b8cfff'), hemiSky: C('#3c5784'), hemiGround: C('#16211b') },
};
const cur = {}; for (const k of Object.keys(PAL.day)) cur[k] = PAL.day[k].clone();
let nightK = S.night ? 1 : 0;
let nightApplied = -1;
const SUN_DIR = v3(0.45, 0.75, 0.32).normalize(), MOON_DIR = v3(-0.35, 0.62, -0.55).normalize();
const hemi = new THREE.HemisphereLight(0xffffff, 0x445533, 1.15); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2.5); scene.add(sun);
const glowMats = [];

/* ---------------- sky + stars (drawn last, depth-tested, so hidden sky costs nothing) ---------------- */
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { uTop: { value: C('#5aa7cb') }, uHor: { value: C('#d6ebec') }, uSunDir: { value: SUN_DIR.clone() }, uSunCol: { value: C('#fff0cf') }, uNight: { value: 0 } },
  vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uSunCol; uniform vec3 uSunDir; uniform float uNight; varying vec3 vDir;
void main(){
  float h = clamp(vDir.y, 0.0, 1.0);
  vec3 c = mix(uHor, uTop, pow(h, 0.55));
  float s = max(dot(normalize(vDir), normalize(uSunDir)), 0.0);
  c += uSunCol * (pow(s, 700.0) * 1.6 + pow(s, 14.0) * 0.16 * (1.0 - uNight * 0.5));
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`,
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(7000, 32, 16), skyMat); sky.frustumCulled = false; sky.renderOrder = 10; scene.add(sky);
const stars = (() => {
  const n = 1400, pos = new Float32Array(n * 3), r = rng(7);
  for (let k = 0; k < n; k++) { const a = r() * Math.PI * 2, y = 0.08 + r() * 0.92, rr = Math.sqrt(1 - y * y); pos.set([Math.cos(a) * rr * 6500, y * 6500, Math.sin(a) * rr * 6500], k * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color: 0xffffff, size: 1.7, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 11; scene.add(pts); return pts;
})();

/* ---------------- water: shoreline distance baked once into a texture ---------------- */
const SHAPES = ISL.map((i) => ({ x: i.x, z: i.z, hex: false, r: i.kind === 'wreck' ? 3 : i.r }));
function sdHexJS(px, py, r) {
  const kx = -0.866025404, ky = 0.5, kz = 0.577350269;
  px = Math.abs(px); py = Math.abs(py);
  const dd = 2 * Math.min(kx * px + ky * py, 0); px -= dd * kx; py -= dd * ky;
  px -= clamp(px, -kz * r, kz * r); py -= r;
  return Math.hypot(px, py) * Math.sign(py);
}
const DIST_EXT = 1000, DIST_N = 512, DIST_MAX = 80;
function buildDistanceField() {
  const t0 = performance.now();
  const data = new Uint8Array(DIST_N * DIST_N); const step = (2 * DIST_EXT) / DIST_N;
  for (let j = 0; j < DIST_N; j++) {
    const z = -DIST_EXT + (j + 0.5) * step;
    for (let i = 0; i < DIST_N; i++) {
      const x = -DIST_EXT + (i + 0.5) * step; let d = DIST_MAX;
      for (let k = 0; k < SHAPES.length; k++) {
        const s = SHAPES[k]; const qx = x - s.x, qz = z - s.z;
        if ((Math.abs(qx) + Math.abs(qz)) * 0.7071 - s.r * 1.16 > d) continue; // cheap lower bound
        const di = s.hex ? sdHexJS(qx, qz, s.r * 0.8660254) : Math.sqrt(qx * qx + qz * qz) - s.r;
        if (di < d) d = di;
      }
      data[j * DIST_N + i] = d <= 0 ? 0 : Math.min(255, Math.round((d / DIST_MAX) * 255));
    }
  }
  const tex = new THREE.DataTexture(data, DIST_N, DIST_N, THREE.RedFormat, THREE.UnsignedByteType);
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = false;
  tex.wrapS = THREE.ClampToEdgeWrapping; tex.wrapT = THREE.ClampToEdgeWrapping; tex.needsUpdate = true;
  PERF_INIT.distMs = performance.now() - t0;
  return tex;
}
const islVec = Array.from({ length: MAXI }, () => new THREE.Vector4(1e5, 1e5, 0, 0));
SHAPES.slice(0, MAXI).forEach((s, k) => islVec[k].set(s.x, s.z, s.r, s.hex ? 1 : 0));
const waterMat = new THREE.ShaderMaterial({
  defines: { USE_DIST_TEX: '' },
  uniforms: {
    uTime: TIME_U, uAmp: AMP_U, uDeep: { value: C('#176579') }, uShallow: { value: C('#48c2bc') }, uFoam: { value: C('#f6fbf8') },
    uSky: { value: C('#d6ebec') }, uSunCol: { value: C('#fff0cf') }, uSunDir: { value: SUN_DIR.clone() }, uFogCol: { value: C('#cfe4e5') },
    uFogNear: { value: 1500 }, uFogFar: { value: 4600 }, uNight: { value: 0 },
    uDist: { value: buildDistanceField() }, uDistExt: { value: DIST_EXT }, uDistMax: { value: DIST_MAX },
    uIsl: { value: islVec }, uN: { value: Math.min(MAXI, ISL.length) },
  },
  vertexShader: `uniform float uTime; uniform float uAmp; varying vec3 vW; varying vec3 vN;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0);
  float a1 = w.x * 0.021 + uTime * 0.9, a2 = w.z * 0.027 - uTime * 1.1, a3 = (w.x + w.z) * 0.043 + uTime * 1.7;
  w.y += uAmp * (0.9 * sin(a1) + 0.7 * sin(a2) + 0.45 * sin(a3));
  float c3 = 0.45 * 0.043 * cos(a3);
  vN = normalize(vec3(-uAmp * (0.9 * 0.021 * cos(a1) + c3), 1.0, -uAmp * (0.7 * 0.027 * cos(a2) + c3)));
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`,
  fragmentShader: `uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uFoam; uniform vec3 uSky; uniform vec3 uSunCol; uniform vec3 uSunDir; uniform vec3 uFogCol;
uniform float uTime; uniform float uFogNear; uniform float uFogFar; uniform float uNight;
uniform sampler2D uDist; uniform float uDistExt; uniform float uDistMax;
uniform vec4 uIsl[64]; uniform int uN;
varying vec3 vW; varying vec3 vN;
float sdHex(vec2 p, float r){ const vec3 k = vec3(-0.866025404, 0.5, 0.577350269); p = abs(p); p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy; p -= vec2(clamp(p.x, -k.z * r, k.z * r), r); return length(p) * sign(p.y); }
void main(){
#ifdef USE_DIST_TEX
  float dmin = texture2D(uDist, vW.xz / (2.0 * uDistExt) + 0.5).r * uDistMax;
#else
  float dmin = 1e5;
  for (int k = 0; k < 64; k++) {
    if (k >= uN) break;
    vec4 c = uIsl[k]; vec2 q = vW.xz - c.xy;
    float d = c.w > 0.5 ? sdHex(q, c.z * 0.8660254) : length(q) - c.z;
    dmin = min(dmin, d);
  }
#endif
  float sh = 1.0 - smoothstep(0.0, 64.0, dmin);
  vec3 col = mix(uDeep, uShallow, sh * sh * 0.9);
  vec3 N = normalize(vN); vec3 V = normalize(cameraPosition - vW);
  float fres = 1.0 - max(dot(N, V), 0.0); fres *= fres; fres *= fres;
  col = mix(col, uSky, fres * 0.6);
  vec3 Hh = normalize(normalize(uSunDir) + V);
  float spec = pow(max(dot(N, Hh), 0.0), 160.0);
  col += uSunCol * spec * (0.9 - uNight * 0.45);
  float ripple = 0.5 + 0.5 * sin(vW.x * 0.35 + uTime * 1.6) * sin(vW.z * 0.31 - uTime * 1.3);
  float foam = (1.0 - smoothstep(0.0, 3.2, abs(dmin - 1.0))) * (0.55 + 0.45 * ripple);
  col = mix(col, uFoam, clamp(foam, 0.0, 1.0) * 0.8);
  col = mix(col, uFogCol, smoothstep(uFogNear, uFogFar, length(cameraPosition - vW)));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`,
});
function waterGeo(seg) { const g = new THREE.PlaneGeometry(9000, 9000, seg, seg); g.rotateX(-Math.PI / 2); return g; }
const water = new THREE.Mesh(waterGeo(240), waterMat); water.userData.seg = 240; water.frustumCulled = false; water.renderOrder = 1; scene.add(water);
function waveH(x, z, t) { const a = AMP_U.value; return a * (0.9 * Math.sin(x * 0.021 + t * 0.9) + 0.7 * Math.sin(z * 0.027 - t * 1.1) + 0.45 * Math.sin((x + z) * 0.043 + t * 1.7)); }

/* ---------------- materials + geometry helpers ---------------- */
function M(color, o = {}) { return new THREE.MeshStandardMaterial(Object.assign({ color: new THREE.Color(color), flatShading: true, roughness: 0.85, metalness: 0 }, o)); }
function Basic(color, o = {}) { return new THREE.MeshBasicMaterial(Object.assign({ color: new THREE.Color(color) }, o)); }
const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const cyl = (rt, rb, h, s, m) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), m);
const ico = (r, m, d = 0) => new THREE.Mesh(new THREE.IcosahedronGeometry(r, d), m);
const P = (o, x, y, z) => { o.position.set(x, y, z); return o; };
const R = (o, x, y, z) => { o.rotation.set(x, y, z); return o; };
function cylBetween(a, b, r, m) {
  const d = b.clone().sub(a); const len = d.length();
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 5), m);
  c.position.copy(a).addScaledVector(d, 0.5); c.quaternion.setFromUnitVectors(UP, d.normalize()); return c;
}
function frameCube(s, r, m, y) {
  const g = new THREE.Group(); const h = s / 2;
  const V = [[-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h], [-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h]].map((a) => v3(a[0], a[1] + y, a[2]));
  [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([a, b]) => g.add(cylBetween(V[a], V[b], r, m)));
  return g;
}
function palette(hex) {
  const base = new THREE.Color(hex); const hsl = {}; base.getHSL(hsl, THREE.SRGBColorSpace);
  const tone = (l, s = 1) => new THREE.Color().setHSL(hsl.h, clamp(hsl.s * s, 0, 1), clamp(l, 0, 0.97), THREE.SRGBColorSpace);
  return { base, light: tone(hsl.l * 1.25 + 0.08, 0.9), pale: tone(0.88, 0.4), dark: tone(hsl.l * 0.68, 1), deep: tone(hsl.l * 0.45, 1) };
}
const NP = { wall: '#ece6d8', roof: '#b8743a', solar: '#27466a', metal: '#8e9a9c', stone: '#c8bda4', dark: '#3d4a4c', accent: '#d39a3c', gold: '#e3b95e' };
const PAPER = '#f4f1ea';
function dirToCenter(i) { const v = new THREE.Vector2(-i.x, -i.z); if (v.lengthSq() < 1) v.set(0, 1); return v.normalize(); }

/* Harvest: every opaque, untextured, single-sided mesh joins one world batch, tagged with its island. */
const STATIC_GEOS = [], MOTION_GEOS = [];
function isPlainMat(m) { return m && m.isMeshStandardMaterial && !m.transparent && !m.map && m.emissive.getHex() === 0 && m.side === THREE.FrontSide; }
function underKeep(o, root) { let p = o.parent; while (p && p !== root) { if (p.userData.keep) return true; p = p.parent; } return false; }
function harvest(root, islIdx, motion) {
  root.updateMatrixWorld(true);
  const victims = [];
  root.traverse((o) => {
    if (o === root || !o.isMesh || o.isInstancedMesh || o.userData.keep || underKeep(o, root)) return;
    const m = o.material; if (Array.isArray(m) || !isPlainMat(m)) return;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(o.matrixWorld);
    const hasVC = !!(m.vertexColors && g.attributes.color);
    for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal' && !(name === 'color' && hasVC)) g.deleteAttribute(name);
    if (!g.attributes.normal) g.computeVertexNormals();
    const n = g.attributes.position.count;
    if (!hasVC) { const col = new Float32Array(n * 3); for (let k = 0; k < n; k++) { col[k * 3] = m.color.r; col[k * 3 + 1] = m.color.g; col[k * 3 + 2] = m.color.b; } g.setAttribute('color', new THREE.BufferAttribute(col, 3)); }
    g.setAttribute('aIsland', new THREE.BufferAttribute(new Float32Array(n).fill(islIdx), 1));
    if (motion) {
      const pv = new Float32Array(n * 3), mo = new Float32Array(n * 3);
      for (let k = 0; k < n; k++) { pv[k * 3] = motion.pivot.x; pv[k * 3 + 1] = motion.pivot.y; pv[k * 3 + 2] = motion.pivot.z; mo[k * 3] = motion.bob; mo[k * 3 + 1] = motion.spin; mo[k * 3 + 2] = motion.phase; }
      g.setAttribute('aPivot', new THREE.BufferAttribute(pv, 3)); g.setAttribute('aMotion', new THREE.BufferAttribute(mo, 3));
      MOTION_GEOS.push(g);
    } else STATIC_GEOS.push(g);
    victims.push(o);
  });
  for (const o of victims) o.parent.remove(o);
}
/* Bake: whatever is left (glass, glow, textured, two-sided) merges per material, per object. */
function bake(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const plain = [], byMat = new Map(), victims = [];
  root.traverse((o) => {
    if (o === root || !o.isMesh || o.isInstancedMesh || o.userData.keep || underKeep(o, root)) return;
    const m = o.material; if (Array.isArray(m) || m.map) return;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal') g.deleteAttribute(name);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (isPlainMat(m)) {
      const n = g.attributes.position.count, col = new Float32Array(n * 3);
      for (let k = 0; k < n; k++) { col[k * 3] = m.color.r; col[k * 3 + 1] = m.color.g; col[k * 3 + 2] = m.color.b; }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3)); plain.push(g);
    } else { if (!byMat.has(m)) byMat.set(m, []); byMat.get(m).push(g); }
    victims.push(o);
  });
  for (const o of victims) o.parent.remove(o);
  if (plain.length) root.add(new THREE.Mesh(mergeGeometries(plain, false), new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));
  for (const [m, list] of byMat) { const merged = mergeGeometries(list, false); if (merged) root.add(new THREE.Mesh(merged, m)); }
}
/* One material family for every merged batch: Lambert, plus a per-island fade into the haze and optional bob/spin. */
function fadeMat({ vertexColors = true, color = 0xffffff, motion = false, key }) {
  const m = new THREE.MeshLambertMaterial({ vertexColors, flatShading: true, color });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uFade = FADE_U; sh.uniforms.uFadeCol = FADE_COL;
    if (motion) { sh.uniforms.uTime = TIME_U; sh.uniforms.uMotion = MOTION_U; }
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
attribute float aIsland;
uniform float uFade[${MAXI}];
varying float vFade;${motion ? '\nattribute vec3 aPivot;\nattribute vec3 aMotion;\nuniform float uTime;\nuniform float uMotion;' : ''}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
vFade = uFade[int(aIsland + 0.5)];${motion ? `
{ float ang = aMotion.y * uTime * uMotion; float cs = cos(ang), sn = sin(ang); vec3 dv = transformed - aPivot;
  transformed = aPivot + vec3(cs * dv.x + sn * dv.z, dv.y, -sn * dv.x + cs * dv.z) + vec3(0.0, sin(uTime * 0.9 + aMotion.z) * aMotion.x * uMotion, 0.0); }` : ''}`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vFade;\nuniform vec3 uFadeCol;')
      .replace('#include <tonemapping_fragment>', 'gl_FragColor.rgb = mix(gl_FragColor.rgb, uFadeCol, vFade);\n#include <tonemapping_fragment>');
  };
  m.customProgramCacheKey = () => 'arch-fade-' + key;
  return m;
}


/* ---------------- motifs: one landmark per island ---------------- */
const specials = [];
const MOTIFS = {
  compass(p) {
    const g = new THREE.Group();
    g.add(P(cyl(5.4, 5.4, 0.7, 32, M(p.pale)), 0, 0, 0));
    const star = new THREE.Shape();
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; const rr = k % 2 === 0 ? 6.4 : 1.5; const x = Math.sin(a) * rr, y = Math.cos(a) * rr; if (k) star.lineTo(x, y); else star.moveTo(x, y); }
    star.closePath();
    const sg = new THREE.ExtrudeGeometry(star, { depth: 0.5, bevelEnabled: false }); sg.rotateX(-Math.PI / 2);
    g.add(P(new THREE.Mesh(sg, M(p.base)), 0, 0.35, 0));
    g.add(P(R(new THREE.Mesh(new THREE.ConeGeometry(0.75, 5.2, 4), M('#d4473b')), -Math.PI / 2, 0, 0), 0, 1.2, -2.6));
    g.add(P(R(new THREE.Mesh(new THREE.ConeGeometry(0.75, 5.2, 4), M(PAPER)), Math.PI / 2, 0, 0), 0, 1.2, 2.6));
    g.add(P(cyl(0.6, 0.6, 1.4, 12, M('#c79a3e')), 0, 1.0, 0));
    g.rotation.x = 0.5; return g;
  },
  container(p) {
    const g = new THREE.Group();
    g.add(P(cyl(4.6, 4.8, 0.7, 6, M(p.deep)), 0, 0, 0));
    const c = new THREE.Group(); c.add(box(7.2, 3.2, 3.2, M(p.base)));
    for (let k = -3; k <= 3; k++) c.add(P(box(0.25, 3.3, 3.3, M(p.light)), k, 0, 0));
    P(c, 0, 5.4, 0); g.add(c);
    const flame = M('#ffb347', { emissive: C('#ff8a1f'), emissiveIntensity: 1.2 });
    [-2, 2].forEach((x) => g.add(P(R(new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.6, 6), flame), Math.PI, 0, 0), x, 2.6, 0)));
    return g;
  },
  padlock(p) {
    const g = new THREE.Group();
    g.add(P(box(6, 5, 2.4, M(p.base)), 0, 2.5, 0));
    g.add(P(new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.55, 8, 18, Math.PI), M(p.pale)), 0, 5.0, 0));
    g.add(P(R(cyl(0.55, 0.55, 0.3, 12, M(p.deep)), Math.PI / 2, 0, 0), 0, 3.0, 1.25));
    g.add(P(box(0.4, 1.2, 0.2, M(p.deep)), 0, 2.2, 1.25));
    return g;
  },
  hub(p) {
    const g = new THREE.Group(); const c0 = v3(0, 4, 0);
    g.add(P(ico(2.4, M(p.light), 1), 0, 4, 0));
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2; const s = v3(Math.cos(a) * 5.6, 4 + Math.sin(k * 1.7) * 2, Math.sin(a) * 5.6);
      g.add(P(ico(0.95, M(k % 2 ? p.base : p.pale), 0), s.x, s.y, s.z)); g.add(cylBetween(c0, s, 0.14, M(p.dark)));
    }
    g.userData.spin = 0.25; return g;
  },
  scanpage(p) {
    const g = new THREE.Group();
    for (let k = 0; k < 3; k++) g.add(P(box(5.2, 0.35, 6.6, M(k === 2 ? p.pale : p.light)), k * 0.35 - 0.4, k * 0.45, -k * 0.3));
    const page = new THREE.Group(); page.add(box(5.2, 0.3, 6.6, M(PAPER)));
    for (let k = 0; k < 5; k++) page.add(P(box(3.6 - (k % 2) * 1.1, 0.32, 0.32, M(p.dark)), -0.4, 0.05, -2.2 + k * 1.1));
    const bar = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.25, 0.5), Basic('#7fe0ff')); bar.position.y = 0.45; bar.userData.keep = true; page.add(bar);
    P(R(page, 0.5, 0, 0), 0.4, 3.2, 0.6); g.add(page); specials.push({ type: 'scan', obj: bar });
    return g;
  },
  layers(p) {
    const g = new THREE.Group();
    [p.dark, p.base, p.light].forEach((c, k) => g.add(P(box(6.2, 0.6, 4.6, M(c)), k * 0.6 - 0.6, 1 + k * 1.3, -k * 0.5 + 0.5)));
    const top = new THREE.Group(); top.add(box(4.6, 0.2, 3.2, M(p.pale)));
    top.add(P(new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.4, 3), M(p.deep)), -0.6, 0.8, 0.4));
    top.add(P(ico(0.45, M('#f2c14e'), 0), 1.2, 0.9, -0.6));
    P(top, 0.6, 3.9, -0.5); g.add(top); return g;
  },
  wirecube(p) {
    const g = new THREE.Group();
    g.add(frameCube(7, 0.17, M(p.dark), 4.5));
    g.add(P(new THREE.Mesh(new THREE.TorusKnotGeometry(1.7, 0.55, 80, 10), M(p.base, { roughness: 0.5 })), 0, 4.5, 0));
    g.userData.spin = 0.35; return g;
  },
  people(p) {
    const g = new THREE.Group();
    [-2.6, 2.6].forEach((x, k) => { g.add(P(cyl(0.95, 1.3, 3.4, 10, M(k ? p.base : p.light)), x, 1.7, 0)); g.add(P(ico(1.05, M(p.pale), 1), x, 4.3, 0)); });
    g.add(P(new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.26, 8, 24, Math.PI), M(p.dark)), 0, 4.6, 0));
    return g;
  },
  quote(p) {
    const g = new THREE.Group(); const sheet = new THREE.Group(); sheet.add(box(5, 7, 0.3, M(PAPER)));
    for (let k = 0; k < 4; k++) sheet.add(P(box(k === 3 ? 2 : 3.4, 0.35, 0.1, M(p.dark)), k === 3 ? 0.8 : -0.3, 2.2 - k * 1.2, 0.2));
    sheet.add(P(R(new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.35, 14), M(p.base)), Math.PI / 2, 0, 0), 1.3, -2.4, 0.25));
    P(R(sheet, -0.22, 0.25, 0), 0, 4.2, 0); g.add(sheet); return g;
  },
  calendar(p) {
    const g = new THREE.Group();
    g.add(P(box(6, 5.4, 1.8, M(PAPER)), 0, 2.7, 0)); g.add(P(box(6.05, 1.3, 1.85, M(p.base)), 0, 5.1, 0));
    [-1.6, 1.6].forEach((x) => g.add(P(new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.16, 6, 14), M(p.deep)), x, 5.9, 0)));
    const ck = M(p.dark);
    g.add(P(R(box(0.45, 1.4, 0.2, ck), 0, 0, 0.75), -0.6, 2.4, 0.95)); g.add(P(R(box(0.45, 2.6, 0.2, ck), 0, 0, -0.65), 0.5, 2.9, 0.95));
    return g;
  },
  speaker(p) {
    const g = new THREE.Group(); g.add(P(box(4.4, 6, 3.4, M(p.deep)), 0, 3, 0));
    g.add(P(R(new THREE.Mesh(new THREE.CylinderGeometry(1.7, 0.5, 0.9, 16), M(p.light)), Math.PI / 2, 0, 0), 0, 3.6, 2.0));
    for (let k = 0; k < 3; k++) { const a = new THREE.Mesh(new THREE.TorusGeometry(2.3 + k * 1.1, 0.17, 6, 18, Math.PI * 0.6), M(p.base)); a.rotation.set(0, -Math.PI / 2, -Math.PI * 0.3); P(a, 0, 3.6, 2.2); g.add(a); }
    return g;
  },
  coin(p) {
    const g = new THREE.Group();
    [2.4, 3.9, 5.6].forEach((h, k) => g.add(P(box(1.5, h, 1.5, M(k === 2 ? p.light : p.base)), -3 + k * 1.9, h / 2, -0.6)));
    const coin = new THREE.Group(); coin.userData.keep = true;
    coin.add(R(new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.55, 28), M('#e8b44e', { metalness: 0.3, roughness: 0.45 })), Math.PI / 2, 0, 0));
    coin.add(new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.2, 6, 28), M(p.dark)));
    coin.add(box(0.35, 2.2, 0.62, M(p.dark)));
    P(coin, 2.6, 4.6, 0.8); g.add(coin); specials.push({ type: 'coin', obj: coin });
    return g;
  },
  invoice(p) {
    const g = new THREE.Group(); const sheet = new THREE.Group();
    sheet.add(box(5, 6.6, 0.3, M(PAPER))); sheet.add(P(box(5.02, 1.0, 0.34, M(p.base)), 0, 2.8, 0));
    for (let k = 0; k < 3; k++) sheet.add(P(box(3.2, 0.3, 0.1, M(p.dark)), -0.4, 1.4 - k * 1.0, 0.2));
    sheet.add(P(new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.18, 6, 20), M(p.dark)), 1.2, -1.9, 0.2));
    P(R(sheet, -0.2, -0.2, 0), -0.6, 4.0, 0); g.add(sheet);
    const stamp = new THREE.Group(); stamp.userData.keep = true;
    stamp.add(cyl(1.1, 1.1, 0.7, 14, M(p.deep))); stamp.add(P(cyl(0.35, 0.35, 2.4, 8, M(p.dark)), 0, 1.5, 0)); stamp.add(P(ico(0.75, M(p.base), 0), 0, 3.0, 0));
    P(R(stamp, 1.3, 0, 0), 1.6, 2.0, 2.4); g.add(stamp); specials.push({ type: 'stamp', obj: stamp, y0: 2.0 });
    return g;
  },
  scale(p) {
    const g = new THREE.Group();
    g.add(P(cyl(2.4, 2.8, 0.7, 12, M(p.dark)), 0, 0.35, 0)); g.add(P(cyl(0.45, 0.8, 6.2, 8, M(p.base)), 0, 3.6, 0));
    const beam = new THREE.Group(); beam.userData.keep = true; beam.add(box(8.4, 0.35, 0.35, M(p.base)));
    [-4, 4].forEach((x) => { beam.add(P(cyl(0.05, 0.05, 2.4, 4, M(p.deep)), x, -1.2, 0)); beam.add(P(cyl(1.7, 1.2, 0.35, 12, M(p.light)), x, -2.4, 0)); });
    P(beam, 0, 6.8, 0); g.add(beam); specials.push({ type: 'beam', obj: beam });
    return g;
  },
  team(p) {
    const g = new THREE.Group(); g.add(P(box(8.4, 0.6, 3, M(p.dark)), 0, 0.3, 0));
    [-2.7, 0, 2.7].forEach((x, k) => { const t = k === 1 ? 1.2 : 1; g.add(P(cyl(0.9, 1.15, 3.2 * t, 10, M(k === 1 ? p.base : p.light)), x, 0.6 + 1.6 * t, 0)); g.add(P(ico(0.95, M(p.pale), 1), x, 0.6 + 3.2 * t + 1.0, 0)); });
    return g;
  },
  medal(p) {
    const g = new THREE.Group();
    [-0.38, 0.38].forEach((a, k) => g.add(P(R(box(1.3, 4.6, 0.25, M(k ? p.base : p.dark)), 0, 0, a), k ? 0.85 : -0.85, 6.3, 0)));
    g.add(P(R(new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.5, 28), M('#e8c46a', { metalness: 0.3, roughness: 0.4 })), Math.PI / 2, 0, 0), 0, 3.2, 0.1));
    const ck = M(p.deep);
    g.add(P(R(box(0.4, 1.1, 0.2, ck), 0, 0, 0.75), -0.5, 3.0, 0.45)); g.add(P(R(box(0.4, 2.0, 0.2, ck), 0, 0, -0.65), 0.35, 3.35, 0.45));
    return g;
  },
  anvil(p) {
    const g = new THREE.Group();
    g.add(P(box(2.6, 1.6, 2.2, M(p.deep)), 0, 0.8, 0)); g.add(P(box(1.4, 1.4, 1.4, M(p.dark)), 0, 2.3, 0)); g.add(P(box(5.4, 1.1, 2.0, M(p.base)), 0.4, 3.5, 0));
    g.add(P(R(new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.2, 8), M(p.base)), 0, 0, -Math.PI / 2), 4.1, 3.5, 0));
    g.add(P(ico(0.5, M('#ffb347', { emissive: C('#ff7a1a'), emissiveIntensity: 1.4 }), 0), -1.2, 4.4, 0.4));
    return g;
  },
  silo(p) {
    const g = new THREE.Group();
    [-1.8, 1.8].forEach((x, k) => { const h = 5.5 + k; g.add(P(cyl(1.6, 1.6, h, 12, M(k ? p.light : p.base)), x, h / 2, 0)); g.add(P(new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(p.pale)), x, h, 0)); });
    g.add(P(box(5, 0.5, 2.2, M(p.dark)), 0, 0.25, 0)); return g;
  },
  factory() {
    const g = new THREE.Group(); g.add(P(box(11, 4, 6.5, M(NP.wall)), 0, 2, 0));
    for (let k = 0; k < 4; k++) g.add(P(R(new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 6.5, 3, 1), M(k % 2 ? NP.solar : NP.roof)), -Math.PI / 2, 0, 0), -4.1 + k * 2.75, 4.7, 0));
    g.add(P(cyl(0.6, 0.8, 7, 8, M(NP.metal)), 4.6, 3.5, -2.2));
    const gm = M(NP.accent);
    g.add(P(box(0.4, 6, 0.4, gm), -3, 3, 4.6)); g.add(P(box(0.4, 6, 0.4, gm), 3, 3, 4.6)); g.add(P(box(6.6, 0.5, 0.5, gm), 0, 6, 4.6)); g.add(P(box(0.9, 0.9, 0.9, M(NP.dark)), 0.6, 5.2, 4.6));
    return g;
  },
  observatory() {
    const g = new THREE.Group(); g.add(P(cyl(3.2, 3.4, 3.2, 16, M(NP.wall)), 0, 1.6, 0));
    g.add(P(new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(NP.roof)), 0, 3.2, 0));
    g.add(P(box(1.0, 2.4, 3.0, M(NP.dark)), 0, 4.6, 1.6));
    g.add(P(R(cyl(0.5, 0.65, 4.8, 10, M(NP.metal)), 0.95, 0, 0), 0, 5.4, 1.9));
    return g;
  },
  dressform() {
    const g = new THREE.Group();
    const pts = [[0, 0], [1.5, 0.1], [2.2, 1.4], [1.7, 3.1], [2.2, 4.6], [1.5, 5.7], [0.55, 6.1], [0.5, 6.7], [0, 6.8]].map((a) => new THREE.Vector2(a[0], a[1]));
    g.add(P(new THREE.Mesh(new THREE.LatheGeometry(pts, 16), M('#e7d3c3', { roughness: 0.7 })), 0, 3.0, 0));
    g.add(P(cyl(0.18, 0.18, 3.2, 6, M(NP.dark)), 0, 1.6, 0));
    for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2; g.add(cylBetween(v3(0, 0.8, 0), v3(Math.cos(a) * 2, 0, Math.sin(a) * 2), 0.14, M(NP.dark))); }
    g.add(P(R(new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.12, 6, 20), M('#c8556a')), Math.PI / 2, 0, 0), 0, 6.6, 0));
    return g;
  },
  icosa() {
    const g = new THREE.Group(); const eg = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(3.3, 0)); const a = eg.attributes.position.array; const m = M(NP.accent);
    for (let k = 0; k < a.length; k += 6) g.add(cylBetween(v3(a[k], a[k + 1] + 4.5, a[k + 2]), v3(a[k + 3], a[k + 4] + 4.5, a[k + 5]), 0.13, m));
    g.add(P(ico(1.0, M(NP.wall), 1), 0, 4.5, 0)); return g;
  },
  crystal() {
    const g = new THREE.Group(); g.add(P(cyl(1.6, 2.2, 1.0, 10, M(NP.stone)), 0, 0.5, 0)); g.add(P(cyl(0.7, 1.1, 2.4, 10, M(NP.wall)), 0, 2.2, 0));
    const orb = ico(2.6, M('#a6b8ff', { emissive: C('#4a5bd6'), emissiveIntensity: 0.5, transparent: true, opacity: 0.88, roughness: 0.2 }), 2); P(orb, 0, 5.8, 0); g.add(orb);
    glowMats.push({ m: orb.material, day: 0.35, night: 1.3 }); return g;
  },
  globe() {
    const g = new THREE.Group(); g.add(P(cyl(1.8, 2.2, 0.8, 10, M(NP.stone)), 0, 0.4, 0)); g.add(P(cyl(0.3, 0.3, 2.2, 6, M(NP.dark)), 0, 1.6, 0));
    const sph = new THREE.Mesh(new THREE.SphereGeometry(3, 14, 10), M('#5f8fb8', { roughness: 0.6 })); P(sph, 0, 5.6, 0); g.add(sph);
    for (let k = 0; k < 6; k++) { const a = k * 1.3, b = 0.7 * Math.sin(k * 2.1); const blob = ico(1.0, M('#7fae5e'), 0); blob.scale.set(1, 1, 0.4); blob.position.set(Math.cos(a) * Math.cos(b) * 2.85, Math.sin(b) * 2.85, Math.sin(a) * Math.cos(b) * 2.85); blob.lookAt(0, 0, 0); sph.add(blob); }
    g.add(P(R(new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.16, 6, 28, Math.PI * 1.2), M(NP.accent)), 0, 0, -0.6), 0, 5.6, 0));
    return g;
  },
  mast() {
    const g = new THREE.Group(); const m = M(NP.metal); const top = v3(0, 9, 0);
    for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2; g.add(cylBetween(v3(Math.cos(a) * 1.8, 0, Math.sin(a) * 1.8), top, 0.14, m)); }
    g.add(P(R(new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 6, 0, Math.PI * 2, 0, Math.PI / 3), M(NP.wall, { side: THREE.DoubleSide })), -1.1, 0, 0), 0, 6.5, 1.0));
    const lamp = ico(0.45, Basic('#ff5a4f'), 0); lamp.userData.keep = true; P(lamp, 0, 9.3, 0); g.add(lamp); specials.push({ type: 'blink', obj: lamp });
    return g;
  },
  qr() {
    const g = new THREE.Group(); g.add(P(cyl(0.25, 0.25, 4, 6, M(NP.dark)), -2, 2, 0)); g.add(P(cyl(0.25, 0.25, 4, 6, M(NP.dark)), 2, 2, 0));
    const board = new THREE.Group(); board.add(box(6.2, 6.2, 0.35, M('#f7f5ef'))); const blk = M('#141a1b'); const r = rng(hashStr('marca')); const s = 0.58;
    const fin = (cx, cy) => (cx < 3 && cy < 3) || (cx > 5 && cy < 3) || (cx < 3 && cy > 5);
    for (let cx = 0; cx < 9; cx++) for (let cy = 0; cy < 9; cy++) if (fin(cx, cy) || r() > 0.52) board.add(P(box(s, s, 0.1, blk), (cx - 4) * s * 1.1, (4 - cy) * s * 1.1, 0.22));
    P(board, 0, 5.6, 0); g.add(board); return g;
  },
  vault() {
    const g = new THREE.Group(); g.add(P(box(8, 0.8, 6, M(NP.stone)), 0, 0.4, 0)); g.add(P(box(7, 4, 5, M(NP.wall)), 0, 2.8, -0.2));
    const tri = new THREE.Shape([new THREE.Vector2(-3.9, 0), new THREE.Vector2(3.9, 0), new THREE.Vector2(0, 1.9)]);
    const pg = new THREE.ExtrudeGeometry(tri, { depth: 5.4, bevelEnabled: false }); pg.translate(0, 0, -2.9);
    g.add(P(new THREE.Mesh(pg, M(NP.roof)), 0, 4.8, 0));
    for (let k = 0; k < 4; k++) g.add(P(cyl(0.35, 0.4, 4, 8, M(PAPER)), -2.7 + k * 1.8, 2.8, 2.7));
    g.add(P(box(1.6, 2.4, 0.2, M(NP.dark)), 0, 2.0, 2.35)); return g;
  },
  obelisk() {
    const g = new THREE.Group(); g.add(P(box(4, 1, 4, M(NP.stone)), 0, 0.5, 0));
    g.add(P(R(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.2, 9, 4), M(NP.wall)), 0, Math.PI / 4, 0), 0, 5.5, 0));
    g.add(P(R(new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.4, 4), M(NP.accent)), 0, Math.PI / 4, 0), 0, 10.7, 0));
    g.add(P(R(new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.14, 4, 32), M(NP.dark)), Math.PI / 2, 0, 0), 0, 1.05, 0));
    return g;
  },
  rondel() {
    const g = new THREE.Group(); g.add(P(cyl(2.6, 3.0, 6, 12, M(NP.stone)), 0, 3, 0));
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.add(P(box(0.9, 1, 0.9, M(NP.stone)), Math.cos(a) * 2.5, 6.5, Math.sin(a) * 2.5)); }
    g.add(P(cyl(0.12, 0.12, 4, 4, M(NP.dark)), 0, 8, 0));
    g.add(P(new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.3), M('#b5487a', { side: THREE.DoubleSide })), 1.1, 9.3, 0));
    g.add(P(R(box(1.6, 1.6, 1.6, M(PAPER)), 0.5, 0.6, 0.2), 3.6, 0.9, 2.2)); return g;
  },
  trophy() {
    const g = new THREE.Group(); const gold = M(NP.gold, { metalness: 0.4, roughness: 0.35 });
    g.add(P(box(3.4, 1.0, 3.4, M(NP.dark)), 0, 0.5, 0)); g.add(P(cyl(0.4, 0.6, 2.2, 8, gold), 0, 2.1, 0));
    const pts = [[0.2, 0], [1.2, 0.3], [2.4, 1.6], [2.8, 3.4], [2.9, 4.2]].map((a) => new THREE.Vector2(a[0], a[1]));
    g.add(P(new THREE.Mesh(new THREE.LatheGeometry(pts, 16), M(NP.gold, { metalness: 0.4, roughness: 0.35, side: THREE.DoubleSide })), 0, 3.1, 0));
    [-1, 1].forEach((s) => g.add(P(R(new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.18, 6, 14, Math.PI), gold), 0, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2), s * 2.8, 5.3, 0)));
    return g;
  },
  signpost() {
    const g = new THREE.Group(); g.add(P(cyl(3, 3, 0.3, 24, M(NP.stone)), 0, 0.15, 0)); g.add(P(cyl(0.22, 0.22, 7.5, 6, M(NP.dark)), 0, 3.9, 0));
    [[6.6, 0.4, NP.accent], [5.4, -0.9, NP.solar], [4.2, 2.2, NP.roof]].forEach(([y, a, c]) => {
      const arm = new THREE.Group(); arm.add(P(box(3.6, 0.9, 0.25, M(c)), 1.6, 0, 0));
      arm.add(P(R(new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.0, 4), M(c)), 0, 0, -Math.PI / 2), 3.9, 0, 0));
      R(arm, 0, a, 0); P(arm, 0, y, 0); g.add(arm);
    });
    return g;
  },
  flags() {
    const g = new THREE.Group();
    [[-2.5, 0, NP.accent], [0.5, 2, NP.solar], [2.8, -1.2, NP.roof]].forEach(([x, z, c], k) => {
      g.add(P(cyl(0.12, 0.12, 6 + k, 5, M(NP.dark)), x, (6 + k) / 2, z));
      const s = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(2.4, -0.7), new THREE.Vector2(0, -1.4)]);
      g.add(P(new THREE.Mesh(new THREE.ShapeGeometry(s), M(c, { side: THREE.DoubleSide })), x, 6 + k, z));
    });
    return g;
  },
  scaffold() {
    const g = new THREE.Group(); const m = M('#d9a441'); const s = 4.4, h = s / 2;
    const c = [[-h, -h], [h, -h], [h, h], [-h, h]];
    for (const [x, z] of c) g.add(cylBetween(v3(x, 0, z), v3(x, 8, z), 0.12, m));
    for (const y of [2.7, 5.4, 8]) for (let k = 0; k < 4; k++) g.add(cylBetween(v3(c[k][0], y, c[k][1]), v3(c[(k + 1) % 4][0], y, c[(k + 1) % 4][1]), 0.1, m));
    g.add(cylBetween(v3(-h, 0, h), v3(h, 5.4, h), 0.08, m));
    const cm = M('#e0b23e');
    g.add(cylBetween(v3(3.6, 0, -2), v3(3.6, 12, -2), 0.25, cm)); g.add(cylBetween(v3(-2, 12, -2), v3(8, 12, -2), 0.2, cm));
    g.add(cylBetween(v3(6.5, 12, -2), v3(6.5, 8, -2), 0.05, M(NP.dark))); g.add(P(box(1.2, 1.2, 1.2, M(NP.metal)), 6.5, 7.5, -2));
    return g;
  },
};

/* ---------------- shared builders ---------------- */
const treeList = { round: [], palm: [] };
function addTree(type, x, y, z, s, islId) { treeList[type].push({ x, y, z, s, islId, rot: (hashStr(islId + x.toFixed(1)) % 628) / 100 }); }
const solarList = [];
const turbines = [];
const beacons = [];
const floats = [];
const buoysAnim = [];
const storms = [];
const COLS = { sandWet: C('#bba77c'), sand: C('#e7d6a6'), grass: C('#6ea65a'), grass2: C('#88b964'), rock: C('#8f8c7e'), basalt: C('#4d4f4c'), cliff: C('#a39a85') };
function colorFor(h, prof, peak) {
  if (h < 0.4) return COLS.sandWet; if (h < 1.7) return COLS.sand;
  if (prof === 'volcanic') return h > peak * 0.5 ? COLS.basalt : COLS.grass;
  if (prof === 'cliff' && h > peak * 0.7) return COLS.cliff;
  if (h > peak * 0.82 + 1) return COLS.rock;
  return ((h * 7.3) % 1) > 0.5 ? COLS.grass : COLS.grass2;
}
function terrain(i, prof, peak) {
  const n = noise2(hashStr(i.id)); const Rr = i.r; const rings = 10, segs = 32, ext = 1.32;
  const Hh = (t, a) => {
    let f;
    if (prof === 'atoll') f = Math.exp(-Math.pow((t - 0.72) / 0.19, 2)) - (t < 0.55 ? 0.9 * (1 - t / 0.55) : 0);
    else if (prof === 'cliff') f = 1 - smooth(0.74, 1.0, t);
    else if (prof === 'volcanic') f = Math.pow(Math.max(0, 1 - t), 1.3) - (t < 0.16 ? 0.25 * (1 - t / 0.16) : 0);
    else f = Math.max(0, 1 - t * t);
    const nn = n(Math.cos(a) * t * 1.7 + 4.3, Math.sin(a) * t * 1.7 + 9.1);
    if (t <= 1) return peak * f * (0.8 + 0.5 * nn) + 0.9 + (prof === 'atoll' && t < 0.55 ? -3.5 * (1 - t / 0.55) : 0);
    return 0.9 - ((t - 1) / (ext - 1)) * 7;
  };
  const pos = [], col = []; const V = [];
  const center = { x: 0, y: Hh(0, 0), z: 0 };
  for (let k = 1; k <= rings; k++) {
    const row = []; const t = (k / rings) * ext;
    for (let s = 0; s < segs; s++) { const a = (s / segs) * Math.PI * 2; const jit = 1 + 0.1 * n(Math.cos(a) * 2.1 + 1.7, Math.sin(a) * 2.1 - 3.3); const rr = t * Rr * jit; row.push({ x: Math.cos(a) * rr, y: Hh(t, a), z: Math.sin(a) * rr }); }
    V.push(row);
  }
  const tri = (p, q, w) => { pos.push(p.x, p.y, p.z, q.x, q.y, q.z, w.x, w.y, w.z); const c = colorFor((p.y + q.y + w.y) / 3, prof, peak); for (let m = 0; m < 3; m++) col.push(c.r, c.g, c.b); };
  for (let s = 0; s < segs; s++) tri(center, V[0][(s + 1) % segs], V[0][s]);
  for (let k = 0; k < rings - 1; k++) for (let s = 0; s < segs; s++) { const a = V[k][s], b = V[k][(s + 1) % segs], c = V[k + 1][s], d = V[k + 1][(s + 1) % segs]; tri(a, b, c); tri(b, d, c); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
  mesh.userData.noBake = true;
  return { mesh, H: Hh };
}
function turbineAt(g, x, y, z, s = 1) {
  const t = new THREE.Group(); const m = M('#eef0ec');
  t.add(P(cyl(0.22, 0.4, 12, 6, m), 0, 6, 0)); t.add(P(box(0.9, 0.9, 1.8, m), 0, 12.2, 0));
  const rotor = new THREE.Group(); rotor.userData.keep = true;
  for (let k = 0; k < 3; k++) { const b = box(0.5, 5.4, 0.15, m); b.position.y = 2.7; const arm = new THREE.Group(); arm.add(b); arm.rotation.z = (k / 3) * Math.PI * 2; rotor.add(arm); }
  P(rotor, 0, 12.2, 1.0); t.add(rotor); t.position.set(x, y, z); t.scale.setScalar(s); g.add(t); turbines.push(rotor);
}
/* ---------------- island builders ---------------- */
function buildOrganic(i, g) {
  const prof = i.profile || 'hill'; const r = i.r; const pal = palette(D.cats[i.cat].color);
  const peak = prof === 'atoll' ? 2.6 : prof === 'cliff' ? r * 0.5 : prof === 'volcanic' ? r * 0.75 : r * 0.34;
  const { mesh, H: Hh } = terrain(i, prof, peak); g.add(mesh);
  const toC = dirToCenter(i); const cAng = Math.atan2(toC.y, toC.x);
  let lx = 0, lz = 0; if (prof === 'atoll') { lx = toC.x * r * 0.72; lz = toC.y * r * 0.72; }
  const ly = Math.max(Hh(Math.hypot(lx, lz) / r, Math.atan2(lz, lx)), 1.2);
  const motif = MOTIFS[i.motif] ? MOTIFS[i.motif](pal, i) : new THREE.Group();
  const sc = clamp(r / 18, 0.65, 1.1); motif.scale.setScalar(sc); motif.position.set(lx, ly - 0.2, lz); g.add(motif);
  // A pennant in the colour of the island's sea (its public category), on the shore facing the middle of the chart.
  const fa = cAng + 0.9, ft = prof === 'atoll' ? 0.72 : 0.5;
  const fx = Math.cos(fa) * r * ft, fz = Math.sin(fa) * r * ft, fy = Math.max(Hh(ft, fa), 1.2) - 0.3;
  const pennant = new THREE.Group(); pennant.position.set(fx, fy, fz); pennant.rotation.y = -fa;
  pennant.add(P(cyl(0.16, 0.18, 8.5, 5, M(NP.dark)), 0, 4.25, 0));
  pennant.add(P(box(0.16, 2.3, 3.8, M(pal.base)), 0, 7.2, 1.9));
  g.add(pennant);
  const rnd = rng(hashStr(i.id + 't')); const n = Math.round(r * (prof === 'atoll' ? 0.9 : 1.1));
  for (let k = 0; k < n; k++) {
    const t = prof === 'atoll' ? 0.6 + rnd() * 0.26 : 0.22 + rnd() * 0.66; const a = rnd() * Math.PI * 2;
    const x = Math.cos(a) * t * r, z = Math.sin(a) * t * r; if (Math.hypot(x - lx, z - lz) < 6 * sc || Math.hypot(x - fx, z - fz) < 3) continue;
    const y = Hh(t, a); if (y < 1.4) continue;
    addTree(prof === 'atoll' || t > 0.78 ? 'palm' : 'round', i.x + x, y, i.z + z, 0.6 + rnd() * 0.6, i.id);
  }
  if (i.lifecycle === 'incubating') { const s2 = MOTIFS.scaffold(); s2.scale.setScalar(0.55); s2.position.set(lx + 5, ly, lz - 4); g.add(s2); }
  if (hashStr(i.id) % 3 === 0) {
    let a = Math.atan2(lz, lx) + Math.PI + 0.7; if (Math.abs(angDiff(a, fa)) < 0.8) a += 1.6;
    const t = 0.5; turbineAt(g, Math.cos(a) * r * t, Hh(t, a) - 0.3, Math.sin(a) * r * t, 0.85);
  }
  if (i.motif === 'icosa') floats.push({ obj: motif, baseY: motif.position.y, phase: 1.3, spin: 0.3, still: true });
  return { motif, labelY: Math.max(ly + 12 * sc, peak + 4) + 6 };
}
function buildWreck(i, g) {
  g.add(P(R(box(3.4, 2, 9, M('#4b3a2c')), 0.12, 0.6, 0.55), 0, -0.3, 0));
  g.add(P(R(cyl(0.22, 0.22, 7, 5, M('#5a4636')), 0.25, 0, -0.65), 0.6, 2.2, -0.8));
  const buoy = new THREE.Group(); buoy.userData.keep = true;
  for (let k = 0; k < 4; k++) buoy.add(new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 2.4, 8, 1, false, (k * Math.PI) / 2, Math.PI / 2), M(k % 2 ? '#f2c94c' : '#2a5bd7', { side: THREE.DoubleSide })));
  buoy.add(P(cyl(0.12, 0.12, 2.2, 4, M('#2a2f30')), 0, 2.3, 0)); buoy.add(P(box(1.3, 0.25, 0.25, M('#f2c94c')), 0, 3.3, 0)); buoy.add(P(box(0.25, 1.3, 0.25, M('#f2c94c')), 0, 3.3, 0));
  buoy.position.set(7, 0.6, 3); g.add(buoy); buoysAnim.push({ obj: buoy, x: i.x + 7, z: i.z + 3, phase: hashStr(i.id) % 7 });
  return { labelY: 12 };
}


/* ---------------- chart light characteristics ---------------- */
function flashes(t, per, n) { const ph = t % per; for (let k = 0; k < n; k++) { const s = k * 0.9; if (ph >= s && ph < s + 0.5) return 1; } return 0; }
const LIGHT = {
  live: { color: '#3fe07f', fn: (t) => flashes(t, 4, 1) },
  beta: { color: '#3fe07f', fn: (t) => flashes(t, 6, 2) },
  incubating: { color: '#ffd24a', fn: (t) => flashes(t, 3, 1) },
  degraded: { color: '#ff4a3d', fn: (t) => ((t % 1) < 0.35 ? 1 : 0) },
  wreck: { color: '#3b74ff', alt: '#ffd24a', fn: () => 1 },
};

/* ---------------- point batches: one draw call each for beacons and wake ---------------- */
function pointsBatch(n, additive) {
  const g = new THREE.BufferGeometry();
  const mk = (size) => new THREE.BufferAttribute(new Float32Array(n * size), size).setUsage(THREE.DynamicDrawUsage);
  g.setAttribute('position', mk(3)); g.setAttribute('aColor', mk(3)); g.setAttribute('aSize', mk(1)); g.setAttribute('aAlpha', mk(1));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: { uScale: PX_SCALE },
    vertexShader: `attribute vec3 aColor; attribute float aSize; attribute float aAlpha; uniform float uScale; varying vec3 vColor; varying float vAlpha;
void main(){ vColor = aColor; vAlpha = aAlpha; vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aAlpha <= 0.0 ? 0.0 : clamp(aSize * uScale / max(-mv.z, 1.0), 1.0, 96.0); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vColor; varying float vAlpha;
void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; float a = 1.0 - smoothstep(0.0, 1.0, r); a *= a; if (a * vAlpha < 0.004) discard;
  gl_FragColor = vec4(vColor, a * vAlpha);
  #include <colorspace_fragment>
}`,
  });
  const p = new THREE.Points(g, m); p.frustumCulled = false; scene.add(p); return p;
}

/* ---------------- build every island, then fold them into a handful of batches ---------------- */
const ents = new Map();
const pickables = [];
const BEACONS = [];
function makeLabel(i, y) {
  const wrap = document.createElement('div'); const el = document.createElement('div'); el.className = 'lbl'; el.dataset.id = i.id;
  const dot = document.createElement('i'); dot.className = 'dot'; dot.style.background = i.kind === 'wreck' ? '#8a9a9c' : D.cats[i.cat].color;
  const nm = document.createElement('span'); nm.textContent = i.name;
  el.append(dot, nm); el.setAttribute('aria-label', i.name); wrap.appendChild(el);
  el.addEventListener('click', (e) => { e.stopPropagation(); pickIsland(i.id); });
  const obj = new CSS2DObject(wrap); obj.center.set(0.5, 1); obj.position.set(i.x, y, i.z); labelScene.add(obj);
  return { wrap, el, nm, obj };
}
const tBuild = performance.now();
for (const i of ISL) {
  const g = new THREE.Group(); g.position.set(i.x, 0, i.z); scene.add(g);
  const res = i.kind === 'wreck' ? buildWreck(i, g) : buildOrganic(i, g);
  g.updateMatrixWorld(true);
  if (res.motif) {
    res.motif.userData.keep = true;
    const fl = floats.find((f) => f.obj === res.motif);
    const bob = fl && !fl.still ? 0.6 : 0, spin = fl ? fl.spin || 0 : 0;
    const pivot = new THREE.Vector3(); res.motif.getWorldPosition(pivot);
    harvest(res.motif, i.idx, bob || spin ? { pivot, bob, spin, phase: fl ? fl.phase : 0 } : null);
    bake(res.motif);
  }
  harvest(g, i.idx, null);
  bake(g);
  const labelY = res.labelY;
  const lt = i.kind === 'wreck' ? 'wreck' : LIGHT[i.lifecycle] ? i.lifecycle : null;
  let beacon = null;
  if (lt) {
    const L = LIGHT[lt];
    beacon = { k: BEACONS.length, idx: i.idx, x: i.x, y: labelY - 3, z: i.z, fn: L.fn, phase: (hashStr(i.id) % 997) / 97, col: new THREE.Color(L.color), alt: L.alt ? new THREE.Color(L.alt) : null, scale: i.kind === 'wreck' ? 0.6 : 1 };
    BEACONS.push(beacon);
  }
  const label = makeLabel(i, labelY);
  const pick = new THREE.Mesh(new THREE.CylinderGeometry(i.r + 4, i.r + 4, labelY + 6, 12), new THREE.MeshBasicMaterial({ visible: false }));
  pick.position.set(i.x, (labelY + 6) / 2 - 3, i.z); pick.userData.id = i.id; scene.add(pick); pickables.push(pick);
  const leftovers = []; g.traverse((o) => { if (o !== g && (o.isMesh || o.isLine || o.isLineSegments)) leftovers.push(o); });
  ents.set(i.id, { i, g, labelY, label, beacon, leftovers, fade: 0, storm: null });
}
for (const r of turbines) bake(r);
for (const b of buoysAnim) bake(b.obj);
for (const s of specials) if (s.obj.isGroup) bake(s.obj);
const worldMesh = new THREE.Mesh(mergeGeometries(STATIC_GEOS, false), fadeMat({ key: 'static' }));
worldMesh.frustumCulled = false; scene.add(worldMesh);
const motionMesh = MOTION_GEOS.length ? new THREE.Mesh(mergeGeometries(MOTION_GEOS, false), fadeMat({ motion: true, key: 'motion' })) : null;
if (motionMesh) { motionMesh.frustumCulled = false; scene.add(motionMesh); }
STATIC_GEOS.length = 0; MOTION_GEOS.length = 0;

/* trees and solar panels: instanced, faded per island in the shader */
(function buildInstances() {
  const roundTrunk = new THREE.CylinderGeometry(0.25, 0.4, 2.4, 5); roundTrunk.translate(0, 1.2, 0);
  const roundTop = new THREE.IcosahedronGeometry(1.9, 0); roundTop.translate(0, 3.6, 0);
  const palmTrunk = new THREE.CylinderGeometry(0.2, 0.32, 4.6, 5); palmTrunk.translate(0, 2.3, 0);
  const palmTop = new THREE.ConeGeometry(2.6, 1.3, 6); palmTop.translate(0, 4.9, 0);
  const trunkMat = fadeMat({ vertexColors: false, color: 0x7a5a3c, key: 'inst' });
  const leafMat = fadeMat({ vertexColors: false, color: 0xffffff, key: 'inst' });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3(), c = new THREE.Color();
  const islandAttr = (list) => new THREE.InstancedBufferAttribute(new Float32Array(list.map((t) => byId.get(t.islId).idx)), 1);
  for (const [type, tG, lG] of [['round', roundTrunk, roundTop], ['palm', palmTrunk, palmTop]]) {
    const L = treeList[type]; if (!L.length) continue;
    tG.setAttribute('aIsland', islandAttr(L)); lG.setAttribute('aIsland', islandAttr(L));
    const trunks = new THREE.InstancedMesh(tG, trunkMat, L.length), leaves = new THREE.InstancedMesh(lG, leafMat, L.length);
    trunks.frustumCulled = false; leaves.frustumCulled = false;
    L.forEach((t, k) => {
      q.setFromAxisAngle(UP, t.rot); sc.setScalar(t.s); pos.set(t.x, t.y - 0.2, t.z); m4.compose(pos, q, sc);
      trunks.setMatrixAt(k, m4); leaves.setMatrixAt(k, m4);
      c.setHSL(type === 'palm' ? 0.26 : 0.29 + ((k * 37) % 7) / 100, 0.45, 0.33 + ((k * 13) % 11) / 100, THREE.SRGBColorSpace); leaves.setColorAt(k, c);
    });
    trunks.instanceMatrix.needsUpdate = true; leaves.instanceMatrix.needsUpdate = true; if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
    scene.add(trunks, leaves);
  }
  if (solarList.length) {
    const pg = new THREE.BoxGeometry(3.2, 0.18, 2.2); const post = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 5); post.translate(0, -0.7, 0);
    pg.setAttribute('aIsland', islandAttr(solarList)); post.setAttribute('aIsland', islandAttr(solarList));
    const panels = new THREE.InstancedMesh(pg, fadeMat({ vertexColors: false, color: 0x24456b, key: 'inst' }), solarList.length);
    const posts = new THREE.InstancedMesh(post, fadeMat({ vertexColors: false, color: 0x6b7779, key: 'inst' }), solarList.length);
    panels.frustumCulled = false; posts.frustumCulled = false;
    const e = new THREE.Euler();
    solarList.forEach((s, k) => {
      pos.set(s.x, s.y, s.z); sc.setScalar(s.s);
      e.set(0, s.rot, 0); q.setFromEuler(e); m4.compose(pos, q, sc); posts.setMatrixAt(k, m4);
      e.set(-0.35, s.rot, 0, 'YXZ'); q.setFromEuler(e); m4.compose(pos, q, sc); panels.setMatrixAt(k, m4);
    });
    panels.instanceMatrix.needsUpdate = true; posts.instanceMatrix.needsUpdate = true; scene.add(panels, posts);
  }
})();

/* beacons: chart light characteristics, one point batch */
const beaconPts = pointsBatch(BEACONS.length, true);
{ const pa = beaconPts.geometry.attributes.position, ca = beaconPts.geometry.attributes.aColor;
  BEACONS.forEach((b) => { pa.setXYZ(b.k, b.x, b.y, b.z); ca.setXYZ(b.k, b.col.r, b.col.g, b.col.b); });
  pa.needsUpdate = true; ca.needsUpdate = true; }

/* ---------------- weather over degraded islands ---------------- */
function addStorm(e) {
  const i = e.i; const g = new THREE.Group(); g.position.set(i.x, e.labelY + 16, i.z);
  const cm = new THREE.MeshStandardMaterial({ color: 0x59616a, flatShading: true, roughness: 1, emissive: new THREE.Color(0xbfd6ff), emissiveIntensity: 0 });
  for (let k = 0; k < 6; k++) { const s = ico(4 + (k % 3) * 1.6, cm, 1); s.position.set((k - 2.5) * 3.2, Math.sin(k) * 1.2, (k % 2) * 2.4 - 1.2); g.add(s); }
  scene.add(g); bake(g);
  const N = 70, pos = new Float32Array(N * 6); const r = rng(hashStr(i.id + 'rain'));
  for (let k = 0; k < N; k++) { const x = (r() - 0.5) * 22, z = (r() - 0.5) * 12, y = r() * (e.labelY + 14); pos.set([x, y, z, x + 0.3, y - 3, z], k * 6); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  const rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0x9fb4c6, transparent: true, opacity: 0.55 })); rain.position.set(i.x, 0, i.z); rain.frustumCulled = false; scene.add(rain);
  e.storm = { g, cm, rain, pos, top: e.labelY + 14, flash: 0 }; storms.push(e.storm);
}
for (const e of ents.values()) if (e.i.lifecycle === 'degraded') addStorm(e);

/* ---------------- docking: how close the boat may come to an island ---------------- */
function collR(o) { return o.kind === 'wreck' ? 6 : o.r * 1.15 + 3; }
function dockPoint(o, tx, tz) { const v = new THREE.Vector2(tx - o.x, tz - o.z); if (v.lengthSq() < 1) v.set(0, 1); v.normalize(); const R0 = collR(o) + 9; return new THREE.Vector2(o.x + v.x * R0, o.z + v.y * R0); }

/* sea labels: one per public category, inside its sector */
const textLabels = [];
function textLabel(title, sub, cls, x, y, z) {
  const el = document.createElement('div'); el.className = cls; el.textContent = title;
  if (sub) { const s = document.createElement('small'); s.textContent = sub; el.appendChild(s); }
  const o = new CSS2DObject(el); o.position.set(x, y, z); labelScene.add(o); textLabels.push(o); return o;
}
for (const k of Object.keys(D.cats)) { const c = D.cats[k]; const a = (c.angle * Math.PI) / 180; textLabel(c.label, c.count + ' islands', 'sea', c.labelRho * Math.sin(a), 3, -c.labelRho * Math.cos(a)); }

/* ---------------- the boat ---------------- */
function pvTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  x.fillStyle = '#1e3a5f'; x.fillRect(0, 0, 64, 64); x.strokeStyle = '#9fb6c9'; x.lineWidth = 3; x.strokeRect(0, 0, 64, 64);
  x.strokeStyle = 'rgba(159,182,201,.5)'; x.lineWidth = 1; x.beginPath(); x.moveTo(32, 0); x.lineTo(32, 64); x.stroke();
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
}
const boatObj = (() => {
  const g = new THREE.Group();
  const hullGeo = new THREE.BoxGeometry(4.2, 1.8, 11, 2, 1, 4); const p = hullGeo.attributes.position;
  for (let k = 0; k < p.count; k++) { const z = p.getZ(k), y = p.getY(k); let x = p.getX(k); if (z < -2) x *= Math.max(0.05, 1 - (-z - 2) / 3.5); if (y < 0) x *= 0.7; p.setX(k, x); }
  hullGeo.computeVertexNormals();
  g.add(P(new THREE.Mesh(hullGeo, M('#f2efe7')), 0, 0.5, 0));
  g.add(P(box(4.25, 0.35, 8.2, M('#1d6a73')), 0, 0.2, 1.2));
  g.add(P(box(3.4, 0.3, 6.5, M('#b08a5e')), 0, 1.45, 1.4));
  g.add(P(box(2.6, 1.4, 2.6, M('#f4f1ea')), 0, 2.2, 2.4));
  g.add(P(cyl(0.14, 0.18, 11, 6, M('#3a4446')), 0, 6.6, -0.6));
  const sail = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0, 9.4), new THREE.Vector2(4.6, 0.4)])), new THREE.MeshLambertMaterial({ map: pvTexture(), side: THREE.DoubleSide }));
  sail.position.set(0, 1.9, -0.55); sail.rotation.y = -Math.PI / 2; g.add(sail);
  const pen = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(2, -0.5), new THREE.Vector2(0, -1)])), new THREE.MeshLambertMaterial({ color: 0xc79a3e, side: THREE.DoubleSide }));
  pen.position.set(0, 12.1, -0.6); pen.rotation.y = -Math.PI / 2; g.add(pen);
  g.scale.setScalar(1.25); scene.add(g); bake(g); return g;
})();
const boat = { x: 0, z: 64, heading: Math.PI, speed: 0, mode: 'idle', target: null };
const NWAKE = 44; const wakePts = pointsBatch(NWAKE, false);
{ const ca = wakePts.geometry.attributes.aColor; for (let k = 0; k < NWAKE; k++) ca.setXYZ(k, 1, 1, 1); ca.needsUpdate = true; }
const wakeLife = new Float32Array(NWAKE), wakeSize = new Float32Array(NWAKE);
let wakeIdx = 0, wakeTimer = 0;

/* ---------------- input ---------------- */
const keyState = { up: false, down: false, left: false, right: false, boost: false };
const KEYS = { KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right', ShiftLeft: 'boost', ShiftRight: 'boost' };
const inChrome = (t) => t && t.closest && t.closest('.book, .card, .toolbar, .help, .hud');
const touchInput = () => { PERF.lastInput = performance.now(); };
window.addEventListener('keydown', (e) => {
  touchInput();
  const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  const k = KEYS[e.code]; const chrome = inChrome(t);
  if (k) { if (chrome && k !== 'boost') return; keyState[k] = true; if (k !== 'boost') e.preventDefault(); return; }
  if (e.key === 'Escape') { UI.hideCard(); return; }
  if (chrome || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.code === 'KeyM') toOverview(); else if (e.code === 'KeyH') toHelm();
});
window.addEventListener('keyup', (e) => { const k = KEYS[e.code]; if (k) keyState[k] = false; });
window.addEventListener('blur', () => { for (const k in keyState) keyState[k] = false; });
window.addEventListener('pointermove', touchInput, { passive: true });
window.addEventListener('wheel', touchInput, { passive: true });

const stickEl = document.getElementById('stick'), knob = document.getElementById('knob');
const stick = { active: false, x: 0, y: 0, id: null };
function moveStick(e) {
  const r = stickEl.getBoundingClientRect(); let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
  const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; } stick.x = x; stick.y = y; knob.style.transform = `translate(${x * 33}px, ${y * 33}px)`;
}
stickEl.addEventListener('pointerdown', (e) => { touchInput(); stick.active = true; stick.id = e.pointerId; stickEl.setPointerCapture(e.pointerId); moveStick(e); e.preventDefault(); });
stickEl.addEventListener('pointermove', (e) => { if (stick.active && e.pointerId === stick.id) moveStick(e); });
const endStick = (e) => { if (e.pointerId !== stick.id) return; stick.active = false; stick.x = stick.y = 0; knob.style.transform = ''; };
stickEl.addEventListener('pointerup', endStick); stickEl.addEventListener('pointercancel', endStick);

let interacting = false, lastInteract = 0, downX = 0, downY = 0, downT = 0;
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), seaPlane = new THREE.Plane(UP, 0);
renderer.domElement.addEventListener('pointerdown', (e) => { touchInput(); downX = e.clientX; downY = e.clientY; downT = performance.now(); interacting = true; lastInteract = performance.now(); });
renderer.domElement.addEventListener('pointerup', (e) => {
  interacting = false; lastInteract = performance.now();
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6 || performance.now() - downT > 450) return;
  const rect = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1); ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(pickables, false); if (hits.length) { pickIsland(hits[0].object.userData.id); return; }
  const p = new THREE.Vector3(); if (ray.ray.intersectPlane(seaPlane, p) && Math.hypot(p.x, p.z) < WORLD_R) setCourse(p.x, p.z, null);
});
controls.addEventListener('start', () => { touchInput(); interacting = true; lastInteract = performance.now(); });
controls.addEventListener('end', () => { interacting = false; lastInteract = performance.now(); });

/* ---------------- camera modes ---------------- */
let viewMode = 'overview'; let flight = null; const lastBoatPos = new THREE.Vector3(boat.x, 0, boat.z);
const viewBtn = document.getElementById('btn-view');
function updateViewBtn() { const s = viewBtn.querySelector('span'); if (s) s.textContent = viewMode === 'helm' ? 'Chart view' : 'Helm view'; viewBtn.setAttribute('aria-pressed', String(viewMode === 'helm')); }
function flyTo(pos, target, dur = 1.4) {
  if (reduced) { camera.position.copy(pos); controls.target.copy(target); flight = null; return; }
  flight = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos.clone(), t1: target.clone(), k: 0, dur };
}
function bookShift() { const book = !document.getElementById('app').classList.contains('book-closed') && W() > 760; return book ? 346 / W() : 0; }
function overviewPose(target = v3(0, 0, 110), dist = 1340, pitch = 0.98) {
  const a = Number.isFinite(camera.aspect) && camera.aspect > 0 ? camera.aspect : 1.6; const k = a < 1 ? 1.3 / Math.max(a, 0.45) : a < 1.3 ? 1.15 : 1; const d = dist * k;
  const visW = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * a; const shift = -bookShift() * visW * 0.5;
  const t = target.clone(); t.x += shift; const pos = v3(t.x, Math.sin(pitch) * d, t.z + Math.cos(pitch) * d);
  return { pos, target: t };
}
function toOverview() { viewMode = 'overview'; const o = overviewPose(); flyTo(o.pos, o.target, 1.6); updateViewBtn(); }
function toHelm() {
  viewMode = 'helm'; const fx = Math.sin(boat.heading), fz = -Math.cos(boat.heading);
  const tgt = v3(boat.x, 4, boat.z); flyTo(v3(boat.x - fx * 125, 72, boat.z - fz * 125), tgt, 1.2); updateViewBtn();
}
window.addEventListener('arch:view', () => { touchInput(); if (viewMode === 'helm') toOverview(); else toHelm(); });
let posed = false;
function poseIfReady() { if (posed || W() < 2 || H() < 2) return; camera.aspect = W() / H(); camera.updateProjectionMatrix(); const o = overviewPose(); camera.position.copy(o.pos); controls.target.copy(o.target); controls.update(); posed = true; }
poseIfReady();

/* ---------------- sailing ---------------- */
let dockedId = null;
function setCourse(x, z, id) { boat.mode = 'auto'; boat.target = { x, z, id }; if (viewMode !== 'helm') toHelm(); }
function pickIsland(id) {
  const i = byId.get(id); if (!i) return; touchInput();
  const dp = dockPoint(i, boat.x, boat.z); setCourse(dp.x, dp.y, id);
  UI.showIsland(id); dockedId = id; UI.announce('Course set for ' + i.name);
}
window.addEventListener('arch:pick', (e) => pickIsland(e.detail.id));
window.addEventListener('arch:sail', (e) => pickIsland(e.detail.id));
function steer(dt) {
  let throttle = 0, rudder = 0;
  const manual = keyState.up || keyState.down || keyState.left || keyState.right || (stick.active && Math.hypot(stick.x, stick.y) > 0.12);
  if (manual) {
    PERF.lastInput = performance.now();
    if (boat.mode !== 'manual') { boat.mode = 'manual'; boat.target = null; }
    throttle = (keyState.up ? 1 : 0) - (keyState.down ? 0.45 : 0) + (stick.active ? -stick.y : 0);
    rudder = (keyState.right ? 1 : 0) - (keyState.left ? 1 : 0) + (stick.active ? stick.x : 0);
    if (viewMode !== 'helm' && !flight) toHelm();
  } else if (boat.mode === 'auto' && boat.target) {
    const dx = boat.target.x - boat.x, dz = boat.target.z - boat.z; const dist = Math.hypot(dx, dz);
    if (dist < 7) { boat.mode = 'idle'; boat.target = null; UI.announce('Arrived'); }
    else {
      let ux = dx / dist, uz = dz / dist;
      for (const o of ISL) {
        if (boat.target.id === o.id) continue;
        const ox = boat.x - o.x, oz = boat.z - o.z; const d = Math.hypot(ox, oz); const R0 = collR(o) + 22;
        if (d < R0 && d > 0.01) { const w = (R0 - d) / R0; ux += (ox / d) * w * 2.2; uz += (oz / d) * w * 2.2; }
      }
      const desired = Math.atan2(ux, -uz); const err = angDiff(desired, boat.heading);
      rudder = clamp(err * 2.2, -1, 1); throttle = clamp(dist / 60, 0.25, 1) * (Math.abs(err) > 1.2 ? 0.35 : 1);
    }
  } else if (boat.mode === 'manual') boat.mode = 'idle';
  const boost = keyState.boost ? 1.9 : 1; const maxV = 34 * boost * (boat.mode === 'auto' ? 1.7 : 1);
  boat.speed += (throttle * maxV - boat.speed) * Math.min(1, dt * 1.4);
  if (boat.mode === 'idle' && Math.abs(boat.speed) < 0.05) boat.speed = 0;
  const turn = 1.25 * (0.35 + 0.65 * Math.min(1, Math.abs(boat.speed) / 12));
  boat.heading += rudder * turn * dt * (boat.speed < -0.5 ? -1 : 1);
  boat.x += Math.sin(boat.heading) * boat.speed * dt; boat.z += -Math.cos(boat.heading) * boat.speed * dt;
  for (const o of ISL) { const ox = boat.x - o.x, oz = boat.z - o.z; const d = Math.hypot(ox, oz); const R0 = collR(o); if (d < R0) { const k = (R0 - d) / (d || 1); boat.x += ox * k; boat.z += oz * k; boat.speed *= 0.9; } }
  const rr = Math.hypot(boat.x, boat.z); if (rr > WORLD_R) { boat.x *= WORLD_R / rr; boat.z *= WORLD_R / rr; }
}
function poseBoat(t) {
  const y = waveH(boat.x, boat.z, t);
  const ah = waveH(boat.x + Math.sin(boat.heading) * 4, boat.z - Math.cos(boat.heading) * 4, t);
  const sd = waveH(boat.x + Math.cos(boat.heading) * 2, boat.z + Math.sin(boat.heading) * 2, t);
  boatObj.position.set(boat.x, y + 0.5, boat.z); boatObj.rotation.set(0, 0, 0);
  boatObj.rotateY(-boat.heading); boatObj.rotateX(Math.atan2(ah - y, 4) * 0.8); boatObj.rotateZ(Math.atan2(sd - y, 2) * 0.5);
}
function updateWake(dt, t) {
  const pa = wakePts.geometry.attributes.position, sa = wakePts.geometry.attributes.aSize, aa = wakePts.geometry.attributes.aAlpha;
  wakeTimer -= dt; let any = false;
  if (Q.wake && Math.abs(boat.speed) > 4 && wakeTimer <= 0) {
    wakeTimer = 0.07; const k = wakeIdx++ % NWAKE; wakeLife[k] = 1; wakeSize[k] = 2.6;
    const bx = boat.x - Math.sin(boat.heading) * 7, bz = boat.z + Math.cos(boat.heading) * 7; pa.setXYZ(k, bx, waveH(bx, bz, t) + 0.3, bz); any = true;
  }
  for (let k = 0; k < NWAKE; k++) {
    if (wakeLife[k] <= 0) continue;
    wakeLife[k] -= dt * 0.55; wakeSize[k] *= 1 + dt * 1.3;
    sa.setX(k, wakeSize[k]); aa.setX(k, Math.max(0, wakeLife[k]) * 0.55 * (1 - nightK * 0.4)); any = true;
  }
  if (any) { pa.needsUpdate = true; sa.needsUpdate = true; aa.needsUpdate = true; }
}

/* ---------------- search: matches stay lit, the rest fade into the haze through the fade table ---------------- */
const Q = { rain: true, wake: 1, tier3: 760 };
let labelsDirty = true, mmDirty = true;
function applyFilter() {
  const f = S.filter;
  for (const e of ents.values()) {
    const fade = f && !f.has(e.i.id) ? 0.8 : 0; e.fade = fade; FADE_ARR[e.i.idx] = fade;
    const show = fade < 0.7; for (const o of e.leftovers) o.visible = show;
    if (e.storm) { e.storm.g.visible = show; e.storm.rain.visible = show && Q.rain; }
    e.label.el.classList.toggle('dim', fade > 0);
  }
  mmDirty = true; labelsDirty = true; updateLabels();
}
window.addEventListener('arch:filter', () => { touchInput(); applyFilter(); });
window.addEventListener('arch:overlay', (e) => { touchInput(); if (e.detail.key === 'labels') updateLabels(); });
window.addEventListener('arch:cardclosed', () => { dockedId = null; });

const LABEL_MAX = 3200;
function updateLabels() {
  const show = S.ov.labels;
  for (const e of ents.values()) {
    const max = e.i.kind === 'wreck' ? Math.min(Q.tier3, 650) : LABEL_MAX;
    const d = camera.position.distanceTo(e.label.obj.position); let vis = show && d < max;
    if (e.fade > 0) vis = vis && d < 380;
    if (e.label.obj.visible !== vis) { e.label.obj.visible = vis; labelsDirty = true; }
  }
  for (const o of textLabels) if (o.visible !== show) { o.visible = show; labelsDirty = true; }
}
function updateDocking() {
  // While the boat sails to an island picked in the book or on the chart, keep that island's card.
  if (viewMode !== 'helm' || (boat.mode === 'auto' && boat.target && boat.target.id)) return;
  let best = null, bd = Infinity;
  for (const i of ISL) { const d = Math.hypot(boat.x - i.x, boat.z - i.z) - collR(i); if (d < 30 && d < bd) { bd = d; best = i; } }
  const id = best ? best.id : null;
  if (id !== dockedId) { dockedId = id; if (id) { UI.showIsland(id); UI.announce('Near ' + best.name); } }
}

/* ---------------- minimap + HUD (redrawn only when something on them changed) ---------------- */
const mm = document.getElementById('minimap'); const mmx = mm.getContext('2d'); const MMR = 800;
const hdgEl = document.getElementById('hdg');
function mmColor(i) { return i.kind === 'wreck' ? '#6d7f81' : D.cats[i.cat].color; }
const mmLast = { x: NaN, z: NaN, h: NaN, night: -1 };
function drawMinimap() {
  const night = nightK > 0.5 ? 1 : 0;
  if (!mmDirty && Math.abs(mmLast.x - boat.x) < 0.5 && Math.abs(mmLast.z - boat.z) < 0.5 && Math.abs(mmLast.h - boat.heading) < 0.01 && mmLast.night === night) return;
  mmDirty = false; mmLast.x = boat.x; mmLast.z = boat.z; mmLast.h = boat.heading; mmLast.night = night;
  const cssW = mm.clientWidth || 176; const dpr = Math.min(2, window.devicePixelRatio || 1); const w = Math.max(2, Math.round(cssW * dpr));
  if (mm.width !== w) { mm.width = w; mm.height = w; }
  const c = w / 2, sc = (w / 2 - 2) / MMR;
  mmx.clearRect(0, 0, w, w); mmx.save(); mmx.beginPath(); mmx.arc(c, c, w / 2 - 1, 0, Math.PI * 2); mmx.clip();
  mmx.fillStyle = night ? '#0b2a35' : '#2a7a89'; mmx.fillRect(0, 0, w, w);
  for (const k of Object.keys(D.cats)) {
    const cat = D.cats[k]; const a0 = ((cat.a0 - 90) * Math.PI) / 180, a1 = ((cat.a1 - 90) * Math.PI) / 180; const R1 = 640 * sc;
    mmx.beginPath(); mmx.moveTo(c, c); mmx.arc(c, c, R1, a0, a1); mmx.closePath(); mmx.fillStyle = cat.color + '40'; mmx.fill();
    mmx.beginPath(); mmx.moveTo(c, c); mmx.lineTo(c + Math.cos(a0) * R1, c + Math.sin(a0) * R1); mmx.strokeStyle = 'rgba(255,255,255,.45)'; mmx.lineWidth = dpr; mmx.stroke();
  }
  for (const i of ISL) {
    const e = ents.get(i.id); const x = c + i.x * sc, y = c + i.z * sc; const rr = Math.max(1.8 * dpr, i.r * sc);
    mmx.globalAlpha = 1 - e.fade * 0.75; mmx.fillStyle = mmColor(i);
    mmx.beginPath(); mmx.arc(x, y, rr, 0, Math.PI * 2);
    mmx.fill();
  }
  mmx.globalAlpha = 1;
  mmx.save(); mmx.translate(c + boat.x * sc, c + boat.z * sc); mmx.rotate(boat.heading);
  mmx.beginPath(); mmx.moveTo(0, -7 * dpr); mmx.lineTo(5 * dpr, 6 * dpr); mmx.lineTo(-5 * dpr, 6 * dpr); mmx.closePath();
  mmx.fillStyle = '#ffd36b'; mmx.strokeStyle = '#14191a'; mmx.lineWidth = dpr; mmx.fill(); mmx.stroke(); mmx.restore();
  mmx.restore();
  mmx.beginPath(); mmx.arc(c, c, w / 2 - 1, 0, Math.PI * 2); mmx.strokeStyle = 'rgba(0,0,0,.28)'; mmx.lineWidth = 2; mmx.stroke();
  mmx.fillStyle = 'rgba(255,255,255,.85)'; mmx.font = `${10 * dpr}px "Martian Mono", monospace`; mmx.textAlign = 'center'; mmx.fillText('N', c, 13 * dpr);
}
mm.addEventListener('click', (e) => {
  touchInput();
  const r = mm.getBoundingClientRect(); const wx = (((e.clientX - r.left) / r.width) * 2 - 1) * MMR, wz = (((e.clientY - r.top) / r.height) * 2 - 1) * MMR;
  if (Math.hypot(wx, wz) > WORLD_R) return;
  let best = null, bd = 40; for (const i of ISL) { const d = Math.hypot(wx - i.x, wz - i.z) - i.r; if (d < bd) { bd = d; best = i; } }
  if (best) pickIsland(best.id); else setCourse(wx, wz, null);
});
let hdgLast = -1;
function hud() { const deg = Math.round((((boat.heading * 180) / Math.PI) % 360 + 360) % 360); if (deg !== hdgLast) { hdgLast = deg; hdgEl.textContent = String(deg).padStart(3, '0') + '°'; } }

/* ---------------- per-frame state ---------------- */
function applyNight() {
  for (const k in cur) cur[k].copy(PAL.day[k]).lerp(PAL.night[k], nightK);
  scene.fog.color.copy(cur.fog); renderer.setClearColor(cur.fog); FADE_COL.value.copy(cur.fog);
  const sd = SUN_DIR.clone().lerp(MOON_DIR, nightK).normalize();
  skyMat.uniforms.uTop.value.copy(cur.skyTop); skyMat.uniforms.uHor.value.copy(cur.skyHor); skyMat.uniforms.uNight.value = nightK; skyMat.uniforms.uSunDir.value.copy(sd); skyMat.uniforms.uSunCol.value.copy(cur.sun);
  sun.position.copy(sd).multiplyScalar(1000); sun.color.copy(cur.sun); sun.intensity = lerp(2.5, 0.95, nightK);
  hemi.color.copy(cur.hemiSky); hemi.groundColor.copy(cur.hemiGround); hemi.intensity = lerp(1.15, 0.85, nightK);
  const u = waterMat.uniforms;
  u.uDeep.value.copy(cur.deep); u.uShallow.value.copy(cur.shallow); u.uFoam.value.copy(cur.foam); u.uSky.value.copy(cur.skyHor); u.uSunCol.value.copy(cur.sun); u.uSunDir.value.copy(sd); u.uFogCol.value.copy(cur.fog); u.uNight.value = nightK;
  stars.material.opacity = nightK * 0.9;
  for (const g of glowMats) g.m.emissiveIntensity = lerp(g.day, g.night, nightK);
  mmDirty = true;
}
function updateCamera(dt) {
  if (flight) {
    flight.k += dt / flight.dur; const e = easeInOut(Math.min(1, flight.k));
    camera.position.lerpVectors(flight.p0, flight.p1, e); controls.target.lerpVectors(flight.t0, flight.t1, e);
    if (flight.k >= 1) flight = null; lastBoatPos.set(boat.x, 0, boat.z); return;
  }
  if (viewMode === 'helm') {
    const dx = boat.x - lastBoatPos.x, dz = boat.z - lastBoatPos.z;
    camera.position.x += dx; camera.position.z += dz; controls.target.x += dx; controls.target.z += dz;
    if (!interacting && performance.now() - lastInteract > 1600 && Math.abs(boat.speed) > 3) {
      const off = camera.position.clone().sub(controls.target); const radius = Math.hypot(off.x, off.z);
      const cura = Math.atan2(off.x, off.z); const want = -boat.heading; const na = cura + angDiff(want, cura) * Math.min(1, dt * 0.9);
      off.x = Math.sin(na) * radius; off.z = Math.cos(na) * radius; camera.position.copy(controls.target).add(off);
    }
  }
  lastBoatPos.set(boat.x, 0, boat.z);
}
function updateMotion(dt, t) {
  const mo = reduced ? 0 : 1;
  for (const f of floats) { if (!f.still) f.obj.position.y = f.baseY + Math.sin(t * 0.9 + f.phase) * 0.6 * mo; if (f.spin) f.obj.rotation.y = f.spin * t * mo; }
  if (!reduced) {
    for (const s of specials) {
      if (s.type === 'coin') s.obj.rotation.y = t * 1.2;
      else if (s.type === 'scan') s.obj.position.z = Math.sin(t * 1.4) * 2.9;
      else if (s.type === 'beam') s.obj.rotation.z = Math.sin(t * 0.8) * 0.08;
      else if (s.type === 'stamp') s.obj.position.y = s.y0 + Math.max(0, Math.sin(t * 1.6)) * 1.4;
      else if (s.type === 'blink') s.obj.visible = (t % 1.6) < 0.8;
      else if (s.type === 'ring') { const ph = (t * 0.45 + s.phase) % 1; s.obj.scale.setScalar(1 + ph * 7); s.obj.material.opacity = 0.85 * (1 - ph); }
    }
    for (const r of turbines) r.rotation.z = t * 1.6;
  }
  for (const b of buoysAnim) { b.obj.position.y = waveH(b.x, b.z, t) + 0.6; if (!reduced) b.obj.rotation.z = Math.sin(t * 1.3 + b.phase) * 0.08; }
  for (const s of storms) {
    if (!s.g.visible) continue;
    if (!reduced && Q.rain) {
      const a = s.pos; for (let k = 0; k < a.length; k += 6) { a[k + 1] -= dt * 40; a[k + 4] -= dt * 40; if (a[k + 4] < 0) { a[k + 1] = s.top; a[k + 4] = s.top - 3; } }
      s.rain.geometry.attributes.position.needsUpdate = true; if (Math.random() < dt * 0.35) s.flash = 1;
    }
    s.flash = Math.max(0, s.flash - dt * 4); s.cm.emissiveIntensity = s.flash * 1.6;
  }
  const pa = beaconPts.geometry.attributes, sa = pa.aSize, aa = pa.aAlpha, ca = pa.aColor; let colChanged = false;
  for (const b of BEACONS) {
    const on = reduced ? 0.75 : b.fn(t + b.phase);
    if (b.alt) { const c = ((t + b.phase) % 3) < 1.5 ? b.col : b.alt; ca.setXYZ(b.k, c.r, c.g, c.b); colChanged = true; }
    const fade = FADE_ARR[b.idx];
    aa.setX(b.k, (on ? 0.55 + 0.45 * nightK : 0.07 + 0.08 * nightK) * (1 - fade * 0.85));
    sa.setX(b.k, (on ? 6 + 6 * nightK : 3.5) * b.scale);
  }
  sa.needsUpdate = true; aa.needsUpdate = true; if (colChanged) ca.needsUpdate = true;
}

/* ---------------- runtime benchmark + adaptive quality ---------------- */
const gl = renderer.getContext();
const DEV = (() => {
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const raw = String((dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) || 'Unknown GPU');
  let gpu = raw, backend = '';
  const m = raw.match(/ANGLE \(([^,]+),\s*(?:ANGLE\s+)?([A-Za-z0-9]+)\s+Renderer:\s*([^,]+)/);
  if (m) { gpu = m[3].replace(/\)\s*$/, ''); backend = m[2]; } else { const m2 = raw.match(/ANGLE \(([^,]+),\s*([^,]+?)(?:,|\))/); if (m2) gpu = m2[2]; }
  gpu = gpu.replace(/\((R|TM)\)/g, '').replace(/\s+/g, ' ').trim();
  const ua = navigator.userAgent; let browser = 'Browser', mm2;
  const claude = /Claude\//.test(ua);
  if ((mm2 = ua.match(/Edg\/(\d+)/))) browser = 'Edge ' + mm2[1];
  else if ((mm2 = ua.match(/Chrome\/(\d+)/))) browser = (claude ? 'Claude desktop · Chromium ' : 'Chrome ') + mm2[1];
  else if ((mm2 = ua.match(/Firefox\/(\d+)/))) browser = 'Firefox ' + mm2[1];
  else if ((mm2 = ua.match(/Version\/(\d+)[\d.]*.*Safari/))) browser = 'Safari ' + mm2[1];
  return { gpu, backend, browser, raw };
})();
const pushRing = (arr, v, max) => { arr.push(v); if (arr.length > max) arr.shift(); };
const pct = (arr, p) => { if (!arr.length) return 0; const s = arr.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const PERF = {
  ext: gl.getExtension('EXT_disjoint_timer_query_webgl2'),
  inflight: [], gpu: [], frame: [], cpu: [], refreshSamples: [], lastInterval: 16.7,
  refresh: 1000 / 60, dpr: DPR_MAX, dprMin: Math.max(0.6, DPR_MAX * 0.5), dprMax: DPR_MAX, level: 2, mode: 'auto',
  calib: { phase: 'wait', frames: 0, a: [], b: [], dA: DPR_MAX, dB: DPR_MAX, result: null },
  cooldown: 0, good: 0, ceiling: Infinity, ceilingUntil: 0, eco: false, lastInput: performance.now(), lastDraw: 0, frames: 0,
  status: 'Measuring this device',
};
function updatePxScale() { PX_SCALE.value = renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))); }
function applyDpr(d) {
  d = Math.round(clamp(d, PERF.dprMin, PERF.dprMax) * 100) / 100;
  PERF.dpr = d; if (renderer.getPixelRatio() !== d) { renderer.setPixelRatio(d); renderer.setSize(W(), H()); }
  updatePxScale();
}
function applyLevel(l) {
  l = clamp(l, 0, 2); PERF.level = l;
  const seg = [96, 160, 240][l];
  if (water.userData.seg !== seg) { const old = water.geometry; water.geometry = waterGeo(seg); water.userData.seg = seg; old.dispose(); }
  stars.visible = l >= 1; Q.rain = l >= 1; Q.wake = l >= 1 ? 1 : 0; Q.tier3 = l >= 1 ? 760 : 0;
  for (const s of storms) s.rain.visible = Q.rain && s.g.visible;
  labelsDirty = true;
}
function gpuBegin() { if (!PERF.ext || PERF.inflight.length > 6) return null; const q = gl.createQuery(); gl.beginQuery(PERF.ext.TIME_ELAPSED_EXT, q); return q; }
function gpuEnd(q) { if (!q) return; gl.endQuery(PERF.ext.TIME_ELAPSED_EXT); PERF.inflight.push({ q, phase: PERF.calib.phase, eco: PERF.eco }); }
function gpuPoll() {
  if (!PERF.ext) return;
  const disjoint = gl.getParameter(PERF.ext.GPU_DISJOINT_EXT);
  while (PERF.inflight.length) {
    const it = PERF.inflight[0];
    if (!gl.getQueryParameter(it.q, gl.QUERY_RESULT_AVAILABLE)) break;
    const ns = gl.getQueryParameter(it.q, gl.QUERY_RESULT); gl.deleteQuery(it.q); PERF.inflight.shift();
    if (disjoint) continue;
    const ms = ns / 1e6; pushRing(PERF.gpu, ms, 120);
    const c = PERF.calib; if (c.phase === 'A' && it.phase === 'A') c.a.push(ms); else if (c.phase === 'B' && it.phase === 'B') c.b.push(ms);
  }
}
function snapRefresh(ms) { const opts = [6.94, 8.33, 11.11, 13.33, 16.67]; let best = 16.67, bd = 1e9; for (const o of opts) { const d = Math.abs(o - ms); if (d < bd) { bd = d; best = o; } } return best; }
function startCalibration() {
  const c = PERF.calib; c.phase = 'A'; c.frames = 0; c.a = []; c.b = [];
  c.dA = PERF.mode === 'battery' ? PERF.dpr : PERF.dprMax; applyDpr(c.dA); if (PERF.mode !== 'battery') applyLevel(2);
  PERF.status = 'Benchmarking this device'; pushPerf(true);
}
function stepCalibration() {
  const c = PERF.calib;
  if (c.phase === 'wait') { if (document.visibilityState === 'visible' && PERF.frames > 30) startCalibration(); return; }
  if (c.phase !== 'A' && c.phase !== 'B') return;
  c.frames++;
  if (!PERF.ext && c.frames > 3) (c.phase === 'A' ? c.a : c.b).push(PERF.lastInterval);
  const arr = c.phase === 'A' ? c.a : c.b;
  if (arr.length >= 24 || c.frames > 150) {
    if (c.phase === 'A') { c.phase = 'B'; c.frames = 0; c.dB = Math.max(PERF.dprMin, Math.round(c.dA * 0.6 * 100) / 100); applyDpr(c.dB); }
    else finishCalibration();
  }
}
function finishCalibration() {
  const c = PERF.calib; const mA = pct(c.a, 0.5), mB = pct(c.b, 0.5); const css = Math.max(1, W() * H());
  const pA = css * c.dA * c.dA, pB = css * c.dB * c.dB;
  const b = pA > pB ? Math.max(0, (mA - mB) / (pA - pB)) : 0; const a = Math.max(0, mA - b * pA);
  const budget = PERF.ext ? PERF.refresh * 0.8 : PERF.refresh * 1.1;
  const maxD = PERF.mode === 'balanced' ? PERF.dprMax * 0.85 : PERF.dprMax;
  let d;
  if (PERF.ext) d = b > 0 ? Math.sqrt(Math.max(0, (budget - a) / b) / css) : maxD;
  else d = mA <= budget ? c.dA : (mB <= budget ? c.dB : PERF.dprMin);
  d = clamp(d, PERF.dprMin, maxD);
  const level = a > budget * 0.95 ? 0 : a > budget * 0.7 ? 1 : 2;
  c.result = { gpuAtA: mA, gpuAtB: mB, dA: c.dA, dB: c.dB, fixedMs: a, msPerMpx: b * 1e6, chosen: d, level, timer: !!PERF.ext };
  c.phase = 'done'; PERF.cooldown = 3; PERF.good = 0; PERF.ceiling = Infinity;
  if (PERF.mode === 'sharp') { applyDpr(PERF.dprMax); applyLevel(2); }
  else if (PERF.mode === 'battery') { applyDpr(Math.max(PERF.dprMin, Math.min(1, PERF.dprMax) * 0.7)); applyLevel(0); }
  else { applyDpr(d); applyLevel(level); }
  PERF.status = 'Tuned for this device'; pushPerf(true);
}
function adapt(now) {
  if (PERF.calib.phase !== 'done' || PERF.mode === 'sharp' || PERF.mode === 'battery' || PERF.eco) return;
  if (PERF.cooldown > 0) { PERF.cooldown--; return; }
  const useGpu = !!PERF.ext && PERF.gpu.length >= 30;
  const cost = useGpu ? pct(PERF.gpu.slice(-60), 0.9) : pct(PERF.frame.slice(-60), 0.9);
  const budget = useGpu ? PERF.refresh * 0.8 : PERF.refresh * 1.15;
  const maxD = PERF.mode === 'balanced' ? PERF.dprMax * 0.85 : PERF.dprMax;
  if (cost > budget * 1.08) {
    const nd = clamp(PERF.dpr * Math.sqrt(budget / cost) * 0.97, PERF.dprMin, maxD);
    if (nd < PERF.dpr - 0.03) applyDpr(nd); else if (PERF.level > 0) applyLevel(PERF.level - 1);
    PERF.ceiling = PERF.dpr; PERF.ceilingUntil = now + 20000; PERF.cooldown = 2; PERF.good = 0;
  } else if (cost < budget * 0.62) {
    if (++PERF.good >= 3) {
      PERF.good = 0; PERF.cooldown = 2;
      if (PERF.level < 2) applyLevel(PERF.level + 1);
      else if (PERF.dpr < maxD - 0.01) { const up = Math.min(maxD, PERF.dpr + 0.1); if (!(now < PERF.ceilingUntil && up > PERF.ceiling + 0.001)) applyDpr(up); }
    }
  } else PERF.good = 0;
}
function setQuality(mode) {
  PERF.mode = mode; PERF.cooldown = 1; PERF.lastInput = performance.now();
  if (mode === 'sharp') { applyDpr(PERF.dprMax); applyLevel(2); }
  else if (mode === 'balanced') { applyDpr(Math.min(PERF.dpr, PERF.dprMax * 0.85)); applyLevel(Math.min(PERF.level, 1)); }
  else if (mode === 'battery') { applyDpr(Math.max(PERF.dprMin, Math.min(1, PERF.dprMax) * 0.7)); applyLevel(0); }
  else if (PERF.calib.result) { applyDpr(PERF.calib.result.chosen); applyLevel(PERF.calib.result.level); }
  pushPerf(true);
}
window.addEventListener('arch:quality', (e) => setQuality(e.detail.mode));
window.addEventListener('arch:bench', () => { PERF.lastInput = performance.now(); PERF.calib.phase = 'wait'; PERF.frames = Math.max(PERF.frames, 31); PERF.status = 'Benchmarking this device'; pushPerf(true); });
function isIdle(now) {
  return now - PERF.lastInput > 6000 && boat.mode === 'idle' && Math.abs(boat.speed) < 0.5 && !flight && PERF.calib.phase === 'done';
}
let perfPushT = 0;
function pushPerf(force) {
  const now = performance.now(); if (!force && now - perfPushT < 500) return; perfPushT = now;
  if (!UI.setPerf) return;
  const fr = PERF.frame.slice(-60); const med = pct(fr, 0.5);
  UI.setPerf({
    gpu: DEV.gpu + (DEV.backend ? ' · ' + DEV.backend : ''), browser: DEV.browser,
    display: Math.round(1000 / PERF.refresh) + ' Hz · ' + W() + '×' + H() + ' px · DPR ' + DPR_DEVICE,
    fps: med ? Math.round(Math.min(1000 / med, 1000 / PERF.refresh)) : null, frameP90: pct(fr, 0.9),
    gpuP90: PERF.ext ? pct(PERF.gpu.slice(-60), 0.9) : null, cpuP50: pct(PERF.cpu.slice(-60), 0.5),
    scale: PERF.dpr, level: ['Low', 'Medium', 'High'][PERF.level], calls: renderer.info.render.calls, tris: renderer.info.render.triangles,
    status: PERF.status + (PERF.eco ? ' · idle at 30 fps' : ''), mode: PERF.mode, calib: PERF.calib.result, init: PERF_INIT, aa: AA, timer: !!PERF.ext,
  });
}

/* ---------------- frame loop ---------------- */
const clock = new THREE.Clock(); let clockT = 0, frame = 0, lastTs = 0;
const camPrev = new THREE.Matrix4();
let benchLabels = true;
function step(dt) {
  nightK += ((S.night ? 1 : 0) - nightK) * Math.min(1, dt * (reduced ? 12 : 1.6));
  if (Math.abs(nightK - nightApplied) > 0.0005) { applyNight(); nightApplied = nightK; }
  TIME_U.value = clockT;
  steer(dt);
  poseBoat(clockT); updateWake(dt, clockT);
  updateCamera(dt); controls.update();
  updateMotion(dt, clockT);
  sky.position.copy(camera.position); stars.position.copy(camera.position);
  if (frame % 6 === 0) { updateLabels(); hud(); }
  if (frame % 8 === 0) updateDocking();
  if (frame % 4 === 0) drawMinimap();
}
function draw() {
  const q = gpuBegin(); renderer.render(scene, camera); gpuEnd(q);
  if (labelsDirty || !camPrev.equals(camera.matrixWorld)) { if (benchLabels) labelRenderer.render(labelScene, camera); camPrev.copy(camera.matrixWorld); labelsDirty = false; }
}
function loop(ts) {
  const now = performance.now();
  PERF.eco = PERF.mode === 'battery' || isIdle(now);
  if (PERF.eco && now - PERF.lastDraw < 31) return;
  const interval = lastTs ? ts - lastTs : 16.7; lastTs = ts;
  if (!PERF.eco && interval > 0 && interval < 250) { pushRing(PERF.frame, interval, 120); PERF.lastInterval = interval; if (PERF.frames < 150) pushRing(PERF.refreshSamples, interval, 150); }
  if (PERF.frames === 150) PERF.refresh = Math.min(16.67, snapRefresh(pct(PERF.refreshSamples, 0.05)));
  const t0 = performance.now();
  const dt = Math.min(0.05, clock.getDelta()); clockT += dt; frame++; PERF.frames++;
  step(dt); draw();
  pushRing(PERF.cpu, performance.now() - t0, 120);
  PERF.lastDraw = now;
  gpuPoll(); stepCalibration(); if (frame % 60 === 0) adapt(now); pushPerf(false);
  if (!PERF_INIT.firstFrameMs) PERF_INIT.firstFrameMs = Math.round(performance.now() - T_START);
}
function onResize() {
  const w = W(), h = H(); if (w < 2 || h < 2) return;
  camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); labelRenderer.setSize(w, h); updatePxScale(); poseIfReady(); labelsDirty = true;
}
new ResizeObserver(onResize).observe(stage);

if (window.__ARCH_TEST) {
  window.__ARCH_STATS = () => { gpuPoll(); return { gpu: PERF.gpu.slice(), timer: !!PERF.ext }; };
  window.__ARCH_RESET = () => { PERF.gpu.length = 0; PERF.cpu.length = 0; };
  window.__ARCH_TICK = (n = 1) => { for (let k = 0; k < n; k++) { const dt = 1 / 60; clockT += dt; frame++; step(dt); draw(); gpuPoll(); } return { cam: camera.position.toArray().map((v) => Math.round(v)), calls: renderer.info.render.calls, tris: renderer.info.render.triangles, dpr: PERF.dpr, level: PERF.level }; };
  window.__ARCH_BENCH = (cfg = {}) => {
    if (cfg.dpr) applyDpr(cfg.dpr); if (cfg.level != null) applyLevel(cfg.level);
    if (cfg.water) { const want = cfg.water === 'tex'; const has = 'USE_DIST_TEX' in waterMat.defines; if (want !== has) { if (want) waterMat.defines.USE_DIST_TEX = ''; else delete waterMat.defines.USE_DIST_TEX; waterMat.needsUpdate = true; } }
    if (cfg.labels != null) benchLabels = cfg.labels;
    const px = new Uint8Array(4); const sync = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const run = () => { const dt = 1 / 60; clockT += dt; frame++; step(dt); renderer.render(scene, camera); if (benchLabels) labelRenderer.render(labelScene, camera); };
    for (let k = 0; k < (cfg.warm ?? 12); k++) run(); sync();
    const wall = [], cpu = [];
    for (let k = 0; k < (cfg.n ?? 60); k++) { const t0 = performance.now(); run(); const t1 = performance.now(); sync(); wall.push(performance.now() - t0); cpu.push(t1 - t0); }
    const st = (a) => ({ p10: +pct(a, 0.1).toFixed(2), med: +pct(a, 0.5).toFixed(2), p90: +pct(a, 0.9).toFixed(2) });
    return { cfg, size: [renderer.domElement.width, renderer.domElement.height], dpr: PERF.dpr, level: PERF.level, calls: renderer.info.render.calls, tris: renderer.info.render.triangles, wall: st(wall), cpu: st(cpu), init: PERF_INIT, dev: DEV };
  };
}

PERF_INIT.buildMs = Math.round(performance.now() - tBuild);
applyFilter(); applyNight(); nightApplied = nightK; updateViewBtn(); hud(); updatePxScale();
{ const tc = performance.now(); try { await renderer.compileAsync(scene, camera); } catch (err) { /* compile on first draw instead */ } PERF_INIT.compileMs = Math.round(performance.now() - tc); }
PERF_INIT.distMs = Math.round(PERF_INIT.distMs);
window.__ARCH_OK = true;
renderer.setAnimationLoop(loop);
pushPerf(true);
