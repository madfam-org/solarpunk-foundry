'use strict';

// src/products.ts
var ecosystemLayers = {
  soil: {
    name: "The Soil",
    description: "The bedrock. Infrastructure layer.",
    order: 1
  },
  roots: {
    name: "The Roots",
    description: "Sensing & Input. Data harvesting layer.",
    order: 2
  },
  stem: {
    name: "The Stem",
    description: "Core Standards & Verification. Structural logic layer.",
    order: 3
  },
  fruit: {
    name: "The Fruit",
    description: "User Platforms. Value creation layer.",
    order: 4
  }
};
var licenseTypes = {
  "AGPL-3.0": {
    name: "GNU Affero General Public License v3.0",
    openSource: true,
    purpose: "Prevents cloud capture, ensures source availability"
  },
  "MPL-2.0": {
    name: "Mozilla Public License 2.0",
    openSource: true,
    purpose: "File-level copyleft, allows proprietary integration"
  },
  "Apache-2.0": {
    name: "Apache License 2.0",
    openSource: true,
    purpose: "Permissive with an explicit patent grant; libraries meant to be embedded"
  },
  MIT: {
    name: "MIT License",
    openSource: true,
    purpose: "Maximally permissive; shared packages and developer tooling"
  },
  "CERN-OHL-W-2.0": {
    name: "CERN Open Hardware Licence Version 2 - Weakly Reciprocal",
    openSource: true,
    purpose: "Open hardware designs; reciprocal for the design itself"
  },
  Proprietary: {
    name: "Proprietary",
    openSource: false,
    purpose: "Commercial protection for competitive advantage"
  }
};
var productStatuses = {
  active: { name: "Active", renderable: true },
  retired: { name: "Retired", renderable: false }
};
var products = {
  // ─────────────────────────────────────────────────────────────────────────────
  // Layer 1: The Soil (Infrastructure)
  // ─────────────────────────────────────────────────────────────────────────────
  enclii: {
    id: "enclii",
    name: "Enclii",
    description: "Sovereign PaaS. Bare-metal hosting.",
    layer: "soil",
    domain: "enclii.dev",
    repo: "enclii",
    githubOrg: "madfam-org",
    license: "AGPL-3.0",
    defaultPort: 4200,
    isPublic: true,
    phase: 1
  },
  janua: {
    id: "janua",
    name: "Janua",
    description: "The Gatekeeper. Identity, SSO, and Revenue Management.",
    layer: "soil",
    domain: "janua.dev",
    repo: "janua",
    githubOrg: "madfam-org",
    license: "AGPL-3.0",
    defaultPort: 4100,
    isPublic: true,
    phase: 1
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // Layer 2: The Roots (Sensing & Input)
  // ─────────────────────────────────────────────────────────────────────────────
  fortuna: {
    id: "fortuna",
    name: "Fortuna",
    description: "The Problem Hunter. Market gap intelligence.",
    layer: "roots",
    domain: "fortuna.tube",
    repo: "fortuna",
    githubOrg: "madfam-org",
    license: "Proprietary",
    defaultPort: 4400,
    isPublic: false,
    phase: 2
  },
  forgesight: {
    id: "forgesight",
    name: "Forgesight",
    description: "The Pricer. Real-time manufacturing cost data.",
    layer: "roots",
    domain: "forgesight.quest",
    repo: "forgesight",
    githubOrg: "madfam-org",
    // The code is AGPL-3.0 (LICENSE file); the price corpus ships under a
    // separate DATA_LICENSE. The older "proprietary edge" note was wrong.
    license: "AGPL-3.0",
    dataLicense: "DATA_LICENSE",
    defaultPort: 4300,
    isPublic: false,
    phase: 2
  },
  blueprintTube: {
    id: "blueprintTube",
    name: "BlueprintTube",
    description: "The Librarian. 3D model indexing and rating.",
    layer: "roots",
    domain: "blueprint.tube",
    repo: "blueprint-harvester",
    githubOrg: "madfam-org",
    license: "Proprietary",
    isPublic: false,
    phase: 2
  },
  bloomScroll: {
    id: "bloomScroll",
    name: "BloomScroll",
    description: "The Filter. Slow Web content aggregator.",
    layer: "roots",
    domain: "almanac.solar",
    repo: "bloom-scroll",
    githubOrg: "madfam-org",
    license: "MPL-2.0",
    isPublic: true,
    phase: 2
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // Layer 3: The Stem (Core Standards & Verification)
  // ─────────────────────────────────────────────────────────────────────────────
  geomCore: {
    id: "geomCore",
    name: "geom-core",
    description: "The Physics Standard. C++ geometry analysis library (WASM + Python bindings). A library, not a deployed service: no domain.",
    layer: "stem",
    // No routed host. `geom-core.dev` was never registered.
    repo: "geom-core",
    githubOrg: "madfam-org",
    // Apache-2.0 per the repository LICENSE file, which wins over any badge.
    license: "Apache-2.0",
    isPublic: true,
    phase: 3
  },
  avala: {
    id: "avala",
    name: "Avala",
    acronym: "Alineamiento y Verificaci\xF3n de Aprendizajes y Logros Acreditables",
    description: "The Human Standard. Applied learning verification.",
    layer: "stem",
    domain: "avala.studio",
    repo: "avala",
    githubOrg: "madfam-org",
    license: "AGPL-3.0",
    // Repository flipped private 2026-07-16. The product surface is live.
    isPublic: false,
    phase: 3
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // Layer 4: The Fruit (User Platforms)
  // ─────────────────────────────────────────────────────────────────────────────
  // ARCHIVED: the sim4d repo was archived by 2026-08-07 and the platform is
  // retired (parametric design continues in yantra4d). Entry retained for type
  // stability — consumers must not render Sim4D as an active product.
  sim4d: {
    id: "sim4d",
    name: "Sim4D",
    description: "ARCHIVED (2026-08). Web-based CAD guided by geom-core; superseded by Yantra4D.",
    layer: "fruit",
    domain: "sim4d.io",
    repo: "sim4d",
    githubOrg: "madfam-org",
    license: "MPL-2.0",
    defaultPort: 5173,
    isPublic: true,
    phase: 3,
    status: "retired",
    successorSlug: "yantra4d"
  },
  forj: {
    id: "forj",
    name: "Forj",
    description: "The Bazaar. Decentralized fabrication storefronts.",
    layer: "fruit",
    domain: "forj.design",
    repo: "forj",
    githubOrg: "madfam-org",
    license: "Proprietary",
    isPublic: false,
    phase: 4
  },
  cotiza: {
    id: "cotiza",
    name: "Cotiza",
    description: "The Merchant. Automated quoting engine.",
    layer: "fruit",
    domain: "cotiza.studio",
    repo: "digifab-quoting",
    githubOrg: "madfam-org",
    license: "Proprietary",
    defaultPort: 4500,
    isPublic: false,
    phase: 4
  },
  dhanam: {
    id: "dhanam",
    name: "Dhanam",
    description: "The Treasury. Unified budgeting and wealth tracking.",
    layer: "fruit",
    domain: "dhan.am",
    repo: "dhanam",
    githubOrg: "madfam-org",
    license: "AGPL-3.0",
    defaultPort: 4700,
    // Repository flipped private by 2026-07-25. The product surface is live.
    isPublic: false,
    phase: 1
  },
  coforma: {
    id: "coforma",
    name: "Coforma Studio",
    description: "The Ear. Customer Advisory Board and feedback.",
    layer: "fruit",
    domain: "coforma.studio",
    repo: "coforma-studio",
    githubOrg: "madfam-org",
    license: "Proprietary",
    isPublic: false,
    phase: 1
  },
  galvana: {
    id: "galvana",
    name: "Galvana",
    description: "The Reactor. Electrochemistry simulation platform.",
    layer: "fruit",
    // No routed host. `galvana.io` was never registered; roadmap only.
    repo: "electrochem-sim",
    githubOrg: "madfam-org",
    license: "MPL-2.0",
    isPublic: true,
    phase: 5
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // Operations (not in biological layers but essential)
  // ─────────────────────────────────────────────────────────────────────────────
  primavera3d: {
    id: "primavera3d",
    name: "Primavera3D",
    description: "Internal 3D printing operations (dogfooding target).",
    layer: "fruit",
    domain: "primavera3d.pro",
    repo: "primavera3d",
    githubOrg: "madfam-org",
    license: "Proprietary",
    isPublic: false,
    phase: 4
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // Tombstones — retired products. Kept so a consumer can recognise a dead brand
  // and redirect. `status: "retired"` entries MUST NOT be rendered as products.
  // ─────────────────────────────────────────────────────────────────────────────
  penny: {
    id: "penny",
    name: "PENNY",
    description: "RETIRED. Assistant platform; everything PENNY did is absorbed by Selva. Repository archived; penny.onl 301-redirects to selva.town.",
    layer: "fruit",
    repo: "penny",
    githubOrg: "madfam-org",
    license: "Proprietary",
    isPublic: true,
    phase: 4,
    status: "retired",
    successorSlug: "selva",
    redirectTo: "https://selva.town"
  }
};
var productIds = Object.keys(products);
function isRetired(product) {
  return product.status === "retired";
}
function getActiveProducts() {
  return Object.values(products).filter((p) => !isRetired(p));
}
function getProductsByLayer(layer) {
  return getActiveProducts().filter((p) => p.layer === layer);
}
function getProductsByLicense(license) {
  return getActiveProducts().filter((p) => p.license === license);
}
function getPublicProducts() {
  return getActiveProducts().filter((p) => p.isPublic);
}
function getProductsByPhase(phase) {
  return getActiveProducts().filter((p) => p.phase === phase);
}
function isValidProductId(value) {
  return value in products;
}
function getProduct(id) {
  return products[id];
}
function getProductGitHubUrl(id) {
  const product = products[id];
  return `https://github.com/${product.githubOrg}/${product.repo}`;
}
function getProductWebsiteUrl(id) {
  const product = products[id];
  if (product.status === "retired" && product.redirectTo) {
    return product.redirectTo;
  }
  return product.domain ? `https://${product.domain}` : null;
}

exports.ecosystemLayers = ecosystemLayers;
exports.getActiveProducts = getActiveProducts;
exports.getProduct = getProduct;
exports.getProductGitHubUrl = getProductGitHubUrl;
exports.getProductWebsiteUrl = getProductWebsiteUrl;
exports.getProductsByLayer = getProductsByLayer;
exports.getProductsByLicense = getProductsByLicense;
exports.getProductsByPhase = getProductsByPhase;
exports.getPublicProducts = getPublicProducts;
exports.isRetired = isRetired;
exports.isValidProductId = isValidProductId;
exports.licenseTypes = licenseTypes;
exports.productIds = productIds;
exports.productStatuses = productStatuses;
exports.products = products;
//# sourceMappingURL=products.cjs.map
//# sourceMappingURL=products.cjs.map