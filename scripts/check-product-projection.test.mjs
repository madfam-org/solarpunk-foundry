// Boundary checkpoint (2026-09-04, platform ops): public repo automation test.
// All fixtures are synthetic - no real host, slug or hash from any record.
// Policy: docs/PUBLIC_REPO_BOUNDARY.md

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import {
  GENERATED_PATH,
  LICENSE_ENUM,
  LICENSING_DOC,
  PROJECTION_PATH,
  SHA_PATH,
  checkProjection,
} from './check-product-projection.mjs';

function baseProjection(overrides = {}) {
  return {
    schema: 'madfam-product-projection/v1',
    generated_from: 'internal-devops/ecosystem/registry/products.yaml',
    registry_version: 1,
    last_updated: '2026-01-01',
    export_private_repo_names: true,
    products: [
      {
        slug: 'alpha',
        display_name: 'Alpha',
        lifecycle: 'live',
        lifecycle_verified: '2026-01-01',
        license: 'AGPL-3.0',
        layer: 'soil',
        repo: { name: 'alpha', github_org: 'madfam-org', visibility: 'public' },
        domains: { primary: 'alpha.example', hosts: ['api.alpha.example'], infra_hosts: [] },
        site: { category: 'Infrastructure', track: 'platform', order: 1, icon: 'A', show_in_banner: true },
        commerce: { tiers: ['free'], admin_tier: 'admin' },
      },
    ],
    retired: [
      { slug: 'omega', display_name: 'Omega', retired_on: '2026-01-01', redirect_to: 'https://alpha.example' },
    ],
    ...overrides,
  };
}

/**
 * A fixture repo with the generated files already written from `projection`.
 * Writing first is deliberate: it takes the hash and freshness findings off the
 * table so the semantic assertions below are the only thing under test.
 */
function fixture(projection = baseProjection()) {
  const root = mkdtempSync(join(tmpdir(), 'projection-'));
  mkdirSync(dirname(join(root, PROJECTION_PATH)), { recursive: true });
  mkdirSync(dirname(join(root, LICENSING_DOC)), { recursive: true });
  writeFileSync(
    join(root, LICENSING_DOC),
    `# Licensing\n\n${LICENSE_ENUM.map((l) => `- ${l}`).join('\n')}\n`
  );
  writeFileSync(join(root, PROJECTION_PATH), `${JSON.stringify(projection, null, 2)}\n`);
  checkProjection(root, { write: true });
  return root;
}

function check(root) {
  return checkProjection(root, {});
}

test('a freshly generated tree passes, and says what it read', () => {
  const r = check(fixture());
  assert.deepEqual(r.findings, []);
  assert.equal(r.productsScanned, 1);
  assert.equal(r.tombstones, 1);
  assert.ok(r.hostsChecked > 0, 'a passing run must prove it looked at hostnames');
  assert.equal(r.licencesChecked, LICENSE_ENUM.length);
});

test('a hand edit of the vendored projection fails on the committed hash', () => {
  const root = fixture();
  const edited = baseProjection();
  edited.products[0].license = 'MIT';
  writeFileSync(join(root, PROJECTION_PATH), `${JSON.stringify(edited, null, 2)}\n`);
  const r = check(root);
  assert.ok(r.findings.some((f) => f.includes('does not match its committed hash')));
});

test('a missing hash file is a finding, not a pass', () => {
  const root = fixture();
  writeFileSync(join(root, SHA_PATH), '');
  const r = check(root);
  assert.ok(r.findings.some((f) => f.includes('does not match its committed hash')));
});

test('a hand edit of the generated module is reverted by the freshness diff', () => {
  const root = fixture();
  const generated = readFileSync(join(root, GENERATED_PATH), 'utf8');
  writeFileSync(join(root, GENERATED_PATH), generated.replace('"Alpha"', '"Alpha (hand edited)"'));
  const r = check(root);
  assert.ok(r.findings.some((f) => f.includes('stale or hand-edited')));
});

test('a retired product in the renderable list fails', () => {
  const projection = baseProjection();
  projection.products[0].lifecycle = 'retired';
  const root = fixture(projection);
  const r = check(root);
  assert.ok(r.findings.some((f) => f.includes('would render as a product')));
  assert.ok(r.retiredRendered > 0);
});

test('a tombstone that is also a renderable product fails', () => {
  const projection = baseProjection();
  projection.products.push({
    ...projection.products[0],
    slug: 'omega',
    display_name: 'Omega',
  });
  const root = fixture(projection);
  const r = check(root);
  assert.ok(r.findings.some((f) => f.includes('both a renderable product and a tombstone')));
});

test('a licence outside the enum fails', () => {
  const projection = baseProjection();
  projection.products[0].license = 'WTFPL';
  const root = fixture(projection);
  const r = check(root);
  assert.ok(r.findings.some((f) => f.includes('WTFPL') && f.includes('not in the enum')));
});

test('an enum member missing from LICENSING_STRATEGY.md fails', () => {
  const root = fixture();
  writeFileSync(join(root, LICENSING_DOC), '# Licensing\n\nnothing documented here\n');
  const r = check(root);
  assert.equal(r.findings.filter((f) => f.includes('not documented in')).length, LICENSE_ENUM.length);
});

test('a hostname the projection does not declare fails', () => {
  const projection = baseProjection();
  projection.products[0].display_name = 'Alpha at node-7.internal.example';
  const root = fixture(projection);
  const r = check(root);
  assert.ok(r.findings.some((f) => f.includes('undeclared hostname')));
});

test('an IP literal fails', () => {
  const projection = baseProjection();
  projection.products[0].display_name = 'Alpha 203.0.113.9';
  const root = fixture(projection);
  const r = check(root);
  assert.ok(r.findings.some((f) => f.includes('IP literal')));
});

test('a private-only field fails', () => {
  const projection = baseProjection();
  projection.products[0].notes = 'internal only';
  const root = fixture(projection);
  const r = check(root);
  assert.ok(r.findings.some((f) => f.includes('private-only field `notes`')));
});

test('repo names present while export_private_repo_names is false fails', () => {
  const projection = baseProjection({ export_private_repo_names: false });
  const root = fixture(projection);
  const r = check(root);
  assert.ok(r.findings.some((f) => f.includes('export_private_repo_names is false')));
});

test('repo names absent when the flag is false is fine, and the type stays optional', () => {
  const projection = baseProjection({ export_private_repo_names: false });
  delete projection.products[0].repo;
  const root = fixture(projection);
  const r = check(root);
  assert.deepEqual(r.findings, []);
  assert.ok(!readFileSync(join(root, GENERATED_PATH), 'utf8').includes('githubOrg'));
});

test('a credential-shaped string fails', () => {
  const projection = baseProjection();
  projection.products[0].display_name = 'Alpha _authToken=abc123def456';
  const root = fixture(projection);
  const r = check(root);
  assert.ok(r.findings.some((f) => f.includes('credential-shaped')));
});

test('no vendored projection is UNDETERMINED, not a pass', () => {
  const root = mkdtempSync(join(tmpdir(), 'projection-empty-'));
  const r = checkProjection(root, {});
  assert.ok(r.undetermined);
  assert.equal(r.findings, undefined);
});
