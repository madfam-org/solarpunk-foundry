// Boundary checkpoint (2026-09-05, platform ops): public package test.
// Synthetic assertions over this package's own JSON. Policy: docs/PUBLIC_REPO_BOUNDARY.md

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const configs = readdirSync(ROOT).filter((f) => f.endsWith('.json') && f !== 'package.json');

const read = (name) => JSON.parse(readFileSync(join(ROOT, name), 'utf8'));

test('every config file parses and is reachable through the exports map', () => {
  assert.ok(configs.length >= 6, `expected the full config set, found ${configs.length}`);
  for (const name of configs) {
    assert.doesNotThrow(() => read(name), `${name} does not parse`);
    assert.equal(pkg.exports[`./${name}`], `./${name}`, `${name} is not exported`);
  }
});

test('every exports entry names a file that exists', () => {
  // The half that rots: an export pointing at a file someone deleted.
  for (const [entry, target] of Object.entries(pkg.exports)) {
    const name = target.replace('./', '');
    assert.ok(configs.includes(name), `${entry} points at ${target}, which is not in the package`);
  }
});

test('the baseline is strict, and no config quietly turns strictness off', () => {
  // The reason this package exists is one baseline. A config that relaxes it
  // silently is the drift it was created to end - relax it in the consumer, on
  // purpose, where a reviewer sees it.
  assert.equal(read('base.json').compilerOptions.strict, true);
  for (const name of configs) {
    const config = read(name);
    assert.notEqual(config.compilerOptions?.strict, false, `${name} disables strict`);
    assert.notEqual(
      config.compilerOptions?.skipLibCheck,
      false,
      `${name} contradicts the baseline`
    );
  }
});

test('every config but the base extends another config in this package', () => {
  for (const name of configs) {
    const config = read(name);
    if (name === 'base.json') {
      assert.equal(config.extends, undefined, 'base.json must extend nothing');
      continue;
    }
    assert.ok(
      typeof config.extends === 'string' && configs.includes(config.extends.replace('./', '')),
      `${name} must extend a config in this package, not restate the baseline`
    );
  }
});

test('the package is publishable-shaped but carries no build step', () => {
  assert.equal(pkg.private, false);
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.equal(pkg.scripts.build, undefined, 'JSON needs no build');
});
