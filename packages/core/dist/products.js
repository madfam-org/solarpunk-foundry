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
  "Proprietary": {
    name: "Proprietary",
    openSource: false,
    purpose: "Commercial protection for competitive advantage"
  }
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
    githubOrg: "madfam-io",
    license: "AGPL-3.0",
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
    githubOrg: "madfam-io",
    license: "AGPL-3.0",
    defaultPort: 8001,
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
    githubOrg: "aureo-labs",
    license: "Proprietary",
    isPublic: false,
    phase: 2
  },
  forgesight: {
    id: "forgesight",
    name: "ForgeSight",
    description: "The Pricer. Real-time manufacturing cost data.",
    layer: "roots",
    domain: "forgesight.quest",
    repo: "forgesight",
    githubOrg: "aureo-labs",
    license: "Proprietary",
    defaultPort: 8100,
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
    githubOrg: "aureo-labs",
    license: "Proprietary",
    isPublic: false,
    phase: 2
  },
  bloomScroll: {
    id: "bloomScroll",
    name: "BloomScroll",
    description: "The Filter. Slow Web content aggregator.",
    layer: "roots",
    domain: "bloomscroll.app",
    repo: "bloom-scroll",
    githubOrg: "madfam-io",
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
    description: "The Physics Standard. C++ geometry analysis library.",
    layer: "stem",
    domain: "geom-core.dev",
    repo: "geom-core",
    githubOrg: "madfam-io",
    license: "MPL-2.0",
    isPublic: true,
    phase: 3
  },
  avala: {
    id: "avala",
    name: "AVALA",
    description: "The Human Standard. Applied learning verification.",
    layer: "stem",
    domain: "avala.mx",
    repo: "avala",
    githubOrg: "madfam-io",
    license: "AGPL-3.0",
    isPublic: true,
    phase: 3
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // Layer 4: The Fruit (User Platforms)
  // ─────────────────────────────────────────────────────────────────────────────
  sim4d: {
    id: "sim4d",
    name: "Sim4D",
    description: "The Creator. Web-based CAD guided by geom-core.",
    layer: "fruit",
    domain: "sim4d.io",
    repo: "sim4d",
    githubOrg: "madfam-io",
    license: "MPL-2.0",
    defaultPort: 5173,
    isPublic: true,
    phase: 3
  },
  forj: {
    id: "forj",
    name: "Forj",
    description: "The Bazaar. Decentralized fabrication storefronts.",
    layer: "fruit",
    domain: "forj.design",
    repo: "forj",
    githubOrg: "aureo-labs",
    license: "Proprietary",
    isPublic: false,
    phase: 4
  },
  cotiza: {
    id: "cotiza",
    name: "Cotiza Studio",
    description: "The Merchant. Automated quoting engine.",
    layer: "fruit",
    domain: "cotiza.studio",
    repo: "digifab-quoting",
    githubOrg: "aureo-labs",
    license: "Proprietary",
    defaultPort: 8200,
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
    githubOrg: "madfam-io",
    license: "AGPL-3.0",
    defaultPort: 8500,
    isPublic: true,
    phase: 1
  },
  coforma: {
    id: "coforma",
    name: "Coforma Studio",
    description: "The Ear. Customer Advisory Board and feedback.",
    layer: "fruit",
    domain: "coforma.studio",
    repo: "coforma-studio",
    githubOrg: "aureo-labs",
    license: "Proprietary",
    isPublic: false,
    phase: 1
  },
  galvana: {
    id: "galvana",
    name: "Galvana",
    description: "The Reactor. Electrochemistry simulation platform.",
    layer: "fruit",
    domain: "galvana.io",
    repo: "electrochem-sim",
    githubOrg: "madfam-io",
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
    domain: "primavera3d.com",
    repo: "primavera3d",
    githubOrg: "madfam-io",
    license: "Proprietary",
    isPublic: false,
    phase: 4
  }
};
var productIds = Object.keys(products);
function getProductsByLayer(layer) {
  return Object.values(products).filter((p) => p.layer === layer);
}
function getProductsByLicense(license) {
  return Object.values(products).filter((p) => p.license === license);
}
function getPublicProducts() {
  return Object.values(products).filter((p) => p.isPublic);
}
function getProductsByPhase(phase) {
  return Object.values(products).filter((p) => p.phase === phase);
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
  return `https://${product.domain}`;
}

export { ecosystemLayers, getProduct, getProductGitHubUrl, getProductWebsiteUrl, getProductsByLayer, getProductsByLicense, getProductsByPhase, getPublicProducts, isValidProductId, licenseTypes, productIds, products };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=products.js.map