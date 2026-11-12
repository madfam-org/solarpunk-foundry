/**
 * Maps a concrete pathname to the most specific route template.
 *
 * Template segments: a static segment matches itself; `[id]` matches exactly one
 * segment; `[...rest]` one or more; `[[...rest]]` zero or more. When several
 * templates match, the one whose segments are more specific from left to right
 * wins (static over `[id]` over `[...x]` over `[[...x]]`); an optional catch-all
 * that matched nothing loses to a template without it.
 */

const Kind = {
  Static: 0,
  Dynamic: 1,
  CatchAll: 2,
  OptionalCatchAll: 3,
} as const;
type Kind = (typeof Kind)[keyof typeof Kind];

interface Segment {
  kind: Kind;
  value: string;
}

interface Parsed {
  template: string;
  segments: Segment[];
}

const OPTIONAL_CATCH_ALL = /^\[\[\.\.\.[A-Za-z0-9_]+\]\]$/;
const CATCH_ALL = /^\[\.\.\.[A-Za-z0-9_]+\]$/;
const DYNAMIC = /^\[[A-Za-z0-9_]+\]$/;

const parsedCache = new WeakMap<readonly string[], Parsed[]>();

function parseTemplate(template: string): Parsed {
  const segments = template
    .split('/')
    .filter((s) => s.length > 0)
    .map((s): Segment => {
      if (OPTIONAL_CATCH_ALL.test(s)) return { kind: Kind.OptionalCatchAll, value: s };
      if (CATCH_ALL.test(s)) return { kind: Kind.CatchAll, value: s };
      if (DYNAMIC.test(s)) return { kind: Kind.Dynamic, value: s };
      return { kind: Kind.Static, value: s };
    });
  return { template, segments };
}

function parsedTemplates(templates: readonly string[]): Parsed[] {
  let parsed = parsedCache.get(templates);
  if (!parsed) {
    parsed = templates.filter((t) => typeof t === 'string' && t.startsWith('/')).map(parseTemplate);
    parsedCache.set(templates, parsed);
  }
  return parsed;
}

/** Strips query, hash and trailing slashes; returns the path segments, or null. */
export function pathSegments(pathname: string): string[] | null {
  if (typeof pathname !== 'string') return null;
  let path = pathname;
  const cut = path.search(/[?#]/);
  if (cut >= 0) path = path.slice(0, cut);
  if (path === '') path = '/';
  if (!path.startsWith('/')) return null;
  return path.split('/').filter((s) => s.length > 0);
}

/** Lexicographic comparison of specificity scores: negative when `a` is more specific. */
function compareScores(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
}

/** Returns the specificity score of the best way `segments` can match `parts`, or null. */
function matchSegments(segments: readonly Segment[], parts: readonly string[], si: number, pi: number): number[] | null {
  if (si === segments.length) return pi === parts.length ? [] : null;
  const seg = segments[si];
  const remaining = parts.length - pi;

  switch (seg.kind) {
    case Kind.Static: {
      if (remaining < 1 || parts[pi] !== seg.value) return null;
      const rest = matchSegments(segments, parts, si + 1, pi + 1);
      return rest ? [Kind.Static, ...rest] : null;
    }
    case Kind.Dynamic: {
      if (remaining < 1) return null;
      const rest = matchSegments(segments, parts, si + 1, pi + 1);
      return rest ? [Kind.Dynamic, ...rest] : null;
    }
    case Kind.CatchAll:
    case Kind.OptionalCatchAll: {
      const min = seg.kind === Kind.CatchAll ? 1 : 0;
      let best: number[] | null = null;
      for (let take = remaining; take >= min; take -= 1) {
        const rest = matchSegments(segments, parts, si + 1, pi + take);
        if (!rest) continue;
        const score = [seg.kind, ...rest];
        if (!best || compareScores(score, best) < 0) best = score;
      }
      return best;
    }
    default:
      return null;
  }
}

/**
 * The most specific template in `templates` that matches `pathname`, or null.
 * `pathname` may carry a query string, a hash or a trailing slash.
 */
export function matchScreen(templates: readonly string[], pathname: string): string | null {
  const parts = pathSegments(pathname);
  if (!parts) return null;
  let best: { template: string; score: number[] } | null = null;
  for (const parsed of parsedTemplates(templates)) {
    const score = matchSegments(parsed.segments, parts, 0, 0);
    if (!score) continue;
    if (!best || compareScores(score, best.score) < 0) best = { template: parsed.template, score };
  }
  return best ? best.template : null;
}
