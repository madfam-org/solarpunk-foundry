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

test('the baseline states every option a repo would otherwise re-argue', () => {
  for (const option of [
    'printWidth',
    'tabWidth',
    'semi',
    'singleQuote',
    'trailingComma',
    'arrowParens',
    'endOfLine',
  ]) {
    assert.notEqual(config[option], undefined, `${option} is unstated`);
  }
});

test('the baseline matches the style already in the tree, not a new one', () => {
  // Changing any of these three reformats the estate. That is a decision with a
  // migration, not a config edit - the assertion is here so it cannot be one.
  assert.equal(config.singleQuote, true);
  assert.equal(config.semi, true);
  assert.equal(config.printWidth, 100);
});

test('endOfLine is pinned so a CRLF checkout cannot fail the format gate', () => {
  assert.equal(config.endOfLine, 'lf');
});

test('the package is publishable-shaped', () => {
  assert.equal(pkg.private, false);
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.equal(pkg.main, 'index.cjs');
});
