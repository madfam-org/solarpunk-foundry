#!/usr/bin/env node
// Boundary checkpoint (2026-09-04, platform ops): public repo automation.
// Public-safe abstractions only; the vendored projection is the public-safe
// projection of a private registry and this guard asserts it stayed that way.
// Policy: docs/PUBLIC_REPO_BOUNDARY.md

/**
 * The product registry in `@madfam/core` is GENERATED. This is the guard.
 *
 * WHY THIS EXISTS (2026-09-05): `packages/core/src/products.ts` was a
 * hand-maintained list, and it disagreed with the private ecosystem registry in
 * one direction — it claimed products were more public, more current and more
 * permissively licensed than the record said. Six such lists existed across
 * three repos. The fix is a shape change, not a sweep: one private registry
 * emits one public-safe projection, this repo vendors that projection verbatim,
 * and every product fact here is generated from it with a check that fails.
 *
 * WHAT IT CHECKS (each with a read-proof, never a bare "ok"):
 *   hash       the vendored JSON still hashes to the committed `.sha256`, so a
 *              hand edit of the vendored copy is a red check.
 *   stamp      the JSON carries its `schema`/`generated_from`/`registry_version`
 *              stamp and the generated module records the same one.
 *   freshness  re-rendering the generated modules from the JSON reproduces the
 *              committed files byte for byte. Two are generated: the product
 *              registry in `@madfam/core` and the ecosystem banner's platform
 *              list, which is a filter over the same projection.
 *   retired    no `lifecycle: retired` product and no tombstone slug reaches the
 *              renderable product map. Tombstones exist so a consumer can
 *              recognise a dead brand and redirect; they must never render.
 *   banner     every product the banner filter selects carries the fields a
 *              ticker entry needs. A selected product with no
 *              `site.banner_keyword` is a FINDING, not a silently dropped row:
 *              that field was missing for seven products on 2026-09-05 and the
 *              only safe answers are "add it to the registry" or "fail" - never
 *              "invent a keyword in a public repo".
 *   licences   every licence in the projection is a member of the enum, and
 *              every enum member is documented in docs/LICENSING_STRATEGY.md.
 *   boundary   the projection carries nothing the repo-boundary contract keeps
 *              private: no IP literals, no hostname that the projection does not
 *              itself declare as a product/infra host, no private-only field, no
 *              credential shape. Private repo *names* are allowed while the
 *              registry's `export_private_repo_names` flag is true (ruling R15);
 *              when it is false, no `repo` block may be present at all.
 *
 * WHAT IT CANNOT CHECK, said out loud: this repo cannot see the private
 * registry, so it cannot prove the vendored projection matches today's registry.
 * It proves the vendored copy was not edited in place and that everything
 * generated from it is in step. Re-vendoring is a reviewable diff of
 * `projection.public.json` + `.sha256` together; that diff is the review surface.
 *
 * Usage:
 *   node scripts/check-product-projection.mjs           # check, writes nothing
 *   node scripts/check-product-projection.mjs --write   # regenerate after re-vendoring
 *
 * Exit codes:
 *   0  vendored projection intact, generated files fresh, assertions hold
 *   1  findings
 *   2  UNDETERMINED - the vendored projection could not be read, so nothing was
 *      checked (decisions/2026-07-26-fail-closed-seam-doctrine.md)
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROJECTION_PATH = 'packages/core/src/products/projection.public.json';
export const SHA_PATH = 'packages/core/src/products/projection.public.json.sha256';
export const GENERATED_PATH = 'packages/core/src/products.generated.ts';
export const BANNER_GENERATED_PATH = 'packages/ecosystem-banner/src/platforms.generated.ts';
export const LICENSING_DOC = 'docs/LICENSING_STRATEGY.md';

/**
 * The licence enum, mirroring the private registry's schema. Every member must
 * be documented in docs/LICENSING_STRATEGY.md - that assertion is what keeps
 * this list and the strategy from drifting apart the way the old hand-kept
 * `licenseTypes` map did (it had no Apache-2.0 while a product shipped under it).
 */
export const LICENSE_ENUM = [
  'AGPL-3.0',
  'Apache-2.0',
  'MIT',
  'MPL-2.0',
  'CERN-OHL-W-2.0',
  'Proprietary',
  'UNLICENSED',
];

/** Field names that never leave the private registry. */
const PRIVATE_FIELDS = [
  'notes',
  'registry_notes',
  'hub',
  'dhanam_plan_prefix',
  'client_facing',
  'client_surface_url',
  'functional_name',
  'functional_route',
  'functional_hint',
  'short_description_es',
  'default_port',
  'namespace',
  'service',
];

/** Credential shapes. The repo-wide scanner is scripts/public-hygiene-check.sh; this is the local one. */
const CREDENTIAL_SHAPES = [/_auth(Token)?\s*=/i, /\bBearer\s+[A-Za-z0-9._-]{8,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/];

/** Tokens that look like hostnames but are file names or paths. */
const FILE_EXTENSIONS = new Set([
  'yaml', 'yml', 'json', 'py', 'ts', 'tsx', 'js', 'mjs', 'cjs', 'md', 'sh',
  'txt', 'lock', 'toml', 'cfg', 'ini', 'png', 'svg', 'jpg', 'css', 'html',
]);

const HOSTLIKE = /\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z][a-z0-9-]{1,}\b/gi;
const IPV4 = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;

// ── rendering ────────────────────────────────────────────────────────────────

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function key(name) {
  return IDENT.test(name) ? name : JSON.stringify(name);
}

function str(value) {
  return JSON.stringify(value);
}

function list(values, indent) {
  if (values.length === 0) return '[]';
  const pad = ' '.repeat(indent);
  return `[\n${values.map((v) => `${pad}  ${str(v)},`).join('\n')}\n${pad}]`;
}

function record(entries, indent) {
  if (entries.length === 0) return '{}';
  const pad = ' '.repeat(indent);
  const body = entries.map(([k, v]) => `${pad}  ${key(k)}: ${str(v)},`).join('\n');
  return `{\n${body}\n${pad}}`;
}

function field(name, value, indent) {
  return `${' '.repeat(indent)}${key(name)}: ${value},`;
}

function renderProduct(product, indent) {
  const pad = ' '.repeat(indent);
  const lines = [];
  const push = (name, value) => lines.push(field(name, value, indent + 2));

  push('id', str(product.slug));
  push('name', str(product.display_name));
  if (product.acronym) push('acronym', str(product.acronym));
  if (product.aliases?.length) push('aliases', list(product.aliases, indent + 2));
  if (product.site_slug) push('siteSlug', str(product.site_slug));
  push('lifecycle', str(product.lifecycle));
  push('lifecycleVerified', str(product.lifecycle_verified));
  push('license', str(product.license));
  if (product.data_license) push('dataLicense', str(product.data_license));
  push('layer', str(product.layer));

  // `repo` is gated, not private: present while the registry's
  // export_private_repo_names flag is true (ruling R15). When it flips, these
  // three fields simply stop being emitted - which is why they are optional on
  // the `Product` type rather than required.
  if (product.repo) {
    push('repo', str(product.repo.name));
    push('githubOrg', str(product.repo.github_org));
    push('repoVisibility', str(product.repo.visibility));
    if (product.repo.open_core_repo) push('openCoreRepo', str(product.repo.open_core_repo));
    push('isPublic', String(product.repo.visibility === 'public'));
  }

  const domains = product.domains ?? {};
  if (domains.primary) push('domain', str(domains.primary));
  push('hosts', list(domains.hosts ?? [], indent + 2));
  push('infraHosts', list(domains.infra_hosts ?? [], indent + 2));

  const site = product.site ?? {};
  const siteLines = [];
  if (site.category) siteLines.push(field('category', str(site.category), indent + 4));
  if (site.track) siteLines.push(field('track', str(site.track), indent + 4));
  if (typeof site.order === 'number') siteLines.push(field('order', String(site.order), indent + 4));
  if (site.icon) siteLines.push(field('icon', str(site.icon), indent + 4));
  if (site.banner_keyword) siteLines.push(field('bannerKeyword', str(site.banner_keyword), indent + 4));
  siteLines.push(field('showInBanner', String(site.show_in_banner === true), indent + 4));
  push('site', `{\n${siteLines.join('\n')}\n${pad}  }`);

  const commerce = product.commerce ?? {};
  const commerceLines = [field('tiers', list(commerce.tiers ?? [], indent + 4), indent + 4)];
  if (commerce.admin_tier) commerceLines.push(field('adminTier', str(commerce.admin_tier), indent + 4));
  if (commerce.checkout_slug) commerceLines.push(field('checkoutSlug', str(commerce.checkout_slug), indent + 4));
  if (commerce.tier_labels) {
    commerceLines.push(field('tierLabels', record(Object.entries(commerce.tier_labels), indent + 4), indent + 4));
  }
  push('commerce', `{\n${commerceLines.join('\n')}\n${pad}  }`);

  return `${pad}${key(product.slug)}: {\n${lines.join('\n')}\n${pad}},`;
}

function renderTombstone(entry, indent) {
  const pad = ' '.repeat(indent);
  const lines = [
    field('id', str(entry.slug), indent + 2),
    field('name', str(entry.display_name), indent + 2),
    field('lifecycle', str('retired'), indent + 2),
    field('retiredOn', str(entry.retired_on), indent + 2),
  ];
  if (entry.successor_slug) lines.push(field('successorSlug', str(entry.successor_slug), indent + 2));
  if (entry.redirect_to) lines.push(field('redirectTo', str(entry.redirect_to), indent + 2));
  return `${pad}${key(entry.slug)}: {\n${lines.join('\n')}\n${pad}},`;
}

export function renderGeneratedModule(projection, sha256) {
  const products = projection.products.map((p) => renderProduct(p, 2)).join('\n');
  const retired = (projection.retired ?? []).map((r) => renderTombstone(r, 2)).join('\n');

  return `/**
 * GENERATED FILE - DO NOT EDIT BY HAND.
 *
 * Rendered from ${PROJECTION_PATH} by
 * scripts/check-product-projection.mjs. That JSON is the public-safe projection
 * of the private product registry; edit the registry, re-run the private
 * generator, re-vendor the projection, then run this script with --write.
 *
 * A hand edit here is reverted by the next run and fails Package Quality.
 *
 * The hand-kept half of the module - the \`Product\` type, the licence and layer
 * vocabularies and every lookup - lives next door in \`products.ts\`.
 */

/** The projection stamp, carried so a consumer can tell which registry version it holds. */
export const PRODUCT_PROJECTION = {
  schema: ${str(projection.schema)},
  generatedFrom: ${str(projection.generated_from)},
  registryVersion: ${String(projection.registry_version)},
  lastUpdated: ${str(projection.last_updated)},
  exportPrivateRepoNames: ${String(projection.export_private_repo_names === true)},
  /** sha256 of the vendored projection.public.json this module was rendered from. */
  sourceSha256: ${str(sha256)},
} as const;

/**
 * Every renderable product, keyed by registry slug, in registry order.
 * Retired products are NOT here by construction - see \`generatedRetiredProducts\`.
 */
export const generatedProducts = {
${products}
} as const;

/**
 * Tombstones. A retired brand is kept so a consumer can recognise it and
 * redirect, which is how it stops silently reappearing in a catalog.
 */
export const generatedRetiredProducts = {
${retired}
} as const;
`;
}

/**
 * The banner membership filter, exactly as dossier D §3 states it:
 * public product surface ∧ lifecycle live|beta ∧ not retired ∧
 * `site.show_in_banner` ∧ primary domain ∉ the product's own infra hosts.
 *
 * "Public surface" is the routed primary domain, NOT `repo.visibility`: Dhanam
 * and Forgesight are private repositories with live public products, and
 * filtering on the repo would have deleted them from the ticker.
 */
export function selectBannerPlatforms(projection) {
  const retired = new Set((projection.retired ?? []).map((r) => r.slug));
  return projection.products
    .filter((p) => {
      if (retired.has(p.slug)) return false;
      if (p.lifecycle !== 'live' && p.lifecycle !== 'beta') return false;
      if (p.site?.show_in_banner !== true) return false;
      const primary = p.domains?.primary;
      if (!primary) return false;
      return !(p.domains?.infra_hosts ?? []).includes(primary);
    })
    .sort((a, b) => (a.site?.order ?? 0) - (b.site?.order ?? 0));
}

export function renderBannerModule(projection, sha256) {
  const selected = selectBannerPlatforms(projection);
  const rows = selected
    .map(
      (p) =>
        `  { keyword: ${str(p.site.banner_keyword)}, name: ${str(p.display_name)}, ` +
        `url: ${str(`https://${p.domains.primary}`)} },`
    )
    .join('\n');

  return `/**
 * GENERATED FILE - DO NOT EDIT BY HAND.
 *
 * The ecosystem ticker's membership, rendered from the product projection
 * vendored at ${PROJECTION_PATH}
 * by scripts/check-product-projection.mjs. Add or remove a platform in the
 * private product registry, not here; a hand edit is reverted by the next run
 * and fails Package Quality.
 *
 * The filter: public product surface (a routed primary domain that is not one of
 * the product's own infra endpoints) AND lifecycle live or beta AND not retired
 * AND site.show_in_banner. Order is the registry's site.order.
 *
 * Registry version ${String(projection.registry_version)}, projection ${projection.last_updated},
 * projection sha256 ${sha256}.
 */
export const GENERATED_ECOSYSTEM_PLATFORMS = [
${rows}
] as const;
`;
}

// ── checking ─────────────────────────────────────────────────────────────────

function collectStrings(node, path, out) {
  if (typeof node === 'string') {
    out.push([path, node]);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectStrings(v, `${path}[${i}]`, out));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      out.push([`${path}.${k}`, k]);
      collectStrings(v, `${path}.${k}`, out);
    }
  }
}

function collectKeys(node, out) {
  if (Array.isArray(node)) {
    node.forEach((v) => collectKeys(v, out));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      out.add(k);
      collectKeys(v, out);
    }
  }
}

export function checkProjection(root, { write = false } = {}) {
  const findings = [];
  const projectionFile = join(root, PROJECTION_PATH);

  if (!existsSync(projectionFile)) {
    return { undetermined: `vendored projection not found at ${PROJECTION_PATH}` };
  }

  const raw = readFileSync(projectionFile);
  const sha256 = createHash('sha256').update(raw).digest('hex');

  let projection;
  try {
    projection = JSON.parse(raw.toString('utf8'));
  } catch (error) {
    return { undetermined: `vendored projection is not valid JSON: ${error.message}` };
  }
  if (!Array.isArray(projection.products)) {
    return { undetermined: 'vendored projection carries no `products` array' };
  }

  // ── hash ───────────────────────────────────────────────────────────────────
  const shaFile = join(root, SHA_PATH);
  const shaLine = `${sha256}  projection.public.json\n`;
  if (write) {
    writeFileSync(shaFile, shaLine);
  } else if (!existsSync(shaFile)) {
    findings.push(`no committed hash at ${SHA_PATH} - the vendored projection is unguarded`);
  } else {
    const committed = readFileSync(shaFile, 'utf8').trim().split(/\s+/)[0];
    if (committed !== sha256) {
      findings.push(
        `vendored projection does not match its committed hash: ${SHA_PATH} says ${committed}, ` +
          `the file hashes to ${sha256}. Do not hand-edit the vendored copy - re-vendor it from ` +
          'internal-devops/ecosystem/registry/projection.public.json and re-run with --write.'
      );
    }
  }

  // ── stamp ──────────────────────────────────────────────────────────────────
  for (const stampField of ['schema', 'generated_from', 'registry_version', 'last_updated']) {
    if (projection[stampField] === undefined) {
      findings.push(`vendored projection carries no \`${stampField}\` stamp`);
    }
  }
  if (projection.generated_from && !String(projection.generated_from).includes('products.yaml')) {
    findings.push(`unexpected \`generated_from\` stamp: ${projection.generated_from}`);
  }

  // ── freshness ──────────────────────────────────────────────────────────────
  const rendered = renderGeneratedModule(projection, sha256);
  const generatedFile = join(root, GENERATED_PATH);
  if (write) {
    writeFileSync(generatedFile, rendered);
  } else if (!existsSync(generatedFile)) {
    findings.push(`${GENERATED_PATH} is missing - run this script with --write`);
  } else if (readFileSync(generatedFile, 'utf8') !== rendered) {
    findings.push(
      `${GENERATED_PATH} is stale or hand-edited: re-rendering it from the vendored projection ` +
        'produces different bytes. Run `node scripts/check-product-projection.mjs --write`.'
    );
  }

  // ── banner ─────────────────────────────────────────────────────────────────
  // The ticker's membership is the same projection under a filter, so it gets
  // the same freshness treatment. The keyword assertion runs FIRST and is fatal:
  // a selected product with no keyword must stop the render, not be dropped from
  // the list quietly - a silently shorter ticker is indistinguishable from a
  // correct one.
  const bannerSelection = selectBannerPlatforms(projection);
  for (const product of bannerSelection) {
    if (!product.site?.banner_keyword) {
      findings.push(
        `\`${product.slug}\` is selected for the ecosystem banner but carries no ` +
          '`site.banner_keyword`. Add it in the private registry and re-vendor - do not ' +
          'invent a keyword here.'
      );
    }
  }

  const bannerFile = join(root, BANNER_GENERATED_PATH);
  const bannerRendered = renderBannerModule(projection, sha256);
  const bannerRenderable = bannerSelection.every((p) => Boolean(p.site?.banner_keyword));
  if (write) {
    if (bannerRenderable) writeFileSync(bannerFile, bannerRendered);
  } else if (!existsSync(bannerFile)) {
    findings.push(`${BANNER_GENERATED_PATH} is missing - run this script with --write`);
  } else if (bannerRenderable && readFileSync(bannerFile, 'utf8') !== bannerRendered) {
    findings.push(
      `${BANNER_GENERATED_PATH} is stale or hand-edited: re-rendering it from the vendored ` +
        'projection produces different bytes. Run `node scripts/check-product-projection.mjs --write`.'
    );
  }

  // ── retired ────────────────────────────────────────────────────────────────
  const tombstones = new Set((projection.retired ?? []).map((r) => r.slug));
  let retiredRendered = 0;
  for (const product of projection.products) {
    if (product.lifecycle === 'retired') {
      retiredRendered += 1;
      findings.push(`\`${product.slug}\` is lifecycle: retired and would render as a product`);
    }
    if (tombstones.has(product.slug)) {
      retiredRendered += 1;
      findings.push(`\`${product.slug}\` is both a renderable product and a tombstone`);
    }
  }
  if (!write && existsSync(bannerFile)) {
    const bannerOnDisk = readFileSync(bannerFile, 'utf8');
    for (const entry of projection.retired ?? []) {
      if (bannerOnDisk.includes(`name: ${JSON.stringify(entry.display_name)}`)) {
        retiredRendered += 1;
        findings.push(`retired brand \`${entry.display_name}\` appears in the ecosystem banner list`);
      }
    }
  }
  if (!write && existsSync(generatedFile)) {
    const onDisk = readFileSync(generatedFile, 'utf8');
    const productsBlock = onDisk.split('export const generatedProducts')[1]?.split('export const generatedRetiredProducts')[0] ?? '';
    for (const slug of tombstones) {
      if (new RegExp(`\\bid: ${JSON.stringify(slug)}`).test(productsBlock)) {
        retiredRendered += 1;
        findings.push(`tombstone \`${slug}\` appears in the renderable product map`);
      }
    }
  }

  // ── licences ───────────────────────────────────────────────────────────────
  const licensingDoc = existsSync(join(root, LICENSING_DOC))
    ? readFileSync(join(root, LICENSING_DOC), 'utf8')
    : null;
  if (licensingDoc === null) {
    findings.push(`${LICENSING_DOC} not found - the licence enum cannot be checked against it`);
  } else {
    for (const licence of LICENSE_ENUM) {
      if (!licensingDoc.includes(licence)) {
        findings.push(`licence \`${licence}\` is in the enum but is not documented in ${LICENSING_DOC}`);
      }
    }
  }
  for (const product of projection.products) {
    if (!LICENSE_ENUM.includes(product.license)) {
      findings.push(`\`${product.slug}\` carries licence \`${product.license}\`, which is not in the enum`);
    }
  }

  // ── boundary ───────────────────────────────────────────────────────────────
  const declaredHosts = new Set();
  for (const product of projection.products) {
    const d = product.domains ?? {};
    if (d.primary) declaredHosts.add(d.primary.toLowerCase());
    for (const h of [...(d.hosts ?? []), ...(d.infra_hosts ?? [])]) declaredHosts.add(h.toLowerCase());
  }
  for (const entry of projection.retired ?? []) {
    if (entry.redirect_to) {
      try {
        declaredHosts.add(new URL(entry.redirect_to).hostname.toLowerCase());
      } catch {
        findings.push(`tombstone \`${entry.slug}\` carries an unparseable redirect_to`);
      }
    }
  }

  const strings = [];
  collectStrings(projection, '$', strings);
  let hostsChecked = 0;
  const flaggedHosts = new Set();
  for (const [path, value] of strings) {
    for (const match of value.match(HOSTLIKE) ?? []) {
      const host = match.toLowerCase();
      const tld = host.slice(host.lastIndexOf('.') + 1);
      if (FILE_EXTENSIONS.has(tld)) continue;
      hostsChecked += 1;
      if (!declaredHosts.has(host) && !flaggedHosts.has(host)) {
        flaggedHosts.add(host);
        findings.push(`undeclared hostname \`${host}\` at ${path} - only declared product/infra hosts may appear`);
      }
    }
    for (const ip of value.match(IPV4) ?? []) {
      findings.push(`IP literal \`${ip}\` at ${path} - the boundary contract keeps infrastructure addresses private`);
    }
    for (const shape of CREDENTIAL_SHAPES) {
      if (shape.test(value)) findings.push(`credential-shaped string at ${path}`);
    }
  }

  const keys = new Set();
  collectKeys(projection, keys);
  for (const privateField of PRIVATE_FIELDS) {
    if (keys.has(privateField)) {
      findings.push(`private-only field \`${privateField}\` is present in the public projection`);
    }
  }

  if (typeof projection.export_private_repo_names !== 'boolean') {
    findings.push('`export_private_repo_names` is missing or not a boolean');
  } else if (projection.export_private_repo_names === false) {
    for (const product of projection.products) {
      if (product.repo) {
        findings.push(`\`${product.slug}\` carries a \`repo\` block while export_private_repo_names is false`);
      }
    }
  }

  return {
    findings,
    productsScanned: projection.products.length,
    tombstones: tombstones.size,
    bannerPlatforms: bannerSelection.length,
    retiredRendered,
    hostsChecked,
    declaredHosts: declaredHosts.size,
    licencesChecked: LICENSE_ENUM.length,
    keysScanned: keys.size,
    sha256,
    wrote: write,
  };
}

export function main(argv = []) {
  const here = dirname(fileURLToPath(import.meta.url));
  const write = argv.includes('--write');
  const positional = argv.filter((a) => !a.startsWith('--'));
  const root = resolve(positional[0] ?? join(here, '..'));

  const result = checkProjection(root, { write });

  if (result.undetermined) {
    console.error(`[product-projection] UNDETERMINED - ${result.undetermined}`);
    console.log('Product projection check UNDETERMINED - products_scanned=0 hosts_checked=0');
    return 2;
  }

  for (const finding of result.findings) console.error(`[product-projection] ${finding}`);

  // READ-PROOF. "I read nothing" and "I read everything and found nothing wrong"
  // must not print the same line (AGENTS.md, monetization-engine seam rule).
  console.log(
    `Product projection check${result.wrote ? ' (--write)' : ''}: ` +
      `products_scanned=${result.productsScanned} tombstones=${result.tombstones} ` +
      `banner_platforms=${result.bannerPlatforms} ` +
      `retired_rendered=${result.retiredRendered} hosts_checked=${result.hostsChecked} ` +
      `declared_hosts=${result.declaredHosts} licences_checked=${result.licencesChecked} ` +
      `keys_scanned=${result.keysScanned} findings=${result.findings.length} ` +
      `sha256=${result.sha256.slice(0, 12)}`
  );
  return result.findings.length === 0 ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main(process.argv.slice(2)));
}
