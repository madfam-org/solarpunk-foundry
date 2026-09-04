/**
 * MADFAM Ecosystem Platform List — Source of Truth
 *
 * Add/edit a platform here and it propagates to every landing that imports
 * `EcosystemBanner` from `@madfam/ecosystem-banner`. That is the canonical
 * package; the older `@dhanam/ui` copy this header used to name is the stale
 * one the 2026-06-15 banner/footer audit was written to retire.
 *
 * URLs were last probed live on 2026-05-04 (HEAD, accepting
 * 200/301/302/405-method-allowed). Names, membership and the Janua URL were
 * reconciled against the ecosystem domain map and brand records on
 * 2026-09-04 — a records check, not a re-probe. A full re-probe and a
 * membership refresh (several live platforms are still missing from this list)
 * are pending; this list is scheduled to become generated from the single
 * product registry, at which point membership stops being hand-kept.
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
