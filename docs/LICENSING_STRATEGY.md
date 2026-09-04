# MADFAM Licensing Strategy

**Last verified: 2026-07-25** — the matrix below was checked by reading the
`LICENSE` file and `package.json` `license` field of every repository cloned in
`~/labspace`. Where a repository is not cloned locally, that is said.

> *"Give away the roads, toll the destinations."*

This document defines the licensing philosophy for MADFAM repositories and
records which repositories currently comply.

> ## Scope warning — this is a partial matrix
>
> The table below covers the **core platforms and shared packages**. It is not
> a complete license inventory. The organisation has **96 non-fork
> repositories** (verified 2026-07-25); this document covers roughly twenty.
> Whole classes are absent — notably the Yantra4D Commons parametric-design
> repositories, which are documented as CERN-OHL-W-2.0 in the private registry
> and were not verifiable here because they are not cloned locally.
>
> A previous revision titled this section "Complete License Matrix". It was not
> complete, and treating it as complete is how a repository ends up
> mis-described in public — which is exactly what happened to ForgeSight.

---

## Philosophy: tiered openness

- Open infrastructure creates trust and adoption.
- Community tools grow the ecosystem.
- Revenue engines stay protected.
- Revenue funds continued development of the open layers.

### The tiers

| Tier | License | Rationale | Industry precedent |
|---|---|---|---|
| **Infrastructure** | AGPL-3.0 | If a cloud provider hosts our infrastructure as a service, they must open-source modifications. Users can audit identity and financial code. | MongoDB, Grafana, Mastodon |
| **Community tools** | MPL-2.0 | File-level copyleft: companies can embed in proprietary products, changes to our files flow back. | Firefox, LibreOffice |
| **Foundational libraries** | Apache-2.0 | Patent grant protects both sides; corporate legal teams approve it easily. | Kubernetes, TensorFlow |
| **Revenue engines** | Proprietary | Pricing logic, market intelligence, brand assets. | — |
| **Shared packages** | MIT | Zero friction for anyone consuming `@madfam/*`. | Standard npm practice |

### Decision tree for a new repository

```
Is this infrastructure someone else might host as a service?
├─ Yes → AGPL-3.0
└─ No
   ├─ Foundational library with patent exposure? → Apache-2.0
   ├─ Community tool you want widely adopted?    → MPL-2.0
   ├─ Revenue engine or trade secret?            → Proprietary
   └─ Otherwise (shared utilities/packages)      → MIT
```

---

## License matrix (core platforms and packages)

**Verified 2026-07-25** by reading each `LICENSE` file on disk. The `LICENSE`
file is ground truth — where a registry, a badge or a `package.json` disagrees
with it, the `LICENSE` file wins and the other is a defect.

| Repository | LICENSE file says | `package.json` `license` | Tier | Notes |
|---|---|---|---|---|
| `enclii` | AGPL-3.0 | *(field absent)* | Infrastructure | **Dual-licensed** — `COMMERCIAL_LICENSE.md` present |
| `janua` | AGPL-3.0 | *(field absent)* | Infrastructure | |
| `dhanam` | AGPL-3.0 | `AGPL-3.0-only` ✅ | Infrastructure | Repository is **private** as of 2026-07-25 |
| `dhanam-core` | AGPL-3.0 | — | Infrastructure | Public open-core extraction, created 2026-07-20 |
| `avala` | AGPL-3.0 | *(field absent)* | Infrastructure | Repository is **private** as of 2026-07-16 |
| `tezca` | AGPL-3.0 | — | Infrastructure | |
| `karafiel` | AGPL-3.0 | — | Infrastructure | Repository is **private** |
| `yantra4d` | AGPL-3.0 | — | Infrastructure | |
| `pravara-mes` | AGPL-3.0 | — | Infrastructure | |
| `phynd-crm` | AGPL-3.0 | — | Infrastructure | |
| `selva-office` | AGPL-3.0 | — | Infrastructure | |
| `subtext` | AGPL-3.0 | — | Infrastructure | |
| `meridian` | AGPL-3.0 | `AGPL-3.0-only` ✅ | Infrastructure | Created 2026-07-25; **not deployed** |
| **`forgesight`** | **AGPL-3.0** + separate `DATA_LICENSE` | *(field absent)* | — | **Corrected.** See below. |
| `sim4d` | MPL-2.0 | `MPL-2.0` ✅ | Community | |
| `bloom-scroll` | MPL-2.0 | *(field absent)* | Community | |
| `geom-core` | Apache-2.0 | `Apache-2.0` ✅ | Foundation | README badge also says Apache 2.0 — **consistent as of 2026-07-25** |
| `fortuna` | Proprietary | — | Revenue | Repository is **private** |
| `digifab-quoting` (Cotiza) | Proprietary | *(field absent)* | Revenue | |
| `blueprint-harvester` | Proprietary | *(field absent)* | Revenue | |
| `forj` | Proprietary | `UNLICENSED` ✅ | Revenue | |
| `coforma-studio` | Proprietary | `UNLICENSED` ✅ | Revenue | |
| `rondelio` | Proprietary | — | Revenue | |
| `routecraft` | Proprietary | — | Revenue | |
| `avala-content` | Proprietary | — | Revenue | Private, created 2026-07-16 |
| `madfam-site` | Proprietary | `UNLICENSED` ✅ | Business | Copyright line reads "2024-2025 MADFAM" — see below |
| `primavera3d` | Proprietary | `UNLICENSED` ✅ | Business | |
| `solarpunk-foundry` | MIT | `MIT` ✅ | Packages | |
| `factlas` | **none** | — | — | **No LICENSE file** |
| `symbiosis-hcm` | **none** | — | — | **No LICENSE file** |
| `voxa` | Apache-2.0 *(per registry)* | — | — | **Not cloned locally — not verified here** |
| `coupler` | AGPL-3.0 *(per registry)* | — | — | **Not cloned locally — not verified here** |
| `electrochem-sim` | MPL-2.0 *(per registry)* | — | Community | **Not cloned locally.** Registry records the repo as stale since 2025-11. |

---

## Corrections applied 2026-07-25

These matter enough to state individually.

### ForgeSight is AGPL-3.0, not Proprietary

The previous revision listed `forgesight` as **Proprietary — "Cost database
(trade secret)"**, and placed it under "Revenue Engines". `forgesight/LICENSE`
is the **GNU Affero General Public License**, with a separate `DATA_LICENSE`
alongside it covering the dataset.

That is the highest-consequence error this document has carried: a public
licensing matrix asserting proprietary terms over an AGPL-licensed codebase is
wrong in the direction that misleads users about their rights.

The split is coherent once you see it — **code is AGPL, data is separately
licensed** — and it is a pattern worth reusing for any repository whose value
is in a dataset rather than an implementation.

> Note for follow-up: `internal-devops/ecosystem/repo-registry.md` repeats the
> stale "proprietary edge per licensing strategy" claim for this repository.
> The `LICENSE` file is ground truth; the registry should be corrected too.
> That file is outside this repository.

### There is no repository named `madfam`

The previous revision listed a row: `madfam` — Proprietary — "Product showcase
brand". No such repository exists in the organisation. `madfam-site` does. Row
removed.

(The name does appear in `ops/bin/madfam.sh` as a service entry, which is why
`./madfam.sh full` cannot start it. See
[`DOGFOODING_GUIDE.md`](./DOGFOODING_GUIDE.md).)

### Enclii is already dual-licensed

The previous revision listed Enclii, Janua and Dhanam as *future* dual-licensing
"candidates". `enclii/COMMERCIAL_LICENSE.md` exists in the working tree
(verified 2026-07-25). Enclii has moved from the aspiration section into the
matrix. Janua and Dhanam remain candidates.

### The `@madfam/ui` row was stale

`packages/ui/README.md` opens **"This package is deprecated."** The MADFAM UI
system moved to a decentralised per-app model. The repository is still MIT; the
package should not be adopted for new work.

---

## Compliance requirements

Every repository must have:

1. A `LICENSE` file in the repository root with the full license text.
2. A `package.json` `license` field matching it, where the repository has a
   `package.json`:

   | License | SPDX identifier |
   |---|---|
   | AGPL-3.0 | `AGPL-3.0-only` |
   | MPL-2.0 | `MPL-2.0` |
   | Apache-2.0 | `Apache-2.0` |
   | MIT | `MIT` |
   | Proprietary | `UNLICENSED` |

3. A copyright line naming `Innovaciones MADFAM S.A.S. de C.V.` with a year
   range that includes the current year.

### Compliance is not currently met — measured, not asserted

*Verified 2026-07-25 across the repositories cloned in `~/labspace`.*

| Gap | Detail |
|---|---|
| **Missing `LICENSE` file** | `factlas` and `symbiosis-hcm` among cloned repos. The 2026-07-04 org-wide audit found roughly ten active repositories with no `LICENSE` at all, and one whose `LICENSE` file is a saved HTML 404 page. |
| **Missing `package.json` `license` field** | At least 7 of the cloned repositories with a `package.json` omit it: `enclii`, `janua`, `avala`, `bloom-scroll`, `forgesight`, `digifab-quoting`, `blueprint-harvester`. |
| **Internal contradictions** | The 2026-07-04 audit flags license inconsistencies in several Yantra4D Commons repositories (`ultimate-box`, `multiboard`, `keyv2`, `stemfie`, `julia-vase`). Not verifiable here — those repositories are not cloned locally. |
| ~~**Package-level mismatch inside this repository**~~ | **Closed 2026-09-04.** `@madfam/ecosystem-banner` declared `"license": "UNLICENSED"` while the repository `LICENSE` is MIT and every other `@madfam/*` package declares `MIT`. It now declares `MIT`, per the shared-packages tier above. |
| **Stale copyright ranges** | The prescribed header still reads "2024-2025" while repositories created in 2026 (`meridian`, `coupler`, `dhanam-core`) are being licensed under it. `madfam-site/LICENSE` reads "2024-2025 MADFAM" rather than the full legal entity name. |

### Verification command

```bash
# From ~/labspace — LICENSE presence
for dir in */; do
  if [ -f "$dir/LICENSE" ]; then
    printf '%-28s %s\n' "$dir" "$(head -1 "$dir/LICENSE" | cut -c1-60)"
  else
    printf '%-28s MISSING LICENSE\n' "$dir"
  fi
done

# package.json license field agreement
for f in */package.json; do
  printf '%-40s %s\n' "$f" \
    "$(python3 -c "import json,sys;print(json.load(open(sys.argv[1])).get('license','(absent)'))" "$f")"
done
```

---

## Future considerations

### Dual licensing (enterprise)

AGPL-3.0 free edition plus a paid commercial license for organisations that
cannot comply with AGPL. **Already done for Enclii.** Remaining candidates:
Janua, Dhanam.

Dual licensing requires a Contributor License Agreement so MADFAM can relicense
contributions — standard practice for dual-licensed projects.

### Open core for Forj

Currently a fully proprietary marketplace. An alternative worth evaluating:
AGPL-3.0 storefront builder plus proprietary premium features, with revenue
from transaction fees and enterprise features rather than direct licensing.
Network effects may favour opening the storefront.

`dhanam-core` (public, AGPL-3.0, created 2026-07-20) is the first instance of
this open-core pattern actually shipping in the organisation, and is the
reference for how the extraction boundary was drawn.

---

## Changelog

| Date | Change |
|---|---|
| 2026-07-25 | Verified matrix against on-disk `LICENSE` files. Corrected ForgeSight (AGPL, not proprietary). Removed the non-existent `madfam` repository. Moved Enclii to dual-licensed. Added the missing-license and mismatch gap list. Retitled the matrix as partial. Added repositories missing from earlier revisions. |
| 2025-11-27 | Initial strategy document; geom-core moved MPL-2.0 → Apache-2.0 for patent protection; missing LICENSE files created; `package.json` mismatches fixed |
