/**
 * @madfam/core - Product Registry (hand-kept half)
 *
 * The product FACTS are no longer typed here. They are generated into
 * `products.generated.ts` from `products/projection.public.json`, the
 * public-safe projection of the one private product registry that owns them.
 * This module keeps only what a projection cannot carry: the vocabularies, the
 * public `Product` type, and the lookups.
 *
 * WHY (2026-09-05): this file used to be a hand-maintained list, and it
 * disagreed with the private record in one direction - it claimed products were
 * more public, more current and more permissively licensed than the record said.
 * Six such lists existed across three repos with no arbiter between them. One
 * registry now arbitrates, and `scripts/check-product-projection.mjs` fails
 * Package Quality when the vendored projection is edited by hand, when the
 * generated module drifts from it, when a retired product would render, when a
 * licence leaves the enum documented in `docs/LICENSING_STRATEGY.md`, or when
 * the projection carries anything the repo-boundary contract keeps private.
 *
 * To change a product fact: change the registry in `internal-devops`, re-run its
 * generator, re-vendor `projection.public.json` here, and run
 * `node scripts/check-product-projection.mjs --write`.
 */

import { PRODUCT_PROJECTION, generatedProducts, generatedRetiredProducts } from './products.generated';

export { PRODUCT_PROJECTION } from './products.generated';

// ═══════════════════════════════════════════════════════════════════════════════
// ECOSYSTEM LAYERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * The four biological layers of the Solarpunk Stack
 */
export const ecosystemLayers = {
  soil: {
    name: "The Soil",
    description: "The bedrock. Infrastructure layer.",
    order: 1,
  },
  roots: {
    name: "The Roots",
    description: "Sensing & Input. Data harvesting layer.",
    order: 2,
  },
  stem: {
    name: "The Stem",
    description: "Core Standards & Verification. Structural logic layer.",
    order: 3,
  },
  fruit: {
    name: "The Fruit",
    description: "User Platforms. Value creation layer.",
    order: 4,
  },
} as const;

export type EcosystemLayer = keyof typeof ecosystemLayers;

// ═══════════════════════════════════════════════════════════════════════════════
// LICENSE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * The licence vocabulary. Every member is documented in
 * `docs/LICENSING_STRATEGY.md`, and `scripts/check-product-projection.mjs`
 * asserts that - the enum and the strategy cannot drift apart silently, which is
 * how this map came to be missing `Apache-2.0` while a product shipped under it.
 */
export const licenseTypes = {
  "AGPL-3.0": {
    name: "GNU Affero General Public License v3.0",
    openSource: true,
    purpose: "Prevents cloud capture, ensures source availability",
  },
  "MPL-2.0": {
    name: "Mozilla Public License 2.0",
    openSource: true,
    purpose: "File-level copyleft, allows proprietary integration",
  },
  "Apache-2.0": {
    name: "Apache License 2.0",
    openSource: true,
    purpose: "Permissive with an explicit patent grant; libraries meant to be embedded",
  },
  MIT: {
    name: "MIT License",
    openSource: true,
    purpose: "Maximally permissive; shared packages and developer tooling",
  },
  "CERN-OHL-W-2.0": {
    name: "CERN Open Hardware Licence Version 2 - Weakly Reciprocal",
    openSource: true,
    purpose: "Open hardware designs; reciprocal for the design itself",
  },
  Proprietary: {
    name: "Proprietary",
    openSource: false,
    purpose: "Commercial protection for competitive advantage",
  },
  UNLICENSED: {
    name: "Proprietary (no licence granted)",
    openSource: false,
    purpose:
      "The SPDX form docs/LICENSING_STRATEGY.md prescribes for a proprietary manifest; a product carrying it grants no licence at all",
  },
} as const;

export type LicenseType = keyof typeof licenseTypes;

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lifecycle, from the registry. This one vocabulary replaces the four that used
 * to disagree (`status`, `isPublic`-as-liveness, "archived", "active").
 *
 * `retired` never appears on a renderable product: retired brands live in
 * `retiredProducts` as tombstones so a consumer can recognise a dead brand and
 * redirect, rather than failing to recognise it and rendering it.
 */
export const lifecycles = {
  incubating: { name: "Incubating", renderable: true, live: false },
  beta: { name: "Beta", renderable: true, live: true },
  live: { name: "Live", renderable: true, live: true },
  degraded: { name: "Degraded", renderable: true, live: false },
  retired: { name: "Retired", renderable: false, live: false },
} as const;

export type Lifecycle = keyof typeof lifecycles;

/**
 * Legacy two-value status vocabulary, kept so existing consumers of
 * `productStatuses` keep compiling. `lifecycles` is the registry's vocabulary
 * and the one to use.
 *
 * @deprecated use {@link lifecycles}
 */
export const productStatuses = {
  active: { name: "Active", renderable: true },
  retired: { name: "Retired", renderable: false },
} as const;

/** @deprecated use {@link Lifecycle} */
export type ProductStatus = keyof typeof productStatuses;

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT SHAPE
// ═══════════════════════════════════════════════════════════════════════════════

export type GithubOrg = "madfam-org" | "legal-ops";
export type RepoVisibility = "public" | "private" | "archived";
export type SiteCategory = "Infrastructure" | "Intelligence" | "Standards" | "Applications";
export type SiteTrack = "self-serve" | "platform" | "ecosystem";

/** How a product presents on a public surface. */
export interface ProductSurface {
  readonly category?: SiteCategory;
  readonly track?: SiteTrack;
  readonly order?: number;
  readonly icon?: string;
  /** Uppercase keyword the ecosystem ticker shows before the product name. */
  readonly bannerKeyword?: string;
  /** Whether this product belongs in the ecosystem banner at all. */
  readonly showInBanner: boolean;
}

/** The public half of a product's commercial shape. Billing wiring stays private. */
export interface ProductCommerce {
  readonly tiers: readonly string[];
  readonly adminTier?: string;
  readonly checkoutSlug?: string;
  readonly tierLabels?: Readonly<Record<string, string>>;
}

/**
 * A product, exactly as the public projection can describe one.
 *
 * Deliberately absent, and why:
 * - `description` - product copy is per-locale and lives in the registry's copy
 *   bundles, which are not projected. A hand-typed English sentence here is how
 *   three locales came to disagree with each other.
 * - `defaultPort` - local-topology detail; private per the repo-boundary contract.
 * - `phase` - a roadmap number no record ever owned.
 */
export interface Product {
  /** Registry slug. Also the key in {@link products}. */
  readonly id: string;
  /** Display name, as the brand record spells it. */
  readonly name: string;
  /** Expanded acronym, where the display name is one. */
  readonly acronym?: string;
  /** Superseded spellings, kept so a linter can recognise and reject them. */
  readonly aliases?: readonly string[];
  /** Slug the public site routes under, when it differs from `id`. */
  readonly siteSlug?: string;
  readonly lifecycle: Lifecycle;
  /** ISO date the lifecycle claim was last verified against a live probe. */
  readonly lifecycleVerified: string;
  readonly license: LicenseType;
  /**
   * Separate license governing distributed data, where the code license does
   * not cover it (e.g. Forgesight's price corpus).
   */
  readonly dataLicense?: string;
  readonly layer: EcosystemLayer;
  /**
   * GitHub repository name. Optional: the projection carries repo names only
   * while the registry's `export_private_repo_names` flag is set (ruling R15).
   * When that flag flips, these fields simply stop being emitted.
   */
  readonly repo?: string;
  readonly githubOrg?: GithubOrg;
  readonly repoVisibility?: RepoVisibility;
  /** Public open-core extraction of a private repository, where one exists. */
  readonly openCoreRepo?: string;
  /** Whether the repository is publicly readable. Derived from `repoVisibility`. */
  readonly isPublic?: boolean;
  /**
   * Primary routed domain. Optional: a product with no routed host omits it
   * rather than carrying an invented one.
   */
  readonly domain?: string;
  /** Additional routed product hosts. */
  readonly hosts: readonly string[];
  /**
   * Infrastructure endpoints. Never render one as a product link - that is how
   * Janua's ticker entry came to point at an auth endpoint instead of its
   * product domain.
   */
  readonly infraHosts: readonly string[];
  readonly site: ProductSurface;
  readonly commerce: ProductCommerce;
}

/** A retired brand. Kept so a consumer can recognise it and redirect. */
export interface RetiredProduct {
  readonly id: string;
  readonly name: string;
  readonly lifecycle: "retired";
  /** ISO date the product was retired. */
  readonly retiredOn: string;
  /** The product that absorbed it, where one did. */
  readonly successorSlug?: string;
  /** Where a visitor should be sent instead. */
  readonly redirectTo?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// THE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Complete product registry, generated from the vendored projection.
 * Source of truth: `internal-devops/ecosystem/registry/products.yaml`.
 */
export const products = generatedProducts satisfies Record<string, Product>;

/**
 * Tombstones for retired brands. `products` never contains one - that is the
 * property that keeps a dead brand from reappearing in a catalog.
 */
export const retiredProducts = generatedRetiredProducts satisfies Record<string, RetiredProduct>;

/**
 * Product identifier type
 */
export type ProductId = keyof typeof products;

/** Retired-brand identifier type. */
export type RetiredProductId = keyof typeof retiredProducts;

/**
 * Array of all product IDs
 */
export const productIds = Object.keys(products) as ProductId[];

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Whether a product entry is a tombstone for a retired product.
 * Retired products must never be rendered as part of the catalog.
 */
export function isRetired(product: Pick<Product, "lifecycle">): boolean {
  return product.lifecycle === "retired";
}

/**
 * Every product that is still a product. Tombstones are excluded by
 * construction, so this is the whole registry; the filter stays as a guard for
 * consumers that build their own lists.
 */
export function getActiveProducts(): Product[] {
  return Object.values(products).filter((p) => !isRetired(p));
}

/**
 * Get active products by ecosystem layer
 */
export function getProductsByLayer(layer: EcosystemLayer): Product[] {
  return getActiveProducts().filter((p) => p.layer === layer);
}

/**
 * Get products by license type
 */
export function getProductsByLicense(license: LicenseType): Product[] {
  return getActiveProducts().filter((p) => p.license === license);
}

/**
 * Get products by lifecycle stage.
 */
export function getProductsByLifecycle(...stages: Lifecycle[]): Product[] {
  return getActiveProducts().filter((p) => stages.includes(p.lifecycle));
}

/**
 * Get products whose repository is publicly readable. Tombstones are excluded:
 * an archived public repo must not appear in any catalog.
 */
export function getPublicProducts(): Product[] {
  return getActiveProducts().filter((p) => p.isPublic === true);
}

/**
 * Products with a public product surface: a routed primary domain that is not
 * one of the product's own infrastructure endpoints.
 */
export function getSurfaceProducts(): Product[] {
  return getActiveProducts().filter(
    (p) => typeof p.domain === "string" && !p.infraHosts.includes(p.domain)
  );
}

/**
 * Check if a string is a valid product ID
 */
export function isValidProductId(value: string): value is ProductId {
  return value in products;
}

/**
 * Check if a string names a retired brand.
 */
export function isRetiredProductId(value: string): value is RetiredProductId {
  return value in retiredProducts;
}

/**
 * Get product by ID with type safety
 */
export function getProduct(id: ProductId): Product {
  return products[id];
}

/**
 * Get a retired brand's tombstone by ID.
 */
export function getRetiredProduct(id: RetiredProductId): RetiredProduct {
  return retiredProducts[id];
}

/**
 * Get GitHub URL for a product, or `null` when the projection carries no repo
 * name for it (see `Product.repo`).
 */
export function getProductGitHubUrl(id: ProductId): string | null {
  const product: Product = products[id];
  if (!product.repo || !product.githubOrg) return null;
  return `https://github.com/${product.githubOrg}/${product.repo}`;
}

/**
 * Get product website URL, or `null` when the product has no routed host.
 * Libraries (geom-core) and roadmap-only entries have none, and a fabricated
 * hostname is worse than no link. A retired brand resolves to its redirect.
 */
export function getProductWebsiteUrl(id: ProductId | RetiredProductId): string | null {
  if (isRetiredProductId(id)) {
    const tombstone: RetiredProduct = retiredProducts[id];
    return tombstone.redirectTo ?? null;
  }
  const product: Product = products[id];
  return product.domain ? `https://${product.domain}` : null;
}

/** The registry version this build carries, for a consumer that wants to log it. */
export const registryVersion = PRODUCT_PROJECTION.registryVersion;
