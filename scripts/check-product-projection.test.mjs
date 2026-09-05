// Boundary checkpoint (2026-09-04, platform ops): public repo automation test.
// All fixtures are synthetic - no real host, slug or hash from any record.
// Policy: docs/PUBLIC_REPO_BOUNDARY.md

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import {
  BANNER_GENERATED_PATH,
  BANNER_PLATFORMS_PATH,
  GENERATED_PATH,
  LICENSE_ENUM,
  LICENSING_DOC,
  PROJECTION_PATH,
  SHA_PATH,
  checkProjection,
  selectBannerPlatforms,
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
        site: {
          category: 'Infrastructure',
          track: 'platform',
          order: 1,
          icon: 'A',
          banner_keyword: 'ALPHA THINGS',
          show_in_banner: true,
        },
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
  mkdirSync(dirname(join(root, BANNER_PLATFORMS_PATH)), { recursive: true });
  mkdirSync(dirname(join(root, LICENSING_DOC)), { recursive: true });
  // The banner module as Wave 2.7 leaves it: a derivation, not a list.
  writeFileSync(
    join(root, BANNER_PLATFORMS_PATH),
    "import { getBannerProducts } from '@madfam/core/products';\n" +
      'export const DEFAULT_ECOSYSTEM_PLATFORMS = getBannerProducts();\n'
  );
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

// ── the ecosystem banner membership filter ───────────────────────────────────

/** A product the banner filter should accept, unless a clause says otherwise. */
function bannerProduct(slug, overrides = {}) {
  const site = { order: 2, banner_keyword: slug.toUpperCase(), show_in_banner: true, ...(overrides.site ?? {}) };
  return {
    slug,
    display_name: slug,
    lifecycle: 'live',
    lifecycle_verified: '2026-01-01',
    license: 'MIT',
    layer: 'fruit',
    domains: { primary: `${slug}.example`, hosts: [], infra_hosts: [], ...(overrides.domains ?? {}) },
    commerce: { tiers: [] },
    ...overrides,
    site,
  };
}

function selectedSlugs(products, retired = []) {
  const projection = baseProjection({ products, retired });
  return selectBannerPlatforms(projection).map((p) => p.slug);
}

test('the banner filter admits a live product with a public surface', () => {
  assert.deepEqual(selectedSlugs([bannerProduct('beta')]), ['beta']);
});

test('the banner filter rejects lifecycles other than live and beta', () => {
  const products = [
    bannerProduct('shipping', { lifecycle: 'beta' }),
    bannerProduct('sick', { lifecycle: 'degraded' }),
    bannerProduct('early', { lifecycle: 'incubating' }),
    bannerProduct('dead', { lifecycle: 'retired' }),
  ];
  assert.deepEqual(selectedSlugs(products), ['shipping']);
});

test('the banner filter rejects show_in_banner: false, and a product with no primary domain', () => {
  const products = [
    bannerProduct('hidden', { site: { show_in_banner: false } }),
    bannerProduct('library', { domains: { primary: null, hosts: [], infra_hosts: [] } }),
    bannerProduct('shown'),
  ];
  assert.deepEqual(selectedSlugs(products), ['shown']);
});

test('the banner filter rejects a primary domain that is one of the product own infra hosts', () => {
  const gate = bannerProduct('gate', {
    domains: { primary: 'auth.example', hosts: [], infra_hosts: ['auth.example'] },
  });
  assert.deepEqual(selectedSlugs([gate]), []);
});

test('the banner filter rejects a tombstoned slug even when the product row looks live', () => {
  const zombie = bannerProduct('omega');
  assert.deepEqual(selectedSlugs([zombie], [{ slug: 'omega', display_name: 'Omega', retired_on: '2026-01-01' }]), []);
});

test('the banner filter orders by the registry order, not by file order', () => {
  const products = [bannerProduct('third', { site: { order: 30 } }), bannerProduct('first', { site: { order: 10 } })];
  assert.deepEqual(selectedSlugs(products), ['first', 'third']);
});

test('a private repository with a live public surface stays in the banner', () => {
  // Dhanam and Forgesight are private repos with live products. Filtering on
  // repo visibility instead of the product surface would delete them.
  const closed = bannerProduct('closed', {
    repo: { name: 'closed', github_org: 'madfam-org', visibility: 'private' },
  });
  assert.deepEqual(selectedSlugs([closed]), ['closed']);
});

test('a selected product with no banner keyword is a finding', () => {
  const projection = baseProjection({ products: [bannerProduct('mute', { site: { banner_keyword: undefined } })] });
  const r = check(fixture(projection));
  assert.ok(r.findings.some((f) => f.includes('mute') && f.includes('site.banner_keyword')));
});

test('the retired second copy of the platform list is a finding if it comes back', () => {
  const root = fixture();
  writeFileSync(
    join(root, BANNER_GENERATED_PATH),
    'export const GENERATED_ECOSYSTEM_PLATFORMS = [] as const;\n'
  );
  const r = check(root);
  assert.ok(r.findings.some((f) => f.includes(BANNER_GENERATED_PATH) && f.includes('is back')));
});

test('a banner module that stops importing the core filter is a finding', () => {
  const root = fixture();
  writeFileSync(join(root, BANNER_PLATFORMS_PATH), 'export const DEFAULT_ECOSYSTEM_PLATFORMS = [];\n');
  const r = check(root);
  assert.ok(r.findings.some((f) => f.includes(BANNER_PLATFORMS_PATH) && f.includes('@madfam/core/products')));
});

test('a hand-typed ticker row in the banner module is a finding', () => {
  const root = fixture();
  const source = readFileSync(join(root, BANNER_PLATFORMS_PATH), 'utf8');
  writeFileSync(
    join(root, BANNER_PLATFORMS_PATH),
    `${source}const extra = [{ keyword: 'HAND TYPED', name: 'Alpha', url: 'https://alpha.example' }];\n`
  );
  const r = check(root);
  assert.ok(r.findings.some((f) => f.includes(BANNER_PLATFORMS_PATH) && f.includes('literal ticker')));
});

test('a retired brand hand-typed back into the banner module is a finding', () => {
  const root = fixture();
  const source = readFileSync(join(root, BANNER_PLATFORMS_PATH), 'utf8');
  writeFileSync(
    join(root, BANNER_PLATFORMS_PATH),
    `${source}const tombstone = { name: 'Omega', url: 'https://alpha.example' };\n`
  );
  const r = check(root);
  assert.ok(r.findings.some((f) => f.includes('retired brand `Omega` appears in the ecosystem banner')));
});

test('a passing run proves it looked at the banner selection and the banner module', () => {
  const r = check(fixture());
  assert.deepEqual(r.findings, []);
  assert.equal(r.bannerPlatforms, 1);
  assert.equal(r.bannerModuleChecked, true);
});
