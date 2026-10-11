import {
  ECOSYSTEM_UTM_MEDIUM,
  OWN_SITE_REL,
  THIRD_PARTY_REL,
  ecosystemLink,
  isOwnHost,
  isPublicHost,
  normalizeHost,
} from '../links';
import { MADFAM_OWNED_DOMAINS } from '../platforms';

const OWNED = ['madfam.io', 'dhan.am', 'forgesight.app', 'kalya.app'];

describe('normalizeHost', () => {
  it('lower-cases and drops a leading www. and a trailing dot', () => {
    expect(normalizeHost('WWW.Dhan.AM.')).toBe('dhan.am');
  });
});

describe('isOwnHost', () => {
  it('accepts an owned domain and its subdomains', () => {
    expect(isOwnHost('dhan.am', OWNED)).toBe(true);
    expect(isOwnHost('app.dhan.am', OWNED)).toBe(true);
    expect(isOwnHost('mes.madfam.io', OWNED)).toBe(true);
    expect(isOwnHost('www.forgesight.app', OWNED)).toBe(true);
  });

  it('rejects look-alike and unrelated hosts', () => {
    expect(isOwnHost('evildhan.am', OWNED)).toBe(false);
    expect(isOwnHost('dhan.am.example.com', OWNED)).toBe(false);
    expect(isOwnHost('github.com', OWNED)).toBe(false);
    expect(isOwnHost('', OWNED)).toBe(false);
  });
});

describe('isPublicHost', () => {
  it('accepts real hostnames only', () => {
    expect(isPublicHost('karafiel.mx')).toBe(true);
    expect(isPublicHost('app.selva.town')).toBe(true);
    expect(isPublicHost('localhost')).toBe(false);
    expect(isPublicHost('127.0.0.1')).toBe(false);
    expect(isPublicHost('[::1]')).toBe(false);
    expect(isPublicHost('site.localhost')).toBe(false);
    expect(isPublicHost('preview.test')).toBe(false);
    expect(isPublicHost('')).toBe(false);
  });
});

describe('ecosystemLink', () => {
  it('tags an own-site link with origin, medium and surface, and keeps the referrer', () => {
    const link = ecosystemLink('https://dhan.am/pricing?product=dhanam_pro', {
      surface: 'ladder',
      originHost: 'www.madfam.io',
      ownedDomains: OWNED,
    });
    const url = new URL(link.href);
    expect(link.rel).toBe(OWN_SITE_REL);
    expect(link.rel).toBe('noopener');
    expect(url.searchParams.get('product')).toBe('dhanam_pro');
    expect(url.searchParams.get('utm_source')).toBe('madfam.io');
    expect(url.searchParams.get('utm_medium')).toBe(ECOSYSTEM_UTM_MEDIUM);
    expect(url.searchParams.get('utm_campaign')).toBe('ladder');
  });

  it('uses the surface verbatim as utm_campaign', () => {
    for (const surface of ['banner', 'ladder', 'footer', 'cta'] as const) {
      const link = ecosystemLink('https://kalya.app/madfam', {
        surface,
        originHost: 'karafiel.mx',
        ownedDomains: OWNED,
      });
      expect(new URL(link.href).searchParams.get('utm_campaign')).toBe(surface);
    }
  });

  it('leaves a third-party link untagged with noreferrer', () => {
    const link = ecosystemLink('https://github.com/madfam-org', {
      surface: 'footer',
      originHost: 'madfam.io',
      ownedDomains: OWNED,
    });
    expect(link).toEqual({ href: 'https://github.com/madfam-org', rel: THIRD_PARTY_REL });
  });

  it('adds no UTM on the same host, from a non-public origin or with no origin', () => {
    for (const originHost of [
      'dhan.am',
      'www.dhan.am',
      'localhost',
      '127.0.0.1',
      '',
      undefined,
      null,
    ]) {
      const link = ecosystemLink('https://dhan.am', {
        surface: 'banner',
        originHost,
        ownedDomains: OWNED,
      });
      expect(link).toEqual({ href: 'https://dhan.am', rel: OWN_SITE_REL });
    }
  });

  it('never overwrites a utm_source the URL already carries', () => {
    const href = 'https://dhan.am/?utm_source=newsletter';
    const link = ecosystemLink(href, {
      surface: 'cta',
      originHost: 'madfam.io',
      ownedDomains: OWNED,
    });
    expect(link).toEqual({ href, rel: OWN_SITE_REL });
  });

  it('treats unparseable and non-http URLs as third-party, unchanged', () => {
    for (const href of ['not a url', 'mailto:hola@example.com', '/relative/path']) {
      expect(
        ecosystemLink(href, { surface: 'cta', originHost: 'madfam.io', ownedDomains: OWNED })
      ).toEqual({ href, rel: THIRD_PARTY_REL });
    }
  });
});

describe('MADFAM_OWNED_DOMAINS', () => {
  it('covers the company apex and every ticker destination', () => {
    expect(MADFAM_OWNED_DOMAINS).toContain('madfam.io');
    expect(isOwnHost('forgesight.app', MADFAM_OWNED_DOMAINS)).toBe(true);
    expect(isOwnHost('kalya.app', MADFAM_OWNED_DOMAINS)).toBe(true);
    expect(isOwnHost('dhan.am', MADFAM_OWNED_DOMAINS)).toBe(true);
  });

  it('does not list the retired forgesight.quest', () => {
    expect(isOwnHost('forgesight.quest', MADFAM_OWNED_DOMAINS)).toBe(false);
  });
});
