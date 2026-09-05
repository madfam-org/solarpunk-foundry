/**
 * MADFAM Ecosystem Platform List — Source of Truth
 *
 * Add/edit a platform here and it propagates to every landing that imports
 * `EcosystemBanner` from `@madfam/ecosystem-banner`. That is the canonical
 * package; the older `@dhanam/ui` copy this header used to name is the stale
 * one the 2026-06-15 banner/footer audit was written to retire.
 *
 * URLs were re-probed on 2026-09-05 (HEAD): every entry here answered 200
 * except `dhan.am` (307) and `forgesight.quest`, which returned no status at
 * all from the probing environment — unverified, not known-down.
 *
 * STILL HAND-KEPT, AND WHY. This list is meant to be a filter over the vendored
 * product projection (`@madfam/core`'s `products/projection.public.json`):
 * public surface ∧ lifecycle live/beta ∧ not retired ∧ `site.show_in_banner` ∧
 * primary domain not one of the product's own infra hosts. That filter selects
 * 19 products at registry version 4, and 7 of them carry no
 * `site.banner_keyword` in the projection (avala, voxa, acervo, kalya, nauta,
 * fashion-cabinet, factlas). A banner entry needs a keyword, and inventing one
 * here is exactly the unowned hand-authored copy the registry pipeline exists to
 * remove — so the generation is blocked on that one field rather than guessed
 * around. See docs/ECOSYSTEM_BANNER.md, "Platform list membership".
 */
export interface EcosystemPlatform {
  /** Short uppercase keyword shown before the colon, e.g. "BUDGETING & WEALTH". */
  keyword: string;
  /** Platform display name shown after the colon, e.g. "Dhanam". */
  name: string;
  /** Apex domain URL, e.g. "https://dhan.am". No trailing slash. */
  url: string;
}

export const DEFAULT_ECOSYSTEM_PLATFORMS: readonly EcosystemPlatform[] = [
  { keyword: 'BUDGETING & WEALTH', name: 'Dhanam', url: 'https://dhan.am' },
  { keyword: 'AI AGENT OFFICE', name: 'Selva', url: 'https://selva.town' },
  { keyword: 'COMPLIANCE & CFDI', name: 'Karafiel', url: 'https://karafiel.mx' },
  { keyword: 'AUTHENTICATION', name: 'Janua', url: 'https://janua.dev' },
  { keyword: 'DEPLOYMENT', name: 'Enclii', url: 'https://enclii.dev' },
  { keyword: 'LEGAL OPS', name: 'Tezca', url: 'https://tezca.mx' },
  { keyword: 'PHYGITAL FABRICATION', name: 'Yantra4D', url: 'https://yantra4d.com' },
  { keyword: 'QUOTING ENGINE', name: 'Cotiza', url: 'https://cotiza.studio' },
  { keyword: 'INDUSTRY INTELLIGENCE', name: 'Forgesight', url: 'https://forgesight.quest' },
  { keyword: 'MANUFACTURING', name: 'Pravara MES', url: 'https://mes.madfam.io' },
  { keyword: 'GAMES', name: 'Rondelio', url: 'https://rondel.io' },
  { keyword: 'ROUTING & LOGISTICS', name: 'RouteCraft', url: 'https://routecraft.app' },
  { keyword: 'CLIENT PORTAL & CRM', name: 'PhyndCRM', url: 'https://phynd.app' },
] as const;
