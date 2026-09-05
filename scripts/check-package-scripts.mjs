#!/usr/bin/env node
// Boundary checkpoint (2026-09-04, platform ops): public repo automation.
// Public-safe abstractions only. Policy: docs/PUBLIC_REPO_BOUNDARY.md

/**
 * Every workspace package must define `lint` and `test`.
 *
 * THE DEFECT THIS FIXES (2026-09-04): `package-quality.yml` runs `pnpm -r lint`
 * and `pnpm -r test`. pnpm SKIPS a package that does not define the script, and
 * exits 0. Measured on this workspace before this change: `pnpm -r lint`
 * reported "13 of 14 workspace projects" while 2 packages actually ran, and
 * `pnpm -r test` ran 3. A recursive step that silently skips 11 of 13 packages
 * is not a gate; it is a green check with no coverage behind it.
 *
 * The allowlist is REASONED and CANNOT ROT: an entry naming a package that no
 * longer exists, or a script the package has since gained, is itself a failure.
 * That is the property that keeps an allowlist from quietly becoming the answer.
 *
 * Exit codes:
 *   0  every package defines every required script (or is allowlisted with a reason)
 *   1  a missing script, or a stale allowlist entry
 *   2  UNDETERMINED - no workspace packages were found, so nothing was checked
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REQUIRED_SCRIPTS = ['lint', 'test'];

/**
 * Reasoned exemptions: { "<package name>": { "<script>": "<reason>" } }.
 * A reason is mandatory, and the entry dies with the thing it excuses.
 */
export const ALLOW = {
  '@madfam/ui': {
    lint: 'retired 2026-09-05 (Wave 4.5): a tombstone directory with no source - see packages/ui/README.md',
    test: 'retired 2026-09-05 (Wave 4.5): a tombstone directory with no source - see packages/ui/README.md',
  },
  '@madfam/tsconfig': {
    lint: 'JSON only; there is nothing for ESLint to read. `test` runs and asserts the configs parse, export and stay strict.',
  },
};

function parseWorkspaceGlobs(root) {
  const file = join(root, 'pnpm-workspace.yaml');
  if (!existsSync(file)) return [];
  const globs = [];
  let inPackages = false;
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = raw.replace(/#.*$/, '').trimEnd();
    if (/^packages:\s*$/.test(line)) { inPackages = true; continue; }
    if (inPackages) {
      const m = line.match(/^\s*-\s*['"]?([^'"\s]+)['"]?\s*$/);
      if (m) { globs.push(m[1]); continue; }
      if (line.trim() !== '') inPackages = false;
    }
  }
  return globs;
}

function expandGlob(root, glob) {
  // Only `dir/*` and literal paths are used by this workspace; anything else is
  // reported rather than silently ignored, so an unsupported glob cannot become
  // an invisible coverage hole.
  const dirs = [];
  if (glob.endsWith('/*')) {
    const parent = join(root, glob.slice(0, -2));
    if (!existsSync(parent)) return dirs;
    for (const entry of readdirSync(parent)) {
      const d = join(parent, entry);
      if (statSync(d).isDirectory()) dirs.push(d);
    }
    return dirs;
  }
  if (glob.includes('*')) {
    throw new Error(`unsupported workspace glob (extend expandGlob): ${glob}`);
  }
  const d = join(root, glob);
  if (existsSync(d)) dirs.push(d);
  return dirs;
}

export function checkWorkspace(root, allow = ALLOW) {
  const findings = [];
  const missing = Object.fromEntries(REQUIRED_SCRIPTS.map((s) => [s, 0]));
  const seen = new Map();

  for (const glob of parseWorkspaceGlobs(root)) {
    for (const dir of expandGlob(root, glob)) {
      const manifest = join(dir, 'package.json');
      if (!existsSync(manifest)) continue;
      const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
      const name = pkg.name ?? dir;
      seen.set(name, pkg.scripts ?? {});
    }
  }

  for (const [name, scripts] of seen) {
    for (const script of REQUIRED_SCRIPTS) {
      if (scripts[script]) continue;
      const reason = allow[name]?.[script];
      if (reason) continue;
      missing[script] += 1;
      findings.push(`${name}: no "${script}" script, and no allowlist entry`);
    }
  }

  // Stale allowlist entries. An allowlist that outlives its reason is how a
  // gate loses coverage without anyone editing the gate.
  let stale = 0;
  for (const [name, entry] of Object.entries(allow)) {
    if (!seen.has(name)) {
      stale += 1;
      findings.push(`stale allowlist entry: "${name}" is not a workspace package`);
      continue;
    }
    for (const script of Object.keys(entry)) {
      if (seen.get(name)[script]) {
        stale += 1;
        findings.push(`stale allowlist entry: "${name}" now defines "${script}" - remove the exemption`);
      }
    }
  }

  return { packagesScanned: seen.size, missing, stale, findings };
}

export function main(argv = []) {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = resolve(argv[0] ?? join(here, '..'));
  const r = checkWorkspace(root);

  if (r.packagesScanned === 0) {
    console.error('[package-scripts] UNDETERMINED - no workspace packages found under ' + root);
    console.log('Package script coverage UNDETERMINED - packages_scanned=0');
    return 2;
  }

  for (const f of r.findings) console.error(`[package-scripts] ${f}`);
  if (r.findings.length > 0) {
    console.error(
      '\n`pnpm -r <script>` SKIPS a package that does not define the script and still exits 0.\n' +
        'Add `"lint": "eslint src --max-warnings=0"` and/or\n' +
        '`"test": "vitest run --passWithNoTests"` to the package, or add a reasoned\n' +
        'entry to ALLOW in scripts/check-package-scripts.mjs.'
    );
  }

  console.log(
    `Package script coverage: packages_scanned=${r.packagesScanned} ` +
      `lint_missing=${r.missing.lint} test_missing=${r.missing.test} ` +
      `allow_entries=${Object.keys(ALLOW).length} stale_allow=${r.stale}`
  );
  return r.findings.length === 0 ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main(process.argv.slice(2)));
}
