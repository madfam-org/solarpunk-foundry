/**
 * @solarpunk/core - Product Registry
 *
 * Authoritative registry of all products in the Solarpunk ecosystem.
 * This is derived directly from the governance manifesto (README.md Section IV).
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
    readonly 'AGPL-3.0': {
        readonly name: "GNU Affero General Public License v3.0";
        readonly openSource: true;
        readonly purpose: "Prevents cloud capture, ensures source availability";
    };
    readonly 'MPL-2.0': {
        readonly name: "Mozilla Public License 2.0";
        readonly openSource: true;
        readonly purpose: "File-level copyleft, allows proprietary integration";
    };
    readonly Proprietary: {
        readonly name: "Proprietary";
        readonly openSource: false;
        readonly purpose: "Commercial protection for competitive advantage";
    };
};
type LicenseType = keyof typeof licenseTypes;
interface Product {
    /** Product identifier (used in code) */
    id: string;
    /** Display name */
    name: string;
    /** Brief description */
    description: string;
    /** Ecosystem layer */
    layer: EcosystemLayer;
    /** Primary domain */
    domain: string;
    /** GitHub repository name */
    repo: string;
    /** GitHub organization */
    githubOrg: 'madfam-io' | 'aureo-labs';
    /** License type */
    license: LicenseType;
    /** Default port for local development */
    defaultPort?: number;
    /** Whether this product is publicly available */
    isPublic: boolean;
    /** Roadmap phase (1-5) */
    phase: 1 | 2 | 3 | 4 | 5;
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
        readonly githubOrg: "madfam-io";
        readonly license: "AGPL-3.0";
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
        readonly githubOrg: "madfam-io";
        readonly license: "AGPL-3.0";
        readonly defaultPort: 8001;
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
        readonly githubOrg: "aureo-labs";
        readonly license: "Proprietary";
        readonly isPublic: false;
        readonly phase: 2;
    };
    readonly forgesight: {
        readonly id: "forgesight";
        readonly name: "ForgeSight";
        readonly description: "The Pricer. Real-time manufacturing cost data.";
        readonly layer: "roots";
        readonly domain: "forgesight.quest";
        readonly repo: "forgesight";
        readonly githubOrg: "aureo-labs";
        readonly license: "Proprietary";
        readonly defaultPort: 8100;
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
        readonly githubOrg: "aureo-labs";
        readonly license: "Proprietary";
        readonly isPublic: false;
        readonly phase: 2;
    };
    readonly bloomScroll: {
        readonly id: "bloomScroll";
        readonly name: "BloomScroll";
        readonly description: "The Filter. Slow Web content aggregator.";
        readonly layer: "roots";
        readonly domain: "bloomscroll.app";
        readonly repo: "bloom-scroll";
        readonly githubOrg: "madfam-io";
        readonly license: "MPL-2.0";
        readonly isPublic: true;
        readonly phase: 2;
    };
    readonly geomCore: {
        readonly id: "geomCore";
        readonly name: "geom-core";
        readonly description: "The Physics Standard. C++ geometry analysis library.";
        readonly layer: "stem";
        readonly domain: "geom-core.dev";
        readonly repo: "geom-core";
        readonly githubOrg: "madfam-io";
        readonly license: "MPL-2.0";
        readonly isPublic: true;
        readonly phase: 3;
    };
    readonly avala: {
        readonly id: "avala";
        readonly name: "AVALA";
        readonly description: "The Human Standard. Applied learning verification.";
        readonly layer: "stem";
        readonly domain: "avala.mx";
        readonly repo: "avala";
        readonly githubOrg: "madfam-io";
        readonly license: "AGPL-3.0";
        readonly isPublic: true;
        readonly phase: 3;
    };
    readonly sim4d: {
        readonly id: "sim4d";
        readonly name: "Sim4D";
        readonly description: "The Creator. Web-based CAD guided by geom-core.";
        readonly layer: "fruit";
        readonly domain: "sim4d.io";
        readonly repo: "sim4d";
        readonly githubOrg: "madfam-io";
        readonly license: "MPL-2.0";
        readonly defaultPort: 5173;
        readonly isPublic: true;
        readonly phase: 3;
    };
    readonly forj: {
        readonly id: "forj";
        readonly name: "Forj";
        readonly description: "The Bazaar. Decentralized fabrication storefronts.";
        readonly layer: "fruit";
        readonly domain: "forj.design";
        readonly repo: "forj";
        readonly githubOrg: "aureo-labs";
        readonly license: "Proprietary";
        readonly isPublic: false;
        readonly phase: 4;
    };
    readonly cotiza: {
        readonly id: "cotiza";
        readonly name: "Cotiza Studio";
        readonly description: "The Merchant. Automated quoting engine.";
        readonly layer: "fruit";
        readonly domain: "cotiza.studio";
        readonly repo: "digifab-quoting";
        readonly githubOrg: "aureo-labs";
        readonly license: "Proprietary";
        readonly defaultPort: 8200;
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
        readonly githubOrg: "madfam-io";
        readonly license: "AGPL-3.0";
        readonly defaultPort: 8500;
        readonly isPublic: true;
        readonly phase: 1;
    };
    readonly coforma: {
        readonly id: "coforma";
        readonly name: "Coforma Studio";
        readonly description: "The Ear. Customer Advisory Board and feedback.";
        readonly layer: "fruit";
        readonly domain: "coforma.studio";
        readonly repo: "coforma-studio";
        readonly githubOrg: "aureo-labs";
        readonly license: "Proprietary";
        readonly isPublic: false;
        readonly phase: 1;
    };
    readonly galvana: {
        readonly id: "galvana";
        readonly name: "Galvana";
        readonly description: "The Reactor. Electrochemistry simulation platform.";
        readonly layer: "fruit";
        readonly domain: "galvana.io";
        readonly repo: "electrochem-sim";
        readonly githubOrg: "madfam-io";
        readonly license: "MPL-2.0";
        readonly isPublic: true;
        readonly phase: 5;
    };
    readonly primavera3d: {
        readonly id: "primavera3d";
        readonly name: "Primavera3D";
        readonly description: "Internal 3D printing operations (dogfooding target).";
        readonly layer: "fruit";
        readonly domain: "primavera3d.com";
        readonly repo: "primavera3d";
        readonly githubOrg: "madfam-io";
        readonly license: "Proprietary";
        readonly isPublic: false;
        readonly phase: 4;
    };
};
/**
 * Product identifier type
 */
type ProductId = keyof typeof products;
/**
 * Array of all product IDs
 */
declare const productIds: ("enclii" | "janua" | "fortuna" | "forgesight" | "blueprintTube" | "bloomScroll" | "geomCore" | "avala" | "sim4d" | "forj" | "cotiza" | "dhanam" | "coforma" | "galvana" | "primavera3d")[];
/**
 * Get products by ecosystem layer
 */
declare function getProductsByLayer(layer: EcosystemLayer): Product[];
/**
 * Get products by license type
 */
declare function getProductsByLicense(license: LicenseType): Product[];
/**
 * Get public/open-source products
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
 * Get product website URL
 */
declare function getProductWebsiteUrl(id: ProductId): string;

export { type EcosystemLayer, type LicenseType, type Product, type ProductId, ecosystemLayers, getProduct, getProductGitHubUrl, getProductWebsiteUrl, getProductsByLayer, getProductsByLicense, getProductsByPhase, getPublicProducts, isValidProductId, licenseTypes, productIds, products };
