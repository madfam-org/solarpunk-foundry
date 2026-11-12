import { describe, expect, it } from 'vitest';
import { matchScreen } from '../index';

const templates = [
  '/',
  '/records',
  '/records/new',
  '/records/[id]',
  '/records/[id]/sessions',
  '/docs/[...slug]',
  '/help/[[...topic]]',
  '/help',
  '/[org]/settings',
];

describe('matchScreen', () => {
  it.each([
    ['/', '/'],
    ['/records', '/records'],
    ['/records/new', '/records/new'],
    ['/records/123', '/records/[id]'],
    ['/records/123/sessions', '/records/[id]/sessions'],
    ['/docs/a', '/docs/[...slug]'],
    ['/docs/a/b/c', '/docs/[...slug]'],
    ['/help', '/help'],
    ['/help/billing/cards', '/help/[[...topic]]'],
    ['/acme/settings', '/[org]/settings'],
  ])('%s → %s', (path, expected) => {
    expect(matchScreen(templates, path)).toBe(expected);
  });

  it('prefers static over dynamic', () => {
    expect(matchScreen(['/records/[id]', '/records/new'], '/records/new')).toBe('/records/new');
  });

  it('prefers a dynamic segment over a catch-all', () => {
    expect(matchScreen(['/docs/[...slug]', '/docs/[id]'], '/docs/x')).toBe('/docs/[id]');
  });

  it('lets an optional catch-all match zero segments when nothing more specific exists', () => {
    expect(matchScreen(['/guide/[[...p]]'], '/guide')).toBe('/guide/[[...p]]');
  });

  it('does not let a catch-all match zero segments', () => {
    expect(matchScreen(['/docs/[...slug]'], '/docs')).toBeNull();
  });

  it('strips query, hash and trailing slash', () => {
    expect(matchScreen(templates, '/records/123/?tab=notes#top')).toBe('/records/[id]');
    expect(matchScreen(templates, '/records/#x')).toBe('/records');
    expect(matchScreen(templates, '/?q=1')).toBe('/');
  });

  it('returns null when nothing matches', () => {
    expect(matchScreen(templates, '/nowhere/at/all')).toBeNull();
    expect(matchScreen(templates, 'records/1')).toBeNull();
    expect(matchScreen([], '/')).toBeNull();
  });
});
