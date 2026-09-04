/**
 * @madfam/core - Product Registry
 *
 * Hand-maintained registry of MADFAM ecosystem products, reconciled against the
 * private ecosystem registry (repo names, visibility, licenses) and the domain
 * map (routed hosts). Where this file and those records disagree, those records
 * win.
 *
 * Last verified: 2026-09-04.
 *
 * INTERIM: this file is maintained by hand today. It is scheduled to become a
 * generated projection of the single product registry, with a CI freshness
 * check, so that visibility, license and domain facts cannot drift again.
 *
 * Changes to this file require governance approval.
 */
/**
 * The four biological layers of the Solarpunk Stack
 */
declare const ecosystemLayers: {
    readonly soil: {
        readonly name: "The Soil";
        readonly description: "The bedrock. Infrastructure layer.";
        readonly order: 1;
    };
    readonly roots: {
        readonly name: "The Roots";
        readonly description: "Sensing & Input. Data harvesting layer.";
        readonly order: 2;
    };
    readonly stem: {
        readonly name: "The Stem";
        readonly description: "Core Standards & Verification. Structural logic layer.";
        readonly order: 3;
    };
    readonly fruit: {
        readonly name: "The Fruit";
        readonly description: "User Platforms. Value creation layer.";
        readonly order: 4;
    };
};
type EcosystemLayer = keyof typeof ecosystemLayers;
declare const licenseTypes: {
    readonly "AGPL-3.0": {
        readonly name: "GNU Affero General Public License v3.0";
        readonly openSource: true;
        readonly purpose: "Prevents cloud capture, ensures source availability";
    };
    readonly "MPL-2.0": {
        readonly name: "Mozilla Public License 2.0";
        readonly openSource: true;
        readonly purpose: "File-level copyleft, allows proprietary integration";
    };
    readonly "Apache-2.0": {
        readonly name: "Apache License 2.0";
        readonly openSource: true;
        readonly purpose: "Permissive with an explicit patent grant; libraries meant to be embedded";
    };
    readonly MIT: {
        readonly name: "MIT License";
        readonly openSource: true;
        readonly purpose: "Maximally permissive; shared packages and developer tooling";
    };
    readonly "CERN-OHL-W-2.0": {
        readonly name: "CERN Open Hardware Licence Version 2 - Weakly Reciprocal";
        readonly openSource: true;
        readonly purpose: "Open hardware designs; reciprocal for the design itself";
    };
    readonly Proprietary: {
        readonly name: "Proprietary";
        readonly openSource: false;
        readonly purpose: "Commercial protection for competitive advantage";
    };
};
type LicenseType = keyof typeof licenseTypes;
/**
 * Lifecycle status. Absent means `"active"`.
 *
 * `"retired"` entries are tombstones: they are kept so that a consumer can
 * recognise a dead brand and redirect, and MUST NOT be rendered as products.
 */
declare const productStatuses: {
    readonly active: {
        readonly name: "Active";
        readonly renderable: true;
    };
    readonly retired: {
        readonly name: "Retired";
        readonly renderable: false;
    };
};
type ProductStatus = keyof typeof productStatuses;
interface Product {
    /** Product identifier (used in code) */
    id: string;
    /** Display name */
    name: string;
    /** Expanded acronym, where the display name is one */
    acronym?: string;
    /** Brief description */
    description: string;
    /** Ecosystem layer */
    layer: EcosystemLayer;
    /**
     * Primary routed domain. Optional: a product with no routed host omits it
     * rather than carrying an invented one.
     */
    domain?: string;
    /** GitHub repository name */
    repo: string;
    /**
     * GitHub organization. `madfam-org` holds the ecosystem; the separate
     * `legal-ops` org holds `leyes-como-codigo-mx`.
     */
    githubOrg: "madfam-org" | "legal-ops";
    /** License type of the code */
    license: LicenseType;
    /**
     * Separate license governing distributed data, where the code license does
     * not cover it (e.g. Forgesight's price corpus).
     */
    dataLicense?: string;
    /** Default port for local development */
    defaultPort?: number;
    /** Whether the repository is publicly readable */
    isPublic: boolean;
    /** Roadmap phase (1-5) */
    phase: 1 | 2 | 3 | 4 | 5;
    /** Lifecycle status; absent means active */
    status?: ProductStatus;
    /** For a retired product: the id/slug of the product that absorbed it */
    successorSlug?: string;
    /** For a retired product: where a visitor should be sent instead */
    redirectTo?: string;
}
/**
 * Complete product registry
 * Source of truth: solarpunk-foundry/README.md Section IV
 */
declare const products: {
    readonly enclii: {
        readonly id: "enclii";
        readonly name: "Enclii";
        readonly description: "Sovereign PaaS. Bare-metal hosting.";
        readonly layer: "soil";
        readonly domain: "enclii.dev";
        readonly repo: "enclii";
        readonly githubOrg: "madfam-org";
        readonly license: "AGPL-3.0";
        readonly defaultPort: 4200;
        readonly isPublic: true;
        readonly phase: 1;
    };
    readonly janua: {
        readonly id: "janua";
        readonly name: "Janua";
        readonly description: "The Gatekeeper. Identity, SSO, and Revenue Management.";
        readonly layer: "soil";
        readonly domain: "janua.dev";
        readonly repo: "janua";
        readonly githubOrg: "madfam-org";
        readonly license: "AGPL-3.0";
        readonly defaultPort: 4100;
        readonly isPublic: true;
        readonly phase: 1;
    };
    readonly fortuna: {
        readonly id: "fortuna";
        readonly name: "Fortuna";
        readonly description: "The Problem Hunter. Market gap intelligence.";
        readonly layer: "roots";
        readonly domain: "fortuna.tube";
        readonly repo: "fortuna";
        readonly githubOrg: "madfam-org";
        readonly license: "Proprietary";
        readonly defaultPort: 4400;
        readonly isPublic: false;
        readonly phase: 2;
    };
    readonly forgesight: {
        readonly id: "forgesight";
        readonly name: "Forgesight";
        readonly description: "The Pricer. Real-time manufacturing cost data.";
        readonly layer: "roots";
        readonly domain: "forgesight.quest";
        readonly repo: "forgesight";
        readonly githubOrg: "madfam-org";
        readonly license: "AGPL-3.0";
        readonly dataLicense: "DATA_LICENSE";
        readonly defaultPort: 4300;
        readonly isPublic: false;
        readonly phase: 2;
    };
    readonly blueprintTube: {
        readonly id: "blueprintTube";
        readonly name: "BlueprintTube";
        readonly description: "The Librarian. 3D model indexing and rating.";
        readonly layer: "roots";
        readonly domain: "blueprint.tube";
        readonly repo: "blueprint-harvester";
        readonly githubOrg: "madfam-org";
        readonly license: "Proprietary";
        readonly isPublic: false;
        readonly phase: 2;
    };
    readonly bloomScroll: {
        readonly id: "bloomScroll";
        readonly name: "BloomScroll";
        readonly description: "The Filter. Slow Web content aggregator.";
        readonly layer: "roots";
        readonly domain: "almanac.solar";
        readonly repo: "bloom-scroll";
        readonly githubOrg: "madfam-org";
        readonly license: "MPL-2.0";
        readonly isPublic: true;
        readonly phase: 2;
    };
    readonly geomCore: {
        readonly id: "geomCore";
        readonly name: "geom-core";
        readonly description: "The Physics Standard. C++ geometry analysis library (WASM + Python bindings). A library, not a deployed service: no domain.";
        readonly layer: "stem";
        readonly repo: "geom-core";
        readonly githubOrg: "madfam-org";
        readonly license: "Apache-2.0";
        readonly isPublic: true;
        readonly phase: 3;
    };
    readonly avala: {
        readonly id: "avala";
        readonly name: "Avala";
        readonly acronym: "Alineamiento y Verificación de Aprendizajes y Logros Acreditables";
        readonly description: "The Human Standard. Applied learning verification.";
        readonly layer: "stem";
        readonly domain: "avala.studio";
        readonly repo: "avala";
        readonly githubOrg: "madfam-org";
        readonly license: "AGPL-3.0";
        readonly isPublic: false;
        readonly phase: 3;
    };
    readonly sim4d: {
        readonly id: "sim4d";
        readonly name: "Sim4D";
        readonly description: "ARCHIVED (2026-08). Web-based CAD guided by geom-core; superseded by Yantra4D.";
        readonly layer: "fruit";
        readonly domain: "sim4d.io";
        readonly repo: "sim4d";
        readonly githubOrg: "madfam-org";
        readonly license: "MPL-2.0";
        readonly defaultPort: 5173;
        readonly isPublic: true;
        readonly phase: 3;
        readonly status: "retired";
        readonly successorSlug: "yantra4d";
    };
    readonly forj: {
        readonly id: "forj";
        readonly name: "Forj";
        readonly description: "The Bazaar. Decentralized fabrication storefronts.";
        readonly layer: "fruit";
        readonly domain: "forj.design";
        readonly repo: "forj";
        readonly githubOrg: "madfam-org";
        readonly license: "Proprietary";
        readonly isPublic: false;
        readonly phase: 4;
    };
    readonly cotiza: {
        readonly id: "cotiza";
        readonly name: "Cotiza";
        readonly description: "The Merchant. Automated quoting engine.";
        readonly layer: "fruit";
        readonly domain: "cotiza.studio";
        readonly repo: "digifab-quoting";
        readonly githubOrg: "madfam-org";
        readonly license: "Proprietary";
        readonly defaultPort: 4500;
        readonly isPublic: false;
        readonly phase: 4;
    };
    readonly dhanam: {
        readonly id: "dhanam";
        readonly name: "Dhanam";
        readonly description: "The Treasury. Unified budgeting and wealth tracking.";
        readonly layer: "fruit";
        readonly domain: "dhan.am";
        readonly repo: "dhanam";
        readonly githubOrg: "madfam-org";
        readonly license: "AGPL-3.0";
        readonly defaultPort: 4700;
        readonly isPublic: false;
        readonly phase: 1;
    };
    readonly coforma: {
        readonly id: "coforma";
        readonly name: "Coforma Studio";
        readonly description: "The Ear. Customer Advisory Board and feedback.";
        readonly layer: "fruit";
        readonly domain: "coforma.studio";
        readonly repo: "coforma-studio";
        readonly githubOrg: "madfam-org";
        readonly license: "Proprietary";
        readonly isPublic: false;
        readonly phase: 1;
    };
    readonly galvana: {
        readonly id: "galvana";
        readonly name: "Galvana";
        readonly description: "The Reactor. Electrochemistry simulation platform.";
        readonly layer: "fruit";
        readonly repo: "electrochem-sim";
        readonly githubOrg: "madfam-org";
        readonly license: "MPL-2.0";
        readonly isPublic: true;
        readonly phase: 5;
    };
    readonly primavera3d: {
        readonly id: "primavera3d";
        readonly name: "Primavera3D";
        readonly description: "Internal 3D printing operations (dogfooding target).";
        readonly layer: "fruit";
        readonly domain: "primavera3d.pro";
        readonly repo: "primavera3d";
        readonly githubOrg: "madfam-org";
        readonly license: "Proprietary";
        readonly isPublic: false;
        readonly phase: 4;
    };
    readonly penny: {
        readonly id: "penny";
        readonly name: "PENNY";
        readonly description: "RETIRED. Assistant platform; everything PENNY did is absorbed by Selva. Repository archived; penny.onl 301-redirects to selva.town.";
        readonly layer: "fruit";
        readonly repo: "penny";
        readonly githubOrg: "madfam-org";
        readonly license: "Proprietary";
        readonly isPublic: true;
        readonly phase: 4;
        readonly status: "retired";
        readonly successorSlug: "selva";
        readonly redirectTo: "https://selva.town";
    };
};
/**
 * Product identifier type
 */
type ProductId = keyof typeof products;
/**
 * Array of all product IDs
 */
declare const productIds: ProductId[];
/**
 * Whether a product entry is a tombstone for a retired product.
 * Retired products must never be rendered as part of the catalog.
 */
declare function isRetired(product: Product): boolean;
/**
 * Every product that is still a product (tombstones excluded).
 */
declare function getActiveProducts(): Product[];
/**
 * Get active products by ecosystem layer
 */
declare function getProductsByLayer(layer: EcosystemLayer): Product[];
/**
 * Get products by license type
 */
declare function getProductsByLicense(license: LicenseType): Product[];
/**
 * Get products whose repository is publicly readable. Tombstones are excluded:
 * `penny` is a public archived repo but must not appear in any catalog.
 */
declare function getPublicProducts(): Product[];
/**
 * Get products by roadmap phase
 */
declare function getProductsByPhase(phase: 1 | 2 | 3 | 4 | 5): Product[];
/**
 * Check if a string is a valid product ID
 */
declare function isValidProductId(value: string): value is ProductId;
/**
 * Get product by ID with type safety
 */
declare function getProduct(id: ProductId): Product;
/**
 * Get GitHub URL for a product
 */
declare function getProductGitHubUrl(id: ProductId): string;
/**
 * Get product website URL, or `null` when the product has no routed host.
 * Libraries (geom-core) and roadmap-only entries (galvana) have none, and a
 * fabricated hostname is worse than no link.
 */
declare function getProductWebsiteUrl(id: ProductId): string | null;

export { type EcosystemLayer, type LicenseType, type Product, type ProductId, type ProductStatus, ecosystemLayers, getActiveProducts, getProduct, getProductGitHubUrl, getProductWebsiteUrl, getProductsByLayer, getProductsByLicense, getProductsByPhase, getPublicProducts, isRetired, isValidProductId, licenseTypes, productIds, productStatuses, products };
