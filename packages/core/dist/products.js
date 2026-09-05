// src/products.generated.ts
var PRODUCT_PROJECTION = {
  schema: "madfam-product-projection/v1",
  generatedFrom: "internal-devops/ecosystem/registry/products.yaml",
  registryVersion: 4,
  lastUpdated: "2026-09-05",
  exportPrivateRepoNames: true,
  /** sha256 of the vendored projection.public.json this module was rendered from. */
  sourceSha256: "b9a1a315eedcb1c3c3cf13fc7c8c17a0fa12048f51750488885192594091cb6e"
};
var generatedProducts = {
  enclii: {
    id: "enclii",
    name: "Enclii",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "soil",
    repo: "enclii",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "enclii.dev",
    hosts: [
      "app.enclii.dev",
      "api.enclii.dev",
      "admin.enclii.dev",
      "status.enclii.dev",
      "docs.enclii.dev"
    ],
    infraHosts: [
      "npm.madfam.io",
      "status.madfam.io",
      "grafana.enclii.dev",
      "prometheus.enclii.dev",
      "alertmanager.enclii.dev"
    ],
    site: {
      category: "Infrastructure",
      track: "platform",
      order: 1,
      icon: "\u2601\uFE0F",
      bannerKeyword: "DEPLOYMENT",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "community",
        "pro",
        "madfam"
      ],
      adminTier: "admin"
    }
  },
  janua: {
    id: "janua",
    name: "Janua",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "soil",
    repo: "janua",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "janua.dev",
    hosts: [
      "docs.janua.dev"
    ],
    infraHosts: [
      "auth.madfam.io"
    ],
    site: {
      category: "Infrastructure",
      track: "platform",
      order: 2,
      icon: "\u{1F510}",
      bannerKeyword: "AUTHENTICATION",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "community",
        "pro",
        "enterprise"
      ],
      adminTier: "admin"
    }
  },
  selva: {
    id: "selva",
    name: "Selva",
    aliases: [
      "Selva Office"
    ],
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "fruit",
    repo: "selva-office",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "selva.town",
    hosts: [
      "www.selva.town",
      "app.selva.town",
      "api.selva.town",
      "admin.selva.town",
      "ws.selva.town",
      "gw.selva.town"
    ],
    infraHosts: [
      "inference.selva.town"
    ],
    site: {
      category: "Infrastructure",
      track: "platform",
      order: 3,
      icon: "\u{1F333}",
      bannerKeyword: "AI AGENT OFFICE",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "maker",
        "studio",
        "enterprise"
      ],
      adminTier: "admin",
      checkoutSlug: "selva"
    }
  },
  forgesight: {
    id: "forgesight",
    name: "Forgesight",
    aliases: [
      "Forge Sight",
      "ForgeSight"
    ],
    siteSlug: "forge-sight",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    dataLicense: "DATA_LICENSE",
    layer: "roots",
    repo: "forgesight",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "forgesight.quest",
    hosts: [
      "app.forgesight.quest",
      "api.forgesight.quest",
      "admin.forgesight.quest"
    ],
    infraHosts: [],
    site: {
      category: "Intelligence",
      track: "self-serve",
      order: 4,
      icon: "\u{1F3ED}",
      bannerKeyword: "INDUSTRY INTELLIGENCE",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "essentials",
        "pro",
        "madfam"
      ],
      adminTier: "admin",
      checkoutSlug: "forgesight"
    }
  },
  dhanam: {
    id: "dhanam",
    name: "Dhanam",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "fruit",
    repo: "dhanam",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    openCoreRepo: "dhanam-core",
    isPublic: false,
    domain: "dhan.am",
    hosts: [
      "app.dhan.am",
      "api.dhan.am",
      "admin.dhan.am"
    ],
    infraHosts: [],
    site: {
      category: "Intelligence",
      track: "self-serve",
      order: 5,
      icon: "\u{1F4B0}",
      bannerKeyword: "BUDGETING & WEALTH",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "community",
        "essentials",
        "pro",
        "madfam"
      ],
      adminTier: "admin",
      checkoutSlug: "dhanam"
    }
  },
  fortuna: {
    id: "fortuna",
    name: "Fortuna",
    lifecycle: "degraded",
    lifecycleVerified: "2026-08-24",
    license: "Proprietary",
    layer: "roots",
    repo: "fortuna",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "fortuna.tube",
    hosts: [
      "api.fortuna.tube"
    ],
    infraHosts: [],
    site: {
      category: "Intelligence",
      track: "self-serve",
      order: 6,
      icon: "\u{1F52E}",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "pro",
        "madfam"
      ],
      adminTier: "admin"
    }
  },
  rondelio: {
    id: "rondelio",
    name: "Rondelio",
    lifecycle: "live",
    lifecycleVerified: "2026-07-09",
    license: "Proprietary",
    layer: "fruit",
    repo: "rondelio",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "rondel.io",
    hosts: [
      "www.rondel.io",
      "api.rondel.io",
      "play.rondel.io",
      "studio.rondel.io",
      "admin.rondel.io",
      "sim.rondel.io"
    ],
    infraHosts: [],
    site: {
      category: "Intelligence",
      track: "self-serve",
      order: 7,
      icon: "\u{1F3B2}",
      bannerKeyword: "GAMES",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "pro",
        "madfam"
      ],
      adminTier: "admin"
    }
  },
  karafiel: {
    id: "karafiel",
    name: "Karafiel",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "stem",
    repo: "karafiel",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "karafiel.mx",
    hosts: [
      "app.karafiel.mx",
      "api.karafiel.mx",
      "admin.karafiel.mx"
    ],
    infraHosts: [],
    site: {
      category: "Standards",
      track: "self-serve",
      order: 8,
      icon: "\u{1F4DC}",
      bannerKeyword: "COMPLIANCE & CFDI",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "contador",
        "despacho",
        "firma"
      ],
      adminTier: "admin",
      checkoutSlug: "karafiel"
    }
  },
  tezca: {
    id: "tezca",
    name: "Tezca",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "stem",
    repo: "tezca",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "tezca.mx",
    hosts: [
      "api.tezca.mx",
      "admin.tezca.mx"
    ],
    infraHosts: [],
    site: {
      category: "Standards",
      track: "self-serve",
      order: 9,
      icon: "\u2696\uFE0F",
      bannerKeyword: "LEGAL OPS",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "community",
        "essentials",
        "institutional"
      ],
      adminTier: "admin",
      checkoutSlug: "tezca"
    }
  },
  avala: {
    id: "avala",
    name: "Avala",
    acronym: "Alineamiento y Verificaci\xF3n de Aprendizajes y Logros Acreditables",
    aliases: [
      "AVALA"
    ],
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "stem",
    repo: "avala",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "avala.studio",
    hosts: [
      "app.avala.studio",
      "admin.avala.studio",
      "api.avala.studio"
    ],
    infraHosts: [],
    site: {
      category: "Standards",
      track: "ecosystem",
      order: 10,
      icon: "\u{1F393}",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "institution",
        "issuer",
        "enterprise"
      ],
      adminTier: "admin"
    }
  },
  yantra4d: {
    id: "yantra4d",
    name: "Yantra4D",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "fruit",
    repo: "yantra4d",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "yantra4d.com",
    hosts: [
      "app.yantra4d.com",
      "api.yantra4d.com",
      "admin.yantra4d.com"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "ecosystem",
      order: 11,
      icon: "\u{1F4D0}",
      bannerKeyword: "PHYGITAL FABRICATION",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "guest",
        "essentials",
        "pro",
        "madfam"
      ],
      adminTier: "admin",
      checkoutSlug: "yantra4d"
    }
  },
  cotiza: {
    id: "cotiza",
    name: "Cotiza",
    aliases: [
      "Cotiza Studio"
    ],
    siteSlug: "cotiza-studio",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "Proprietary",
    layer: "fruit",
    repo: "digifab-quoting",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "cotiza.studio",
    hosts: [
      "api.cotiza.studio"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "ecosystem",
      order: 12,
      icon: "\u{1F4CA}",
      bannerKeyword: "QUOTING ENGINE",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "maker",
        "creator-pro",
        "business",
        "enterprise"
      ],
      adminTier: "admin",
      checkoutSlug: "cotiza"
    }
  },
  "pravara-mes": {
    id: "pravara-mes",
    name: "Pravara MES",
    aliases: [
      "Pravara-MES"
    ],
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "fruit",
    repo: "pravara-mes",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "mes.madfam.io",
    hosts: [
      "mes-api.madfam.io"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "ecosystem",
      order: 13,
      icon: "\u2699\uFE0F",
      bannerKeyword: "MANUFACTURING",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "pro",
        "madfam"
      ],
      adminTier: "admin"
    }
  },
  voxa: {
    id: "voxa",
    name: "Voxa",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "Apache-2.0",
    layer: "fruit",
    repo: "voxa",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "voxa.madfam.io",
    hosts: [],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "self-serve",
      order: 14,
      icon: "\u{1F5E3}\uFE0F",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "family",
        "clinic"
      ],
      adminTier: "admin",
      checkoutSlug: "voxa"
    }
  },
  "phynd-crm": {
    id: "phynd-crm",
    name: "PhyndCRM",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "fruit",
    repo: "phynd-crm",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "phynd.app",
    hosts: [
      "crm.madfam.io"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "self-serve",
      order: 15,
      icon: "\u{1F91D}",
      bannerKeyword: "CLIENT PORTAL & CRM",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "pro",
        "madfam"
      ],
      adminTier: "admin"
    }
  },
  ceq: {
    id: "ceq",
    name: "CEQ",
    lifecycle: "degraded",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "fruit",
    repo: "ceq",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "ceq.lol",
    hosts: [
      "app.ceq.lol",
      "api.ceq.lol",
      "ws.ceq.lol"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "self-serve",
      order: 16,
      icon: "\u{1F3A8}",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "pro",
        "madfam"
      ],
      adminTier: "admin"
    }
  },
  acervo: {
    id: "acervo",
    name: "Acervo",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "UNLICENSED",
    layer: "fruit",
    repo: "acervo",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "acervo.madfam.io",
    hosts: [],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "self-serve",
      order: 17,
      icon: "\u{1F4DA}",
      showInBanner: true
    },
    commerce: {
      tiers: [],
      adminTier: "admin"
    }
  },
  kalya: {
    id: "kalya",
    name: "kalya",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "UNLICENSED",
    layer: "fruit",
    repo: "kalya",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "kalya.app",
    hosts: [
      "www.kalya.app",
      "kalya.madfam.io"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "self-serve",
      order: 18,
      icon: "\u{1F4C5}",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "solo",
        "team",
        "biz"
      ],
      adminTier: "admin",
      checkoutSlug: "kalya",
      tierLabels: {
        free: "Gratis",
        solo: "Solo",
        team: "Equipo",
        biz: "Negocio"
      }
    }
  },
  symbiosis: {
    id: "symbiosis",
    name: "Symbiosis HCM",
    lifecycle: "live",
    lifecycleVerified: "2026-09-05",
    license: "AGPL-3.0",
    layer: "fruit",
    repo: "symbiosis-hcm",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "hcm.madfam.io",
    hosts: [
      "hcm-app.madfam.io",
      "hcm-admin.madfam.io",
      "hcm-api.madfam.io"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "self-serve",
      order: 19,
      icon: "\u{1F9EC}",
      showInBanner: false
    },
    commerce: {
      tiers: [
        "free",
        "team",
        "biz"
      ],
      adminTier: "admin",
      checkoutSlug: "symbiosis",
      tierLabels: {
        free: "Gratis",
        team: "Equipo",
        biz: "Negocio"
      }
    }
  },
  "crea-map": {
    id: "crea-map",
    name: "MAP \u2014 Modelo de Acompa\xF1amiento Personalizado",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "UNLICENSED",
    layer: "fruit",
    repo: "crea-map",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "crea-map.madfam.io",
    hosts: [],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "ecosystem",
      order: 20,
      icon: "\u{1F5FA}\uFE0F",
      showInBanner: false
    },
    commerce: {
      tiers: [
        "membership"
      ],
      adminTier: "admin",
      checkoutSlug: "crea-map",
      tierLabels: {
        membership: "Acceso de equipo"
      }
    }
  },
  nauta: {
    id: "nauta",
    name: "Nauta",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "UNLICENSED",
    layer: "fruit",
    repo: "nauta",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "cto.madfam.io",
    hosts: [
      "crea.madfam.io"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "platform",
      order: 21,
      icon: "\u{1F9ED}",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "erp",
        "vcto"
      ],
      adminTier: "admin",
      tierLabels: {
        erp: "ERP",
        vcto: "vCTO"
      }
    }
  },
  meridian: {
    id: "meridian",
    name: "Meridian",
    lifecycle: "degraded",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "stem",
    repo: "meridian",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "meridian.madfam.io",
    hosts: [
      "meridian-app.madfam.io",
      "meridian-api.madfam.io",
      "meridian-admin.madfam.io"
    ],
    infraHosts: [],
    site: {
      category: "Standards",
      track: "ecosystem",
      order: 22,
      icon: "\u{1F6C2}",
      showInBanner: true
    },
    commerce: {
      tiers: [],
      adminTier: "admin"
    }
  },
  "fashion-cabinet": {
    id: "fashion-cabinet",
    name: "Fashion Cabinet",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "stem",
    repo: "fashion-cabinet",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "fashioncabi.net",
    hosts: [
      "www.fashioncabi.net",
      "fc.madfam.io"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "ecosystem",
      order: 23,
      icon: "\u{1F457}",
      showInBanner: true
    },
    commerce: {
      tiers: [],
      adminTier: "admin"
    }
  },
  factlas: {
    id: "factlas",
    name: "Factlas",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "Proprietary",
    layer: "roots",
    repo: "factlas",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "factl.as",
    hosts: [
      "api.factl.as"
    ],
    infraHosts: [],
    site: {
      category: "Intelligence",
      track: "ecosystem",
      order: 24,
      icon: "\u{1F30E}",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "pilot",
        "analyst",
        "institutional"
      ],
      adminTier: "admin"
    }
  },
  periplo: {
    id: "periplo",
    name: "Periplo",
    lifecycle: "incubating",
    lifecycleVerified: "2026-08-24",
    license: "UNLICENSED",
    layer: "fruit",
    repo: "periplo",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    hosts: [],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "self-serve",
      order: 25,
      icon: "\u{1F4CD}",
      showInBanner: false
    },
    commerce: {
      tiers: [
        "free",
        "essentials",
        "pro"
      ],
      adminTier: "admin"
    }
  },
  "geom-core": {
    id: "geom-core",
    name: "geom-core",
    lifecycle: "incubating",
    lifecycleVerified: "2026-09-04",
    license: "Apache-2.0",
    layer: "stem",
    repo: "geom-core",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    hosts: [],
    infraHosts: [],
    site: {
      category: "Standards",
      track: "ecosystem",
      order: 26,
      icon: "\u{1F9EE}",
      showInBanner: false
    },
    commerce: {
      tiers: [],
      adminTier: "admin"
    }
  },
  fragua: {
    id: "fragua",
    name: "Fragua",
    lifecycle: "incubating",
    lifecycleVerified: "2026-09-04",
    license: "AGPL-3.0",
    layer: "soil",
    repo: "enclii",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    hosts: [],
    infraHosts: [],
    site: {
      category: "Infrastructure",
      track: "platform",
      order: 27,
      icon: "\u2692\uFE0F",
      showInBanner: false
    },
    commerce: {
      tiers: [
        "arranque",
        "equipo",
        "escala",
        "dedicada"
      ],
      adminTier: "admin",
      tierLabels: {
        arranque: "Arranque",
        equipo: "Equipo",
        escala: "Escala",
        dedicada: "Dedicada"
      }
    }
  },
  enclii_depot: {
    id: "enclii_depot",
    name: "Enclii Depot",
    lifecycle: "incubating",
    lifecycleVerified: "2026-09-04",
    license: "AGPL-3.0",
    layer: "soil",
    repo: "enclii",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    hosts: [],
    infraHosts: [],
    site: {
      category: "Infrastructure",
      track: "platform",
      order: 28,
      icon: "\u{1F5C4}\uFE0F",
      showInBanner: false
    },
    commerce: {
      tiers: [
        "community",
        "pro",
        "premium",
        "madfam"
      ],
      adminTier: "admin",
      tierLabels: {
        community: "Comunidad",
        pro: "Est\xE1ndar",
        premium: "Alta disponibilidad",
        madfam: "Dedicado"
      }
    }
  }
};
var generatedRetiredProducts = {
  penny: {
    id: "penny",
    name: "PENNY",
    lifecycle: "retired",
    retiredOn: "2026-07-25",
    successorSlug: "selva",
    redirectTo: "https://selva.town"
  },
  sim4d: {
    id: "sim4d",
    name: "Sim4D",
    lifecycle: "retired",
    retiredOn: "2026-08-30",
    successorSlug: "yantra4d",
    redirectTo: "https://yantra4d.com"
  },
  spark: {
    id: "spark",
    name: "SPARK",
    lifecycle: "retired",
    retiredOn: "2026-04-08"
  }
};

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
  },
  UNLICENSED: {
    name: "Proprietary (no licence granted)",
    openSource: false,
    purpose: "The SPDX form docs/LICENSING_STRATEGY.md prescribes for a proprietary manifest; a product carrying it grants no licence at all"
  }
};
var lifecycles = {
  incubating: { name: "Incubating", renderable: true, live: false },
  beta: { name: "Beta", renderable: true, live: true },
  live: { name: "Live", renderable: true, live: true },
  degraded: { name: "Degraded", renderable: true, live: false },
  retired: { name: "Retired", renderable: false, live: false }
};
var productStatuses = {
  active: { name: "Active", renderable: true },
  retired: { name: "Retired", renderable: false }
};
var products = generatedProducts;
var retiredProducts = generatedRetiredProducts;
var productIds = Object.keys(products);
function isRetired(product) {
  return product.lifecycle === "retired";
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
function getProductsByLifecycle(...stages) {
  return getActiveProducts().filter((p) => stages.includes(p.lifecycle));
}
function getPublicProducts() {
  return getActiveProducts().filter((p) => p.isPublic === true);
}
function getSurfaceProducts() {
  return getActiveProducts().filter(
    (p) => typeof p.domain === "string" && !p.infraHosts.includes(p.domain)
  );
}
function isValidProductId(value) {
  return value in products;
}
function isRetiredProductId(value) {
  return value in retiredProducts;
}
function getProduct(id) {
  return products[id];
}
function getRetiredProduct(id) {
  return retiredProducts[id];
}
function getProductGitHubUrl(id) {
  const product = products[id];
  if (!product.repo || !product.githubOrg) return null;
  return `https://github.com/${product.githubOrg}/${product.repo}`;
}
function getProductWebsiteUrl(id) {
  if (isRetiredProductId(id)) {
    const tombstone = retiredProducts[id];
    return tombstone.redirectTo ?? null;
  }
  const product = products[id];
  return product.domain ? `https://${product.domain}` : null;
}
var registryVersion = PRODUCT_PROJECTION.registryVersion;

export { PRODUCT_PROJECTION, ecosystemLayers, getActiveProducts, getProduct, getProductGitHubUrl, getProductWebsiteUrl, getProductsByLayer, getProductsByLicense, getProductsByLifecycle, getPublicProducts, getRetiredProduct, getSurfaceProducts, isRetired, isRetiredProductId, isValidProductId, licenseTypes, lifecycles, productIds, productStatuses, products, registryVersion, retiredProducts };
//# sourceMappingURL=products.js.map
//# sourceMappingURL=products.js.map