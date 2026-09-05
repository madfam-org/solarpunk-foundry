/**
 * GENERATED FILE - DO NOT EDIT BY HAND.
 *
 * Rendered from packages/core/src/products/projection.public.json by
 * scripts/check-product-projection.mjs. That JSON is the public-safe projection
 * of the private product registry; edit the registry, re-run the private
 * generator, re-vendor the projection, then run this script with --write.
 *
 * A hand edit here is reverted by the next run and fails Package Quality.
 *
 * The hand-kept half of the module - the `Product` type, the licence and layer
 * vocabularies and every lookup - lives next door in `products.ts`.
 */
/** The projection stamp, carried so a consumer can tell which registry version it holds. */
declare const PRODUCT_PROJECTION: {
    readonly schema: "madfam-product-projection/v1";
    readonly generatedFrom: "internal-devops/ecosystem/registry/products.yaml";
    readonly registryVersion: 4;
    readonly lastUpdated: "2026-09-05";
    readonly exportPrivateRepoNames: true;
    /** sha256 of the vendored projection.public.json this module was rendered from. */
    readonly sourceSha256: "b9a1a315eedcb1c3c3cf13fc7c8c17a0fa12048f51750488885192594091cb6e";
};

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
/**
 * The licence vocabulary. Every member is documented in
 * `docs/LICENSING_STRATEGY.md`, and `scripts/check-product-projection.mjs`
 * asserts that - the enum and the strategy cannot drift apart silently, which is
 * how this map came to be missing `Apache-2.0` while a product shipped under it.
 */
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
    readonly UNLICENSED: {
        readonly name: "Proprietary (no licence granted)";
        readonly openSource: false;
        readonly purpose: "The SPDX form docs/LICENSING_STRATEGY.md prescribes for a proprietary manifest; a product carrying it grants no licence at all";
    };
};
type LicenseType = keyof typeof licenseTypes;
/**
 * Lifecycle, from the registry. This one vocabulary replaces the four that used
 * to disagree (`status`, `isPublic`-as-liveness, "archived", "active").
 *
 * `retired` never appears on a renderable product: retired brands live in
 * `retiredProducts` as tombstones so a consumer can recognise a dead brand and
 * redirect, rather than failing to recognise it and rendering it.
 */
declare const lifecycles: {
    readonly incubating: {
        readonly name: "Incubating";
        readonly renderable: true;
        readonly live: false;
    };
    readonly beta: {
        readonly name: "Beta";
        readonly renderable: true;
        readonly live: true;
    };
    readonly live: {
        readonly name: "Live";
        readonly renderable: true;
        readonly live: true;
    };
    readonly degraded: {
        readonly name: "Degraded";
        readonly renderable: true;
        readonly live: false;
    };
    readonly retired: {
        readonly name: "Retired";
        readonly renderable: false;
        readonly live: false;
    };
};
type Lifecycle = keyof typeof lifecycles;
/**
 * Legacy two-value status vocabulary, kept so existing consumers of
 * `productStatuses` keep compiling. `lifecycles` is the registry's vocabulary
 * and the one to use.
 *
 * @deprecated use {@link lifecycles}
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
/** @deprecated use {@link Lifecycle} */
type ProductStatus = keyof typeof productStatuses;
type GithubOrg = "madfam-org" | "legal-ops";
type RepoVisibility = "public" | "private" | "archived";
type SiteCategory = "Infrastructure" | "Intelligence" | "Standards" | "Applications";
type SiteTrack = "self-serve" | "platform" | "ecosystem";
/** How a product presents on a public surface. */
interface ProductSurface {
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
interface ProductCommerce {
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
interface Product {
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
interface RetiredProduct {
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
/**
 * Complete product registry, generated from the vendored projection.
 * Source of truth: `internal-devops/ecosystem/registry/products.yaml`.
 */
declare const products: {
    readonly enclii: {
        readonly id: "enclii";
        readonly name: "Enclii";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "AGPL-3.0";
        readonly layer: "soil";
        readonly repo: "enclii";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "public";
        readonly isPublic: true;
        readonly domain: "enclii.dev";
        readonly hosts: readonly ["app.enclii.dev", "api.enclii.dev", "admin.enclii.dev", "status.enclii.dev", "docs.enclii.dev"];
        readonly infraHosts: readonly ["npm.madfam.io", "status.madfam.io", "grafana.enclii.dev", "prometheus.enclii.dev", "alertmanager.enclii.dev"];
        readonly site: {
            readonly category: "Infrastructure";
            readonly track: "platform";
            readonly order: 1;
            readonly icon: "☁️";
            readonly bannerKeyword: "DEPLOYMENT";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["community", "pro", "madfam"];
            readonly adminTier: "admin";
        };
    };
    readonly janua: {
        readonly id: "janua";
        readonly name: "Janua";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "AGPL-3.0";
        readonly layer: "soil";
        readonly repo: "janua";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "public";
        readonly isPublic: true;
        readonly domain: "janua.dev";
        readonly hosts: readonly ["docs.janua.dev"];
        readonly infraHosts: readonly ["auth.madfam.io"];
        readonly site: {
            readonly category: "Infrastructure";
            readonly track: "platform";
            readonly order: 2;
            readonly icon: "🔐";
            readonly bannerKeyword: "AUTHENTICATION";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["community", "pro", "enterprise"];
            readonly adminTier: "admin";
        };
    };
    readonly selva: {
        readonly id: "selva";
        readonly name: "Selva";
        readonly aliases: readonly ["Selva Office"];
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "AGPL-3.0";
        readonly layer: "fruit";
        readonly repo: "selva-office";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "public";
        readonly isPublic: true;
        readonly domain: "selva.town";
        readonly hosts: readonly ["www.selva.town", "app.selva.town", "api.selva.town", "admin.selva.town", "ws.selva.town", "gw.selva.town"];
        readonly infraHosts: readonly ["inference.selva.town"];
        readonly site: {
            readonly category: "Infrastructure";
            readonly track: "platform";
            readonly order: 3;
            readonly icon: "🌳";
            readonly bannerKeyword: "AI AGENT OFFICE";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["maker", "studio", "enterprise"];
            readonly adminTier: "admin";
            readonly checkoutSlug: "selva";
        };
    };
    readonly forgesight: {
        readonly id: "forgesight";
        readonly name: "Forgesight";
        readonly aliases: readonly ["Forge Sight", "ForgeSight"];
        readonly siteSlug: "forge-sight";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "AGPL-3.0";
        readonly dataLicense: "DATA_LICENSE";
        readonly layer: "roots";
        readonly repo: "forgesight";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "private";
        readonly isPublic: false;
        readonly domain: "forgesight.quest";
        readonly hosts: readonly ["app.forgesight.quest", "api.forgesight.quest", "admin.forgesight.quest"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Intelligence";
            readonly track: "self-serve";
            readonly order: 4;
            readonly icon: "🏭";
            readonly bannerKeyword: "INDUSTRY INTELLIGENCE";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["essentials", "pro", "madfam"];
            readonly adminTier: "admin";
            readonly checkoutSlug: "forgesight";
        };
    };
    readonly dhanam: {
        readonly id: "dhanam";
        readonly name: "Dhanam";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "AGPL-3.0";
        readonly layer: "fruit";
        readonly repo: "dhanam";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "private";
        readonly openCoreRepo: "dhanam-core";
        readonly isPublic: false;
        readonly domain: "dhan.am";
        readonly hosts: readonly ["app.dhan.am", "api.dhan.am", "admin.dhan.am"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Intelligence";
            readonly track: "self-serve";
            readonly order: 5;
            readonly icon: "💰";
            readonly bannerKeyword: "BUDGETING & WEALTH";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["community", "essentials", "pro", "madfam"];
            readonly adminTier: "admin";
            readonly checkoutSlug: "dhanam";
        };
    };
    readonly fortuna: {
        readonly id: "fortuna";
        readonly name: "Fortuna";
        readonly lifecycle: "degraded";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "Proprietary";
        readonly layer: "roots";
        readonly repo: "fortuna";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "private";
        readonly isPublic: false;
        readonly domain: "fortuna.tube";
        readonly hosts: readonly ["api.fortuna.tube"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Intelligence";
            readonly track: "self-serve";
            readonly order: 6;
            readonly icon: "🔮";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["free", "pro", "madfam"];
            readonly adminTier: "admin";
        };
    };
    readonly rondelio: {
        readonly id: "rondelio";
        readonly name: "Rondelio";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-07-09";
        readonly license: "Proprietary";
        readonly layer: "fruit";
        readonly repo: "rondelio";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "private";
        readonly isPublic: false;
        readonly domain: "rondel.io";
        readonly hosts: readonly ["www.rondel.io", "api.rondel.io", "play.rondel.io", "studio.rondel.io", "admin.rondel.io", "sim.rondel.io"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Intelligence";
            readonly track: "self-serve";
            readonly order: 7;
            readonly icon: "🎲";
            readonly bannerKeyword: "GAMES";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["free", "pro", "madfam"];
            readonly adminTier: "admin";
        };
    };
    readonly karafiel: {
        readonly id: "karafiel";
        readonly name: "Karafiel";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "AGPL-3.0";
        readonly layer: "stem";
        readonly repo: "karafiel";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "private";
        readonly isPublic: false;
        readonly domain: "karafiel.mx";
        readonly hosts: readonly ["app.karafiel.mx", "api.karafiel.mx", "admin.karafiel.mx"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Standards";
            readonly track: "self-serve";
            readonly order: 8;
            readonly icon: "📜";
            readonly bannerKeyword: "COMPLIANCE & CFDI";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["free", "contador", "despacho", "firma"];
            readonly adminTier: "admin";
            readonly checkoutSlug: "karafiel";
        };
    };
    readonly tezca: {
        readonly id: "tezca";
        readonly name: "Tezca";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "AGPL-3.0";
        readonly layer: "stem";
        readonly repo: "tezca";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "public";
        readonly isPublic: true;
        readonly domain: "tezca.mx";
        readonly hosts: readonly ["api.tezca.mx", "admin.tezca.mx"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Standards";
            readonly track: "self-serve";
            readonly order: 9;
            readonly icon: "⚖️";
            readonly bannerKeyword: "LEGAL OPS";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["community", "essentials", "institutional"];
            readonly adminTier: "admin";
            readonly checkoutSlug: "tezca";
        };
    };
    readonly avala: {
        readonly id: "avala";
        readonly name: "Avala";
        readonly acronym: "Alineamiento y Verificación de Aprendizajes y Logros Acreditables";
        readonly aliases: readonly ["AVALA"];
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "AGPL-3.0";
        readonly layer: "stem";
        readonly repo: "avala";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "private";
        readonly isPublic: false;
        readonly domain: "avala.studio";
        readonly hosts: readonly ["app.avala.studio", "admin.avala.studio", "api.avala.studio"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Standards";
            readonly track: "ecosystem";
            readonly order: 10;
            readonly icon: "🎓";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["institution", "issuer", "enterprise"];
            readonly adminTier: "admin";
        };
    };
    readonly yantra4d: {
        readonly id: "yantra4d";
        readonly name: "Yantra4D";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "AGPL-3.0";
        readonly layer: "fruit";
        readonly repo: "yantra4d";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "public";
        readonly isPublic: true;
        readonly domain: "yantra4d.com";
        readonly hosts: readonly ["app.yantra4d.com", "api.yantra4d.com", "admin.yantra4d.com"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Applications";
            readonly track: "ecosystem";
            readonly order: 11;
            readonly icon: "📐";
            readonly bannerKeyword: "PHYGITAL FABRICATION";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["guest", "essentials", "pro", "madfam"];
            readonly adminTier: "admin";
            readonly checkoutSlug: "yantra4d";
        };
    };
    readonly cotiza: {
        readonly id: "cotiza";
        readonly name: "Cotiza";
        readonly aliases: readonly ["Cotiza Studio"];
        readonly siteSlug: "cotiza-studio";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "Proprietary";
        readonly layer: "fruit";
        readonly repo: "digifab-quoting";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "public";
        readonly isPublic: true;
        readonly domain: "cotiza.studio";
        readonly hosts: readonly ["api.cotiza.studio"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Applications";
            readonly track: "ecosystem";
            readonly order: 12;
            readonly icon: "📊";
            readonly bannerKeyword: "QUOTING ENGINE";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["maker", "creator-pro", "business", "enterprise"];
            readonly adminTier: "admin";
            readonly checkoutSlug: "cotiza";
        };
    };
    readonly "pravara-mes": {
        readonly id: "pravara-mes";
        readonly name: "Pravara MES";
        readonly aliases: readonly ["Pravara-MES"];
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "AGPL-3.0";
        readonly layer: "fruit";
        readonly repo: "pravara-mes";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "public";
        readonly isPublic: true;
        readonly domain: "mes.madfam.io";
        readonly hosts: readonly ["mes-api.madfam.io"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Applications";
            readonly track: "ecosystem";
            readonly order: 13;
            readonly icon: "⚙️";
            readonly bannerKeyword: "MANUFACTURING";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["free", "pro", "madfam"];
            readonly adminTier: "admin";
        };
    };
    readonly voxa: {
        readonly id: "voxa";
        readonly name: "Voxa";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "Apache-2.0";
        readonly layer: "fruit";
        readonly repo: "voxa";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "public";
        readonly isPublic: true;
        readonly domain: "voxa.madfam.io";
        readonly hosts: readonly [];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Applications";
            readonly track: "self-serve";
            readonly order: 14;
            readonly icon: "🗣️";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["free", "family", "clinic"];
            readonly adminTier: "admin";
            readonly checkoutSlug: "voxa";
        };
    };
    readonly "phynd-crm": {
        readonly id: "phynd-crm";
        readonly name: "PhyndCRM";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "AGPL-3.0";
        readonly layer: "fruit";
        readonly repo: "phynd-crm";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "public";
        readonly isPublic: true;
        readonly domain: "phynd.app";
        readonly hosts: readonly ["crm.madfam.io"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Applications";
            readonly track: "self-serve";
            readonly order: 15;
            readonly icon: "🤝";
            readonly bannerKeyword: "CLIENT PORTAL & CRM";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["free", "pro", "madfam"];
            readonly adminTier: "admin";
        };
    };
    readonly ceq: {
        readonly id: "ceq";
        readonly name: "CEQ";
        readonly lifecycle: "degraded";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "AGPL-3.0";
        readonly layer: "fruit";
        readonly repo: "ceq";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "public";
        readonly isPublic: true;
        readonly domain: "ceq.lol";
        readonly hosts: readonly ["app.ceq.lol", "api.ceq.lol", "ws.ceq.lol"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Applications";
            readonly track: "self-serve";
            readonly order: 16;
            readonly icon: "🎨";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["free", "pro", "madfam"];
            readonly adminTier: "admin";
        };
    };
    readonly acervo: {
        readonly id: "acervo";
        readonly name: "Acervo";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "UNLICENSED";
        readonly layer: "fruit";
        readonly repo: "acervo";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "private";
        readonly isPublic: false;
        readonly domain: "acervo.madfam.io";
        readonly hosts: readonly [];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Applications";
            readonly track: "self-serve";
            readonly order: 17;
            readonly icon: "📚";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly [];
            readonly adminTier: "admin";
        };
    };
    readonly kalya: {
        readonly id: "kalya";
        readonly name: "kalya";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "UNLICENSED";
        readonly layer: "fruit";
        readonly repo: "kalya";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "private";
        readonly isPublic: false;
        readonly domain: "kalya.app";
        readonly hosts: readonly ["www.kalya.app", "kalya.madfam.io"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Applications";
            readonly track: "self-serve";
            readonly order: 18;
            readonly icon: "📅";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["free", "solo", "team", "biz"];
            readonly adminTier: "admin";
            readonly checkoutSlug: "kalya";
            readonly tierLabels: {
                readonly free: "Gratis";
                readonly solo: "Solo";
                readonly team: "Equipo";
                readonly biz: "Negocio";
            };
        };
    };
    readonly symbiosis: {
        readonly id: "symbiosis";
        readonly name: "Symbiosis HCM";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-09-05";
        readonly license: "AGPL-3.0";
        readonly layer: "fruit";
        readonly repo: "symbiosis-hcm";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "private";
        readonly isPublic: false;
        readonly domain: "hcm.madfam.io";
        readonly hosts: readonly ["hcm-app.madfam.io", "hcm-admin.madfam.io", "hcm-api.madfam.io"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Applications";
            readonly track: "self-serve";
            readonly order: 19;
            readonly icon: "🧬";
            readonly showInBanner: false;
        };
        readonly commerce: {
            readonly tiers: readonly ["free", "team", "biz"];
            readonly adminTier: "admin";
            readonly checkoutSlug: "symbiosis";
            readonly tierLabels: {
                readonly free: "Gratis";
                readonly team: "Equipo";
                readonly biz: "Negocio";
            };
        };
    };
    readonly "crea-map": {
        readonly id: "crea-map";
        readonly name: "MAP — Modelo de Acompañamiento Personalizado";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "UNLICENSED";
        readonly layer: "fruit";
        readonly repo: "crea-map";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "private";
        readonly isPublic: false;
        readonly domain: "crea-map.madfam.io";
        readonly hosts: readonly [];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Applications";
            readonly track: "ecosystem";
            readonly order: 20;
            readonly icon: "🗺️";
            readonly showInBanner: false;
        };
        readonly commerce: {
            readonly tiers: readonly ["membership"];
            readonly adminTier: "admin";
            readonly checkoutSlug: "crea-map";
            readonly tierLabels: {
                readonly membership: "Acceso de equipo";
            };
        };
    };
    readonly nauta: {
        readonly id: "nauta";
        readonly name: "Nauta";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "UNLICENSED";
        readonly layer: "fruit";
        readonly repo: "nauta";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "private";
        readonly isPublic: false;
        readonly domain: "cto.madfam.io";
        readonly hosts: readonly ["crea.madfam.io"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Applications";
            readonly track: "platform";
            readonly order: 21;
            readonly icon: "🧭";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["erp", "vcto"];
            readonly adminTier: "admin";
            readonly tierLabels: {
                readonly erp: "ERP";
                readonly vcto: "vCTO";
            };
        };
    };
    readonly meridian: {
        readonly id: "meridian";
        readonly name: "Meridian";
        readonly lifecycle: "degraded";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "AGPL-3.0";
        readonly layer: "stem";
        readonly repo: "meridian";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "public";
        readonly isPublic: true;
        readonly domain: "meridian.madfam.io";
        readonly hosts: readonly ["meridian-app.madfam.io", "meridian-api.madfam.io", "meridian-admin.madfam.io"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Standards";
            readonly track: "ecosystem";
            readonly order: 22;
            readonly icon: "🛂";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly [];
            readonly adminTier: "admin";
        };
    };
    readonly "fashion-cabinet": {
        readonly id: "fashion-cabinet";
        readonly name: "Fashion Cabinet";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "AGPL-3.0";
        readonly layer: "stem";
        readonly repo: "fashion-cabinet";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "private";
        readonly isPublic: false;
        readonly domain: "fashioncabi.net";
        readonly hosts: readonly ["www.fashioncabi.net", "fc.madfam.io"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Applications";
            readonly track: "ecosystem";
            readonly order: 23;
            readonly icon: "👗";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly [];
            readonly adminTier: "admin";
        };
    };
    readonly factlas: {
        readonly id: "factlas";
        readonly name: "Factlas";
        readonly lifecycle: "live";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "Proprietary";
        readonly layer: "roots";
        readonly repo: "factlas";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "private";
        readonly isPublic: false;
        readonly domain: "factl.as";
        readonly hosts: readonly ["api.factl.as"];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Intelligence";
            readonly track: "ecosystem";
            readonly order: 24;
            readonly icon: "🌎";
            readonly showInBanner: true;
        };
        readonly commerce: {
            readonly tiers: readonly ["pilot", "analyst", "institutional"];
            readonly adminTier: "admin";
        };
    };
    readonly periplo: {
        readonly id: "periplo";
        readonly name: "Periplo";
        readonly lifecycle: "incubating";
        readonly lifecycleVerified: "2026-08-24";
        readonly license: "UNLICENSED";
        readonly layer: "fruit";
        readonly repo: "periplo";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "private";
        readonly isPublic: false;
        readonly hosts: readonly [];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Applications";
            readonly track: "self-serve";
            readonly order: 25;
            readonly icon: "📍";
            readonly showInBanner: false;
        };
        readonly commerce: {
            readonly tiers: readonly ["free", "essentials", "pro"];
            readonly adminTier: "admin";
        };
    };
    readonly "geom-core": {
        readonly id: "geom-core";
        readonly name: "geom-core";
        readonly lifecycle: "incubating";
        readonly lifecycleVerified: "2026-09-04";
        readonly license: "Apache-2.0";
        readonly layer: "stem";
        readonly repo: "geom-core";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "public";
        readonly isPublic: true;
        readonly hosts: readonly [];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Standards";
            readonly track: "ecosystem";
            readonly order: 26;
            readonly icon: "🧮";
            readonly showInBanner: false;
        };
        readonly commerce: {
            readonly tiers: readonly [];
            readonly adminTier: "admin";
        };
    };
    readonly fragua: {
        readonly id: "fragua";
        readonly name: "Fragua";
        readonly lifecycle: "incubating";
        readonly lifecycleVerified: "2026-09-04";
        readonly license: "AGPL-3.0";
        readonly layer: "soil";
        readonly repo: "enclii";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "public";
        readonly isPublic: true;
        readonly hosts: readonly [];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Infrastructure";
            readonly track: "platform";
            readonly order: 27;
            readonly icon: "⚒️";
            readonly showInBanner: false;
        };
        readonly commerce: {
            readonly tiers: readonly ["arranque", "equipo", "escala", "dedicada"];
            readonly adminTier: "admin";
            readonly tierLabels: {
                readonly arranque: "Arranque";
                readonly equipo: "Equipo";
                readonly escala: "Escala";
                readonly dedicada: "Dedicada";
            };
        };
    };
    readonly enclii_depot: {
        readonly id: "enclii_depot";
        readonly name: "Enclii Depot";
        readonly lifecycle: "incubating";
        readonly lifecycleVerified: "2026-09-04";
        readonly license: "AGPL-3.0";
        readonly layer: "soil";
        readonly repo: "enclii";
        readonly githubOrg: "madfam-org";
        readonly repoVisibility: "public";
        readonly isPublic: true;
        readonly hosts: readonly [];
        readonly infraHosts: readonly [];
        readonly site: {
            readonly category: "Infrastructure";
            readonly track: "platform";
            readonly order: 28;
            readonly icon: "🗄️";
            readonly showInBanner: false;
        };
        readonly commerce: {
            readonly tiers: readonly ["community", "pro", "premium", "madfam"];
            readonly adminTier: "admin";
            readonly tierLabels: {
                readonly community: "Comunidad";
                readonly pro: "Estándar";
                readonly premium: "Alta disponibilidad";
                readonly madfam: "Dedicado";
            };
        };
    };
};
/**
 * Tombstones for retired brands. `products` never contains one - that is the
 * property that keeps a dead brand from reappearing in a catalog.
 */
declare const retiredProducts: {
    readonly penny: {
        readonly id: "penny";
        readonly name: "PENNY";
        readonly lifecycle: "retired";
        readonly retiredOn: "2026-07-25";
        readonly successorSlug: "selva";
        readonly redirectTo: "https://selva.town";
    };
    readonly sim4d: {
        readonly id: "sim4d";
        readonly name: "Sim4D";
        readonly lifecycle: "retired";
        readonly retiredOn: "2026-08-30";
        readonly successorSlug: "yantra4d";
        readonly redirectTo: "https://yantra4d.com";
    };
    readonly spark: {
        readonly id: "spark";
        readonly name: "SPARK";
        readonly lifecycle: "retired";
        readonly retiredOn: "2026-04-08";
    };
};
/**
 * Product identifier type
 */
type ProductId = keyof typeof products;
/** Retired-brand identifier type. */
type RetiredProductId = keyof typeof retiredProducts;
/**
 * Array of all product IDs
 */
declare const productIds: ProductId[];
/**
 * Whether a product entry is a tombstone for a retired product.
 * Retired products must never be rendered as part of the catalog.
 */
declare function isRetired(product: Pick<Product, "lifecycle">): boolean;
/**
 * Every product that is still a product. Tombstones are excluded by
 * construction, so this is the whole registry; the filter stays as a guard for
 * consumers that build their own lists.
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
 * Get products by lifecycle stage.
 */
declare function getProductsByLifecycle(...stages: Lifecycle[]): Product[];
/**
 * Get products whose repository is publicly readable. Tombstones are excluded:
 * an archived public repo must not appear in any catalog.
 */
declare function getPublicProducts(): Product[];
/**
 * Products with a public product surface: a routed primary domain that is not
 * one of the product's own infrastructure endpoints.
 */
declare function getSurfaceProducts(): Product[];
/**
 * Check if a string is a valid product ID
 */
declare function isValidProductId(value: string): value is ProductId;
/**
 * Check if a string names a retired brand.
 */
declare function isRetiredProductId(value: string): value is RetiredProductId;
/**
 * Get product by ID with type safety
 */
declare function getProduct(id: ProductId): Product;
/**
 * Get a retired brand's tombstone by ID.
 */
declare function getRetiredProduct(id: RetiredProductId): RetiredProduct;
/**
 * Get GitHub URL for a product, or `null` when the projection carries no repo
 * name for it (see `Product.repo`).
 */
declare function getProductGitHubUrl(id: ProductId): string | null;
/**
 * Get product website URL, or `null` when the product has no routed host.
 * Libraries (geom-core) and roadmap-only entries have none, and a fabricated
 * hostname is worse than no link. A retired brand resolves to its redirect.
 */
declare function getProductWebsiteUrl(id: ProductId | RetiredProductId): string | null;
/** The registry version this build carries, for a consumer that wants to log it. */
declare const registryVersion: 4;

export { type EcosystemLayer, type GithubOrg, type LicenseType, type Lifecycle, PRODUCT_PROJECTION, type Product, type ProductCommerce, type ProductId, type ProductStatus, type ProductSurface, type RepoVisibility, type RetiredProduct, type RetiredProductId, type SiteCategory, type SiteTrack, ecosystemLayers, getActiveProducts, getProduct, getProductGitHubUrl, getProductWebsiteUrl, getProductsByLayer, getProductsByLicense, getProductsByLifecycle, getPublicProducts, getRetiredProduct, getSurfaceProducts, isRetired, isRetiredProductId, isValidProductId, licenseTypes, lifecycles, productIds, productStatuses, products, registryVersion, retiredProducts };
