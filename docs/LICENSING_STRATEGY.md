# MADFAM Licensing Strategy

> *"Give away the roads, toll the destinations."*

This document defines the licensing philosophy and implementation for all MADFAM repositories.

## Philosophy: Solarpunk Sovereignty

Our licensing follows a **tiered openness model**:
- Open infrastructure creates trust and adoption
- Community tools grow the ecosystem  
- Revenue engines stay protected
- The flywheel effect funds continued development

## The Four Tiers

### 1. AGPL v3 — Infrastructure (Anti-Cloud-Capture)

**Repositories:** `enclii`, `janua`, `dhanam`, `avala`

**Rationale:**
- **Anti-AWS Play**: If cloud providers clone our infrastructure, they MUST open-source modifications
- **Trust Signal**: Users can audit authentication and financial code
- **Contributions Flow Back**: Community improvements benefit everyone

**When to use:** Infrastructure that others might host as a service

**Industry examples:** MongoDB, Grafana, Mastodon

---

### 2. MPL 2.0 — Community Tools (Adoption-Friendly Copyleft)

**Repositories:** `bloom-scroll`, `electrochem-sim` (Galvana), `sim4d`

**Rationale:**
- **Adoption-Friendly**: Companies can embed in proprietary products
- **File-Level Copyleft**: Changes to our files must be shared, but users can add private files
- **Community Building**: Tools spread further with fewer restrictions

**When to use:** Tools you want widely adopted while protecting core contributions

**Industry examples:** Firefox, Rust (partially), LibreOffice

---

### 3. Apache 2.0 — Foundational Libraries (Patent Protection)

**Repositories:** `geom-core`

**Rationale:**
- **Patent Grant**: Protects both MADFAM and users from patent trolls
- **Corporate-Friendly**: Legal teams approve it easily (unlike GPL variants)
- **Math is Math**: Geometry algorithms don't benefit from copyleft restrictions

**When to use:** Foundational libraries, especially with potential patent concerns

**Industry examples:** Kubernetes, TensorFlow, Apache Kafka

---

### 4. Proprietary — Revenue Engines (Trade Secrets)

**Repositories:** 
- **Intelligence:** `fortuna`, `forgesight`, `blueprint-harvester`
- **Commerce:** `forj`, `digifab-quoting` (Cotiza), `coforma-studio`
- **Business Sites:** `madfam-site`, `madfam`, `primavera3d`

**Rationale:**
- **Trade Secrets**: Market intelligence algorithms, pricing logic
- **Revenue Protection**: Marketplace can't be cloned by competitors
- **Brand Assets**: Corporate websites contain protected designs and copy

**When to use:** Anything that constitutes competitive advantage or revenue generation

---

### 5. MIT — Shared Packages (Maximum Reach)

**Repositories:** `solarpunk-foundry` (for `@madfam/core`, `@madfam/ui`)

**Rationale:**
- **Maximum Adoption**: Zero friction for anyone using shared packages
- **Ecosystem Glue**: Shared constants and UI components spread everywhere
- **Standard Practice**: Most npm packages use MIT

**When to use:** Shared utilities, design systems, organizational constants

---

## Complete License Matrix

| Repository | License | Tier | Strategic Purpose |
|------------|---------|------|-------------------|
| **enclii** | AGPL v3 | Infrastructure | Sovereign PaaS, prevents cloud capture |
| **janua** | AGPL v3 | Infrastructure | Identity/SSO trust through transparency |
| **dhanam** | AGPL v3 | Infrastructure | Financial code trust |
| **avala** | AGPL v3 | Infrastructure | Verification transparency |
| **bloom-scroll** | MPL 2.0 | Community | Slow web ethos & community building |
| **electrochem-sim** | MPL 2.0 | Community | Open science collaboration |
| **sim4d** | MPL 2.0 | Community | CAD tool adoption (without marketplace) |
| **geom-core** | Apache 2.0 | Foundation | Geometry standard with patent protection |
| **fortuna** | Proprietary | Revenue | Market gap intelligence (trade secret) |
| **forgesight** | Proprietary | Revenue | Cost database (trade secret) |
| **blueprint-harvester** | Proprietary | Revenue | Model index (trade secret) |
| **forj** | Proprietary | Revenue | Marketplace revenue engine |
| **digifab-quoting** | Proprietary | Revenue | Pricing logic (trade secret) |
| **coforma-studio** | Proprietary | Revenue | Customer data platform |
| **madfam-site** | Proprietary | Business | Corporate brand protection |
| **madfam** | Proprietary | Business | Product showcase brand |
| **primavera3d** | Proprietary | Business | Factory portfolio brand |
| **solarpunk-foundry** | MIT | Packages | Maximum adoption for shared code |

## The Flywheel Effect

```
┌─────────────────────────────────────────────────────────┐
│  1. AGPL Infrastructure (Enclii/Janua)                  │
│     ↓ builds trust & adoption                           │
│  2. MPL Community Tools (BloomScroll/Sim4D)             │
│     ↓ grows ecosystem                                   │
│  3. Apache Foundation (geom-core)                       │
│     ↓ enables innovation                                │
│  4. Proprietary Revenue (Forj/Fortuna/Cotiza)           │
│     ↓ funds everything                                  │
│  💰 Revenue reinvested in open infrastructure           │
│     ↓                                                   │
│  🔄 REPEAT                                              │
└─────────────────────────────────────────────────────────┘
```

## Implementation Requirements

### Every Repository Must Have:

1. **LICENSE file** in repository root with full license text
2. **package.json `license` field** matching the LICENSE file:
   - AGPL v3 → `"AGPL-3.0-only"`
   - MPL 2.0 → `"MPL-2.0"`
   - Apache 2.0 → `"Apache-2.0"`
   - Proprietary → `"UNLICENSED"`
   - MIT → `"MIT"`

3. **Copyright header** in LICENSE file:
   ```
   Copyright (c) 2024-2025 Innovaciones MADFAM SAS de CV
   ```

### Verification Command

```bash
# Run from labspace root to verify all licenses
for dir in */; do
  if [ -f "$dir/LICENSE" ]; then
    echo "✅ $dir: $(head -1 $dir/LICENSE | cut -c1-50)"
  else
    echo "❌ $dir: MISSING LICENSE"
  fi
done
```

## Future Considerations

### Dual Licensing (Enterprise)

For AGPL repositories, consider offering commercial licenses:
- **AGPL v3** (free): Open source with copyleft requirements
- **Enterprise License** (paid): Proprietary use without disclosure

This enables revenue from enterprises who can't comply with AGPL while keeping the community edition open.

**Candidates:** Enclii, Janua, Dhanam

### Contributor License Agreement (CLA)

To enable dual licensing, contributors must sign a CLA granting MADFAM the right to relicense their contributions. This is standard practice for dual-licensed projects (MongoDB, GitLab).

### Open Core for Forj

**Current:** Fully proprietary marketplace

**Alternative consideration:** AGPL v3 storefront builder + Proprietary premium features

**Rationale:** Network effects may benefit more from open-sourcing the storefront builder. Revenue from transaction fees, premium themes, and enterprise features instead of direct licensing.

---

## Decision Tree for New Repositories

```
Is this infrastructure that others might host?
├─ Yes → AGPL v3
└─ No
   ├─ Is this a foundational library with patent concerns?
   │  ├─ Yes → Apache 2.0
   │  └─ No
   │     ├─ Is this a community tool for adoption?
   │     │  ├─ Yes → MPL 2.0
   │     │  └─ No
   │     │     ├─ Is this a revenue engine or trade secret?
   │     │     │  ├─ Yes → Proprietary
   │     │     │  └─ No → MIT (shared packages/utilities)
```

---

## Changelog

| Date | Change |
|------|--------|
| 2025-11-27 | Initial strategy document created |
| 2025-11-27 | geom-core changed from MPL 2.0 to Apache 2.0 (patent protection) |
| 2025-11-27 | All missing LICENSE files created |
| 2025-11-27 | All package.json license field mismatches fixed |

---

*Last updated: November 27, 2025*
