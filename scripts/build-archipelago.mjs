#!/usr/bin/env node
// Boundary checkpoint (2026-10-08, platform docs): public repo automation.
// Public-safe abstractions only: the page is built from the vendored PUBLIC
// product projection and from public copy, and nothing else. Client, pricing,
// hub and operational detail never reaches it; that detail stays in the private
// registry in internal-devops. Policy: docs/PUBLIC_REPO_BOUNDARY.md

/**
 * Builds docs/archipelago/index.html, "MADFAM Ecosystem Archipelago": a
 * standalone three.js chart in which every product of the public product
 * registry is an island, placed in one of four seas by its public category.
 *
 * SOURCES (read 2026-10-08):
 *   products  packages/core/src/products/projection.public.json, the vendored
 *             copy of internal-devops `ecosystem/registry/projection.public.json`.
 *             Byte-identical to that file at internal-devops commit
 *             3cfbbfde30784ac2641f2ba14de8c861bd971f24 (2026-10-05, the last
 *             commit that touched it; internal-devops main was
 *             435bc2682bf187fe085eca64b230d5f68f125f2f when it was compared).
 *             The build refuses to run unless the file still hashes to the
 *             committed `.sha256`.
 *   taglines  the `tagline` field only, from internal-devops
 *             `ecosystem/registry/copy/en.yaml` at commit
 *             21b02ca6637d497de2d723b3f76ba2647bb5ee7d (2026-10-04), copied into
 *             TAGLINES below. `value_prop` is deliberately not used.
 *   roles     for a product with no tagline, a short neutral role taken from
 *             this repository's README (§II platform map, read 2026-10-08).
 *             fragua and enclii_depot have neither, and show no description.
 *
 * FIELDS USED per product, and no others: display_name, lifecycle,
 * lifecycle_verified, license, layer, site.category, site.track,
 * domains.primary, and repo only when repo.visibility is "public". Retired
 * products use display_name, retired_on and successor_slug.
 *
 * Island positions, sizes, shapes and landmarks are authored below (LAYOUT) and
 * are illustrative. A product without a layout row, a lifecycle the page cannot
 * draw, an island outside its sea, or two islands that overlap stops the build:
 * re-vendoring the projection is the moment to add the row, never to drop the
 * product silently.
 *
 * Usage:
 *   node scripts/build-archipelago.mjs                     # write docs/archipelago/index.html
 *   node scripts/build-archipelago.mjs --check             # exit 1 if index.html is stale
 *   node scripts/build-archipelago.mjs --fragment <file>   # also write the page without
 *                                                          # doctype/html/head/body wrappers
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTION = join(ROOT, 'packages/core/src/products/projection.public.json');
const TEMPLATE = join(ROOT, 'docs/archipelago/src/template.html');
const MODULE = join(ROOT, 'docs/archipelago/src/archipelago.mjs');
const OUT = join(ROOT, 'docs/archipelago/index.html');
const SCHEMA = 'madfam-product-projection/v1';
const COPY_DATE = '2026-10-04';

// Four seas, one per public `site.category`. Angles are compass bearings in
// degrees (0 = north, clockwise); a0..a1 is the sea's sector.
const SEAS = [
  { category: 'Infrastructure', key: 'infrastructure', color: '#6f9152', a0: -45, a1: 45, angle: 350, labelRho: 120 },
  { category: 'Intelligence', key: 'intelligence', color: '#3f74c0', a0: 45, a1: 115, angle: 62, labelRho: 128 },
  { category: 'Standards', key: 'standards', color: '#9159a6', a0: 245, a1: 315, angle: 280, labelRho: 132 },
  { category: 'Applications', key: 'applications', color: '#d98a2b', a0: 115, a1: 245, angle: 180, labelRho: 130 },
];

// `tagline` from the registry copy (en), see SOURCES.
const TAGLINES = {
  enclii: 'Sovereign Cloud PaaS',
  janua: 'Self-Hosted Identity Platform',
  selva: 'Autonomous Agent Platform',
  forgesight: 'Pricing Intelligence for Digital Fabrication',
  dhanam: 'Wealth & Finance for LATAM Founders',
  fortuna: 'Problem Intelligence API',
  rondelio: 'Game Intelligence Cloud',
  karafiel: 'Mexican Tax & Compliance Intelligence',
  tezca: 'Mexican Regulatory Intelligence',
  avala: 'Competency-Based Training Platform',
  yantra4d: 'Open Parametric Design Platform',
  cotiza: 'Automated Quoting & Estimation',
  'pravara-mes': 'Manufacturing Execution System',
  voxa: 'Augmentative & alternative communication',
};

// Neutral roles from this repository's README, for products with no tagline.
const README_ROLES = {
  'phynd-crm': 'CRM: consent, campaigns, attribution',
  ceq: 'ComfyUI wrapper',
  acervo: 'Records engine',
  kalya: 'Booking and scheduling engine',
  symbiosis: 'Mexican payroll, plus employees, time-off and recruiting',
  nauta: 'Fractional-CTO operating system',
  meridian: 'Global migration law and logistics',
  'fashion-cabinet': 'Parametric fashion commons',
  factlas: 'Geospatial facts',
  periplo: 'Route-collector app',
  'geom-core': 'Geometry-analysis library for WASM and Python (C++17)',
  routecraft: 'Trip-engine SaaS',
  tlacuilo: 'Document intelligence and OCR service',
  telesia: 'Convergence platform for the gaming completionist',
  marca: 'Short links and QR codes',
  lexidrop: 'Domain-acquisition intelligence',
};

// slug: [bearing, distance from the centre, terrain profile, landmark]. Illustrative.
const LAYOUT = {
  enclii: [338, 230, 'hill', 'container'],
  janua: [8, 225, 'cliff', 'padlock'],
  selva: [352, 380, 'hill', 'hub'],
  fragua: [322, 360, 'volcanic', 'anvil'],
  enclii_depot: [22, 370, 'atoll', 'silo'],
  dhanam: [55, 240, 'hill', 'coin'],
  tlacuilo: [100, 250, 'cliff', 'scanpage'],
  forgesight: [48, 400, 'atoll', 'observatory'],
  fortuna: [75, 380, 'atoll', 'crystal'],
  rondelio: [102, 375, 'hill', 'rondel'],
  factlas: [62, 540, 'atoll', 'globe'],
  lexidrop: [92, 530, 'atoll', 'mast'],
  karafiel: [262, 235, 'hill', 'invoice'],
  tezca: [290, 240, 'cliff', 'scale'],
  avala: [255, 390, 'hill', 'medal'],
  meridian: [282, 400, 'cliff', 'obelisk'],
  'geom-core': [300, 540, 'cliff', 'icosa'],
  'phynd-crm': [135, 235, 'hill', 'people'],
  kalya: [160, 240, 'hill', 'calendar'],
  nauta: [185, 235, 'hill', 'compass'],
  symbiosis: [210, 240, 'hill', 'team'],
  cotiza: [236, 235, 'hill', 'quote'],
  yantra4d: [125, 410, 'cliff', 'wirecube'],
  'pravara-mes': [150, 410, 'hill', 'factory'],
  voxa: [175, 400, 'hill', 'speaker'],
  'fashion-cabinet': [200, 410, 'cliff', 'dressform'],
  ceq: [225, 400, 'volcanic', 'layers'],
  acervo: [140, 565, 'hill', 'vault'],
  routecraft: [162, 560, 'hill', 'signpost'],
  telesia: [184, 565, 'hill', 'trophy'],
  marca: [206, 560, 'hill', 'qr'],
  periplo: [228, 555, 'hill', 'flags'],
};
// Retired products: wrecks beside their successor, or in open water without one.
const WRECKS = { penny: [0, 470], sim4d: [118, 505], spark: [330, 565] };
const RADIUS = { live: 21, beta: 19, degraded: 20, incubating: 15 };

const problems = [];
const problem = (msg) => problems.push(msg);
function stop(msg) {
  console.error(`[build-archipelago] ${msg}`);
  process.exit(1);
}
function fnv1a(s) {
  let h = 2166136261;
  for (let k = 0; k < s.length; k++) {
    h ^= s.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const round2 = (v) => Math.round(v * 100) / 100;
function place(bearing, rho) {
  const t = (bearing * Math.PI) / 180;
  return { x: round2(rho * Math.sin(t)), z: round2(-rho * Math.cos(t)) };
}
function inSector(bearing, sea) {
  const b = ((bearing % 360) + 360) % 360;
  for (const shift of [-360, 0, 360]) if (b + shift >= sea.a0 && b + shift <= sea.a1) return true;
  return false;
}

// 1. The vendored projection must be the file the guard hashed.
const raw = readFileSync(PROJECTION);
const sha = createHash('sha256').update(raw).digest('hex');
const pinned = readFileSync(`${PROJECTION}.sha256`, 'utf8').trim().split(/\s+/)[0];
if (sha !== pinned) stop(`projection hash ${sha} does not match the committed .sha256 (${pinned}); re-vendor both together`);
const proj = JSON.parse(raw.toString('utf8'));
if (proj.schema !== SCHEMA) stop(`unexpected projection schema ${proj.schema}`);

// 2. Islands: only the allowed fields leave this function.
const seaByCategory = new Map(SEAS.map((s) => [s.category, s]));
const islands = [];
for (const p of proj.products) {
  const sea = seaByCategory.get(p.site?.category);
  if (!sea) {
    problem(`${p.slug}: category ${p.site?.category} has no sea`);
    continue;
  }
  const lay = LAYOUT[p.slug];
  if (!lay) {
    problem(`${p.slug}: no LAYOUT row; add one`);
    continue;
  }
  if (!(p.lifecycle in RADIUS)) problem(`${p.slug}: lifecycle ${p.lifecycle} has no chart light`);
  if (!inSector(lay[0], sea)) problem(`${p.slug}: bearing ${lay[0]} is outside the ${sea.category} sea`);
  const repo = p.repo && p.repo.visibility === 'public' ? `${p.repo.github_org}/${p.repo.name}` : null;
  islands.push({
    id: p.slug,
    kind: 'island',
    name: p.display_name,
    cat: sea.key,
    ...place(lay[0], lay[1]),
    r: (RADIUS[p.lifecycle] ?? 14) + (fnv1a(p.slug) % 5) - 2,
    profile: lay[2],
    motif: lay[3],
    lifecycle: p.lifecycle,
    verified: p.lifecycle_verified ?? null,
    license: p.license ?? null,
    layer: p.layer ?? null,
    track: p.site?.track ?? null,
    domain: p.domains?.primary ?? null,
    repo,
    role: TAGLINES[p.slug] ?? README_ROLES[p.slug] ?? null,
  });
}
for (const slug of Object.keys(LAYOUT)) if (!proj.products.some((p) => p.slug === slug)) problem(`LAYOUT row ${slug} has no product`);
const known = new Set(islands.map((i) => i.id));
for (const w of proj.retired) {
  const lay = WRECKS[w.slug];
  if (!lay) {
    problem(`retired ${w.slug}: no WRECKS row; add one`);
    continue;
  }
  if (w.successor_slug && !known.has(w.successor_slug)) problem(`retired ${w.slug}: successor ${w.successor_slug} is not on the chart`);
  islands.push({
    id: w.slug,
    kind: 'wreck',
    name: w.display_name,
    cat: null,
    ...place(lay[0], lay[1]),
    r: 6,
    retiredOn: w.retired_on,
    successor: w.successor_slug ?? null,
    role: `Retired ${w.retired_on}.` + (w.successor_slug ? ` Successor: ${islands.find((i) => i.id === w.successor_slug)?.name}.` : ' No successor recorded.'),
  });
}
// The renderer holds at most 64 islands in its fade table.
if (islands.length > 64) problem(`${islands.length} islands; the renderer's fade table holds 64`);
for (let a = 0; a < islands.length; a++) {
  for (let b = a + 1; b < islands.length; b++) {
    const A = islands[a];
    const B = islands[b];
    const need = 1.32 * (A.r + B.r) + 30;
    const dist = Math.hypot(A.x - B.x, A.z - B.z);
    if (dist < need) problem(`${A.id} and ${B.id} overlap: ${dist.toFixed(0)} < ${need.toFixed(0)}`);
  }
}
if (problems.length) stop(`${problems.length} problem(s):\n  ${problems.join('\n  ')}`);

const cats = {};
for (const s of SEAS) {
  cats[s.key] = { label: s.category, color: s.color, a0: s.a0, a1: s.a1, angle: s.angle, labelRho: s.labelRho, count: islands.filter((i) => i.cat === s.key).length };
}
const data = {
  meta: { schema: proj.schema, registryVersion: proj.registry_version, registryUpdated: proj.last_updated, projectionSha256: sha, copyDate: COPY_DATE },
  cats,
  islands,
};

// 3. Render. Function replacers keep `$` sequences in the module literal.
const template = readFileSync(TEMPLATE, 'utf8');
const moduleSrc = readFileSync(MODULE, 'utf8');
const json = JSON.stringify(data).replace(/</g, '\\u003c');
const filled = template
  .replace('/*__ARCH_DATA__*/null', () => json)
  .replace('/*__ARCH_MODULE__*/', () => moduleSrc.trimEnd())
  .replaceAll('__REGISTRY_VERSION__', () => String(proj.registry_version))
  .replaceAll('__REGISTRY_UPDATED__', () => proj.last_updated)
  .replaceAll('__PROJECTION_SCHEMA__', () => proj.schema)
  .replaceAll('__COPY_DATE__', () => COPY_DATE);
for (const marker of ['__ARCH_DATA__', '__ARCH_MODULE__', '__REGISTRY_', '__PROJECTION_', '__COPY_DATE__']) {
  if (filled.includes(marker)) stop(`template marker ${marker} was not filled`);
}
const split = filled.indexOf('<!-- @@HEAD_END@@ -->');
if (split < 0) stop('template has no <!-- @@HEAD_END@@ --> marker');
const head = filled.slice(0, split).trim();
const body = filled.slice(split + '<!-- @@HEAD_END@@ -->'.length).trim();
const page =
  '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<link rel="icon" href="data:,">\n' +
  `${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
const fragment = `${head}\n${body}\n`;

const args = process.argv.slice(2);
const summary = `islands=${islands.filter((i) => i.kind === 'island').length} wrecks=${islands.filter((i) => i.kind === 'wreck').length} seas=${SEAS.length} registry=v${proj.registry_version} (${proj.last_updated}) projection_sha256=${sha.slice(0, 12)} bytes=${Buffer.byteLength(page)}`;
if (args.includes('--check')) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (current !== page) stop(`docs/archipelago/index.html is stale; run node scripts/build-archipelago.mjs (${summary})`);
  console.log(`[build-archipelago] fresh: ${summary}`);
} else {
  writeFileSync(OUT, page);
  console.log(`[build-archipelago] wrote docs/archipelago/index.html: ${summary}`);
}
const fi = args.indexOf('--fragment');
if (fi >= 0) {
  if (!args[fi + 1]) stop('--fragment needs a file path');
  writeFileSync(resolve(args[fi + 1]), fragment);
  console.log(`[build-archipelago] wrote fragment ${args[fi + 1]} (${Buffer.byteLength(fragment)} bytes)`);
}
