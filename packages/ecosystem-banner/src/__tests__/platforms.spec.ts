import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { selectBannerPlatforms } from '../../../../scripts/check-product-projection.mjs';
import { DEFAULT_ECOSYSTEM_PLATFORMS } from '../platforms';

/**
 * The banner's membership has no copy of its own any more: it is
 * `getBannerProducts()` from `@madfam/core/products`, mapped.
 *
 * This suite is the freshness guard that replaced the byte-compare of the
 * deleted `platforms.generated.ts`. It reads the ONE vendored projection and
 * applies the guard's independent implementation of the filter
 * (`selectBannerPlatforms`, over the raw JSON) as an oracle, then asserts the
 * TypeScript filter in `@madfam/core` selects exactly the same products in the
 * same order. Two implementations over one source; a divergence in either one
 * is a red test rather than a quietly different ticker.
 */
const projection = JSON.parse(
  // vitest runs each package with its own directory as the cwd.
  readFileSync(resolve(process.cwd(), '../core/src/products/projection.public.json'), 'utf8')
);

const expected = selectBannerPlatforms(projection);

describe('DEFAULT_ECOSYSTEM_PLATFORMS', () => {
  it('selects exactly the products the vendored projection selects, in registry order', () => {
    expect(DEFAULT_ECOSYSTEM_PLATFORMS.map((p) => p.name)).toEqual(
      expected.map((p: { display_name: string }) => p.display_name)
    );
  });

  it('links each product at its registry primary domain, never an infra host', () => {
    expect(DEFAULT_ECOSYSTEM_PLATFORMS.map((p) => p.url)).toEqual(
      expected.map((p: { domains: { primary: string } }) => `https://${p.domains.primary}`)
    );
    for (const [index, platform] of DEFAULT_ECOSYSTEM_PLATFORMS.entries()) {
      const infraHosts: string[] = expected[index].domains.infra_hosts ?? [];
      expect(infraHosts).not.toContain(new URL(platform.url).hostname);
    }
  });

  it('carries the registry keyword for every entry and invents none', () => {
    expect(DEFAULT_ECOSYSTEM_PLATFORMS.map((p) => p.keyword)).toEqual(
      expected.map((p: { site: { banner_keyword: string } }) => p.site.banner_keyword)
    );
  });

  it('renders no retired brand', () => {
    const retired = new Set(
      (projection.retired ?? []).map((entry: { display_name: string }) => entry.display_name)
    );
    for (const platform of DEFAULT_ECOSYSTEM_PLATFORMS) {
      expect(retired.has(platform.name)).toBe(false);
    }
  });
});
