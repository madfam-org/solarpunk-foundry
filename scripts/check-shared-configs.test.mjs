// Boundary checkpoint (2026-09-04, platform ops): public repo automation test.
// All fixtures are synthetic - no real package, path or host from any record.
// Policy: docs/PUBLIC_REPO_BOUNDARY.md

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { checkSharedConfigs, parseJsonc, resolveSharedOptions } from './check-shared-configs.mjs';

const SHARED_BASE = {
  compilerOptions: { target: 'ES2022', strict: true, skipLibCheck: true },
};
const SHARED_LIBRARY = { extends: './base.json', compilerOptions: { noEmit: false } };

function write(root, relative, contents) {
  const path = join(root, relative);
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, typeof contents === 'string' ? contents : `${JSON.stringify(contents, null, 2)}\n`);
}

/** A workspace with the shared config packages and one adopting package. */
function fixture({ pkgTsconfig, pkgEslint, rootPrettier = '@madfam/prettier-config', deps } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'shared-configs-'));
  write(root, 'packages/tsconfig/package.json', { name: '@madfam/tsconfig', version: '0.1.0' });
  write(root, 'packages/tsconfig/base.json', SHARED_BASE);
  write(root, 'packages/tsconfig/library.json', SHARED_LIBRARY);
  write(root, 'packages/eslint-config/package.json', { name: '@madfam/eslint-config', version: '0.1.0' });
  write(root, 'packages/prettier-config/package.json', { name: '@madfam/prettier-config', version: '0.1.0' });

  write(root, 'packages/alpha/package.json', {
    name: '@madfam/alpha',
    version: '0.1.0',
    devDependencies: deps ?? { '@madfam/eslint-config': 'workspace:*', '@madfam/tsconfig': 'workspace:*' },
  });
  write(
    root,
    'packages/alpha/tsconfig.json',
    pkgTsconfig ?? { extends: '@madfam/tsconfig/library.json', compilerOptions: { outDir: './dist' } }
  );
  write(root, 'packages/alpha/.eslintrc.cjs', pkgEslint ?? "module.exports = { root: true, extends: ['@madfam/eslint-config'] };\n");

  write(root, '.eslintrc.cjs', "module.exports = { root: true, extends: ['@madfam/eslint-config'] };\n");
  write(root, 'package.json', {
    name: 'fixture',
    // `null` means "the field is absent", which a default parameter cannot express.
    ...(rootPrettier === null ? {} : { prettier: rootPrettier }),
    scripts: { format: 'prettier --write .', 'format:check': 'prettier --check .' },
  });
  return root;
}

const EXEMPT = {
  tsconfig: { tsconfig: 'it IS the shared tsconfig', eslint: 'JSON only' },
  'eslint-config': { tsconfig: 'no TypeScript source', eslint: 'it IS the shared config' },
  'prettier-config': { tsconfig: 'no TypeScript source', eslint: 'one CommonJS module' },
};

const check = (root, exempt = EXEMPT) => checkSharedConfigs(root, exempt);

test('an adopting workspace passes, and the run says what it read', () => {
  const r = check(fixture());
  assert.deepEqual(r.findings, []);
  assert.equal(r.packagesScanned, 4);
  assert.equal(r.tsconfigAdopted, 1);
  assert.equal(r.eslintAdopted, 1);
});

test('a package with its own hand-written tsconfig is a finding', () => {
  const r = check(fixture({ pkgTsconfig: { compilerOptions: { target: 'ES2020', strict: true } } }));
  assert.ok(r.findings.some((f) => f.includes('does not extend @madfam/tsconfig/*')));
});

test('a package that extends the shared config without declaring it is a finding', () => {
  const r = check(fixture({ deps: {} }));
  assert.ok(r.findings.some((f) => f.includes('without declaring it as a dependency')));
});

test('a dead override - a value the shared config already sets - is a finding', () => {
  // The failure mode this catches: a package that looks adopted and behaves forked.
  const r = check(
    fixture({ pkgTsconfig: { extends: '@madfam/tsconfig/library.json', compilerOptions: { strict: true } } })
  );
  assert.equal(r.deadOverrides, 1);
  assert.ok(r.findings.some((f) => f.includes('re-states `strict`')));
});

test('a genuine override is NOT a finding', () => {
  const r = check(
    fixture({ pkgTsconfig: { extends: '@madfam/tsconfig/library.json', compilerOptions: { target: 'ES2020' } } })
  );
  assert.equal(r.deadOverrides, 0);
  assert.deepEqual(r.findings, []);
});

test('a package with no eslintrc, or one that does not extend the shared config, is a finding', () => {
  assert.ok(check(fixture({ pkgEslint: 'module.exports = { root: true };\n' })).findings.some((f) => f.includes('does not extend @madfam/eslint-config')));
});

test('a root that does not point prettier at the shared config is a finding', () => {
  const r = check(fixture({ rootPrettier: null }));
  assert.ok(r.findings.some((f) => f.includes('does not point `prettier` at')));
});

test('a second Prettier config anywhere in the tree is a finding', () => {
  const root = fixture();
  write(root, 'packages/alpha/.prettierrc', '{}\n');
  const r = check(root);
  assert.equal(r.prettierConfigsFound, 1);
  assert.ok(r.findings.some((f) => f.includes('is a second Prettier config')));
});

test('an exemption naming a package that does not exist is itself a failure', () => {
  const r = check(fixture(), { ...EXEMPT, ghost: { tsconfig: 'gone' } });
  assert.ok(r.findings.some((f) => f.includes('names a package that does not exist')));
});

test('an exemption the package has outgrown is itself a failure', () => {
  // `alpha` HAS a tsconfig; excusing it from having one must not pass silently.
  const r = check(fixture(), { ...EXEMPT, alpha: { tsconfig: 'stale reason' } });
  assert.ok(r.findings.some((f) => f.includes('is exempt from @madfam/tsconfig') && f.includes('but now has a tsconfig.json')));
});

test('an exemption with an empty reason is a failure', () => {
  const r = check(fixture(), { ...EXEMPT, alpha: { eslint: '' } });
  assert.ok(r.findings.some((f) => f.includes('carries no reason')));
});

test('a workspace with no packages is UNDETERMINED, not clean', () => {
  const root = mkdtempSync(join(tmpdir(), 'shared-configs-empty-'));
  const r = checkSharedConfigs(root, {});
  assert.ok(r.undetermined, 'an empty workspace must not report a clean run');
  rmSync(root, { recursive: true, force: true });
});

test('a tsconfig with comments still parses (tsconfig.json is JSONC)', () => {
  assert.deepEqual(parseJsonc('{\n  // a comment\n  "a": 1 /* and another */\n}'), { a: 1 });
  assert.deepEqual(parseJsonc('{"url": "https://example.test/a//b"}'), { url: 'https://example.test/a//b' });
});

test('the shared options resolve through the extends chain', () => {
  const root = fixture();
  const resolved = resolveSharedOptions(root, '@madfam/tsconfig/library.json');
  assert.equal(resolved.noEmit, false, 'the leaf config wins');
  assert.equal(resolved.strict, true, 'the base is inherited');
});
