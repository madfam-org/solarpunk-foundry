// Boundary checkpoint (2026-09-04, platform ops): public repo automation test.
// All fixtures are synthetic. Policy: docs/PUBLIC_REPO_BOUNDARY.md

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { checkWorkspace } from './check-package-scripts.mjs';

function workspace(packages) {
  const root = mkdtempSync(join(tmpdir(), 'pkgscripts-'));
  writeFileSync(join(root, 'pnpm-workspace.yaml'), "packages:\n  - 'packages/*'\n");
  for (const [name, scripts] of Object.entries(packages)) {
    const dir = join(root, 'packages', name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: `@x/${name}`, scripts }, null, 2));
  }
  return root;
}

const BOTH = { lint: 'eslint src', test: 'vitest run' };

test('missing lint fails', () => {
  const root = workspace({ a: BOTH, b: { test: 'vitest run' } });
  const r = checkWorkspace(root, {});
  assert.equal(r.packagesScanned, 2);
  assert.equal(r.missing.lint, 1);
  assert.equal(r.missing.test, 0);
  assert.ok(r.findings.some((f) => f.includes('@x/b') && f.includes('"lint"')));
});

test('missing test fails', () => {
  const root = workspace({ a: BOTH, b: { lint: 'eslint src' } });
  const r = checkWorkspace(root, {});
  assert.equal(r.missing.test, 1);
});

test('allowlisted package passes', () => {
  const root = workspace({ a: BOTH, b: { lint: 'eslint src' } });
  const r = checkWorkspace(root, { '@x/b': { test: 'no runtime to test; type-only package' } });
  assert.equal(r.missing.test, 0);
  assert.equal(r.findings.length, 0);
});

test('stale allowlist entry fails: the package now defines the script', () => {
  const root = workspace({ a: BOTH });
  const r = checkWorkspace(root, { '@x/a': { test: 'reason that has outlived itself' } });
  assert.equal(r.stale, 1);
  assert.ok(r.findings.some((f) => f.includes('stale') && f.includes('now defines')));
});

test('stale allowlist entry fails: the package no longer exists', () => {
  const root = workspace({ a: BOTH });
  const r = checkWorkspace(root, { '@x/deleted': { lint: 'reason' } });
  assert.equal(r.stale, 1);
  assert.ok(r.findings.some((f) => f.includes('not a workspace package')));
});

test('all-present passes', () => {
  const root = workspace({ a: BOTH, b: BOTH, c: BOTH });
  const r = checkWorkspace(root, {});
  assert.equal(r.packagesScanned, 3);
  assert.equal(r.findings.length, 0);
});

test('an empty workspace is UNDETERMINED, not clean', () => {
  const root = workspace({});
  const r = checkWorkspace(root, {});
  assert.equal(r.packagesScanned, 0);
});

test('a directory without a package.json is not counted as a package', () => {
  const root = workspace({ a: BOTH });
  mkdirSync(join(root, 'packages', 'not-a-package'), { recursive: true });
  const r = checkWorkspace(root, {});
  assert.equal(r.packagesScanned, 1);
});
