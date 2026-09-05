/**
 * MADFAM Ecosystem Platform List
 *
 * DERIVED MEMBERSHIP - there is no platform list in this package.
 * `DEFAULT_ECOSYSTEM_PLATFORMS` is `getBannerProducts()` from
 * `@madfam/core/products`, mapped into the ticker's `{ keyword, name, url }`
 * shape. The product facts live in one place: the projection vendored in
 * `@madfam/core` (`src/products/projection.public.json`), itself the public-safe
 * projection of the one private product registry.
 *
 * WHY (2026-09-05): this file used to carry a hand-kept list; #46 replaced that
 * with `platforms.generated.ts`, a second file rendered from the same
 * projection. Two rendered copies of one registry is still two copies - one
 * vendored JSON, one hash, one filter is the shape that cannot drift. The filter
 * itself now lives in `@madfam/core` so this package and every downstream repo
 * apply the same one rather than re-implementing it.
 *
 * To add, remove or rename a platform: change the private product registry,
 * re-vendor `projection.public.json` into `@madfam/core`, and run
 * `node scripts/check-product-projection.mjs --write`. Editing a list here is
 * what made six product lists disagree across three repos in the first place.
 *
 * The filter (stated in `@madfam/core`'s `getBannerProducts`): public product
 * surface (a routed primary domain that is not one of the product's own infra
 * endpoints) AND lifecycle live or beta AND not retired AND
 * `site.showInBanner`, ordered by the registry's `site.order`. The infra-host
 * clause is why Janua links `janua.dev` and not an auth endpoint; the retired
 * clause is why no Sim4D, PENNY or SPARK entry can come back.
 *
 * URLs were re-probed on 2026-09-05 (HEAD, no redirects followed): 17 of the 19
 * answered 200, `dhan.am` answered 307 and `cto.madfam.io` answered 404.
 * `forgesight.quest` returned no status at all from the probing environment, so
 * it is recorded as unverified rather than down. The 404 and the unverified host
 * are registry facts to fix in the registry, not entries to drop here.
 */
import { getBannerProducts } from '@madfam/core/products';

export interface EcosystemPlatform {
  /** Short uppercase keyword shown before the colon, e.g. "BUDGETING & WEALTH". */
  keyword: string;
  /** Platform display name shown after the colon, e.g. "Dhanam". */
  name: string;
  /** Apex domain URL, e.g. "https://dhan.am". No trailing slash. */
  url: string;
}

/**
 * The ticker's default membership.
 *
 * A selected product with no `site.bannerKeyword` is dropped HERE rather than
 * shown with an invented keyword - and that drop is a hard failure of
 * `scripts/check-product-projection.mjs` (which selects over the same
 * projection and requires a keyword on every selected product) and of this
 * package's `platforms.spec.ts` (which asserts this list matches that
 * selection, one for one). A silently shorter ticker must not be able to render
 * cleanly.
 */
export const DEFAULT_ECOSYSTEM_PLATFORMS: readonly EcosystemPlatform[] = getBannerProducts()
  .filter((product) => Boolean(product.site.bannerKeyword) && Boolean(product.domain))
  .map((product) => ({
    keyword: product.site.bannerKeyword as string,
    name: product.name,
    url: `https://${product.domain as string}`,
  }));
