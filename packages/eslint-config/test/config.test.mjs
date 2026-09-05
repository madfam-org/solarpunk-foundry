// Boundary checkpoint (2026-09-05, platform ops): public package test.
// Synthetic assertions over this package's own config. Policy: docs/PUBLIC_REPO_BOUNDARY.md

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const config = require(join(ROOT, 'index.cjs'));
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

test('the config carries a parser, the plugin and the recommended sets', () => {
  assert.equal(config.parser, '@typescript-eslint/parser');
  assert.deepEqual(config.plugins, ['@typescript-eslint']);
  assert.ok(config.extends.includes('eslint:recommended'));
  assert.ok(config.extends.includes('plugin:@typescript-eslint/recommended'));
});

test('the config does not declare itself root', () => {
  // `root` is the consumer's decision. A shareable config that sets it hijacks
  // every repo that extends it.
  assert.equal(config.root, undefined);
});

test('every plugin and parser the config names is a declared dependency', () => {
  // The half that rots: a rule set that only resolves on the machine it was
  // written on. Anything this config names must come from this package.
  const declared = Object.keys(pkg.dependencies ?? {});
  assert.ok(declared.includes('@typescript-eslint/parser'));
  assert.ok(declared.includes('@typescript-eslint/eslint-plugin'));
  assert.ok(Object.keys(pkg.peerDependencies ?? {}).includes('eslint'));
});

test('the package is publishable-shaped', () => {
  assert.equal(pkg.private, false);
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.equal(pkg.main, 'index.cjs');
});
