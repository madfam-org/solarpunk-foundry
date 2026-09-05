/**
 * MADFAM Ecosystem Platform List
 *
 * GENERATED MEMBERSHIP. `DEFAULT_ECOSYSTEM_PLATFORMS` is no longer typed here:
 * it is `platforms.generated.ts`, rendered from the product projection vendored
 * in `@madfam/core` (`src/products/projection.public.json`) by
 * `scripts/check-product-projection.mjs`, which fails Package Quality when this
 * list drifts from the registry. To add, remove or rename a platform, change the
 * private product registry and re-vendor - editing a list here is what made six
 * product lists disagree across three repos in the first place.
 *
 * The filter: public product surface (a routed primary domain that is not one of
 * the product's own infra endpoints) AND lifecycle live or beta AND not retired
 * AND `site.show_in_banner`, ordered by the registry's `site.order`. The
 * infra-host clause is why Janua links `janua.dev` and not an auth endpoint; the
 * retired clause is why no Sim4D, PENNY or SPARK entry can come back.
 *
 * URLs were re-probed on 2026-09-05 (HEAD, no redirects followed): 17 of the 19
 * answered 200, `dhan.am` answered 307 and `cto.madfam.io` answered 404.
 * `forgesight.quest` returned no status at all from the probing environment, so
 * it is recorded as unverified rather than down. The 404 and the unverified host
 * are registry facts to fix in the registry, not entries to drop here.
 *
 * This file keeps the public type and the vendor-friendly re-export, so a
 * consumer's import path never changes.
 */
import { GENERATED_ECOSYSTEM_PLATFORMS } from './platforms.generated';

export interface EcosystemPlatform {
  /** Short uppercase keyword shown before the colon, e.g. "BUDGETING & WEALTH". */
  keyword: string;
  /** Platform display name shown after the colon, e.g. "Dhanam". */
  name: string;
  /** Apex domain URL, e.g. "https://dhan.am". No trailing slash. */
  url: string;
}

export const DEFAULT_ECOSYSTEM_PLATFORMS: readonly EcosystemPlatform[] =
  GENERATED_ECOSYSTEM_PLATFORMS;
