# @madfam/prettier-config

> **Boundary checkpoint (2026-09-05, platform ops):** public package surface.
> Formatting policy only; no private topology, node identities, credentials or
> cost data.
> Policy: [`docs/PUBLIC_REPO_BOUNDARY.md`](../../docs/PUBLIC_REPO_BOUNDARY.md)

The shared Prettier baseline for the MADFAM ecosystem.

## Install

```bash
pnpm add -D @madfam/prettier-config prettier
```

## Use

```jsonc
// package.json
{ "prettier": "@madfam/prettier-config" }
```

## What it carries

`printWidth: 100`, two-space indent, semicolons, single quotes, `as-needed`
quoted properties, ES5 trailing commas, always-parenthesised arrow parameters
and `endOfLine: 'lf'`. Overrides: no trailing commas in JSON (Prettier's JSON
printer would emit invalid JSON otherwise), `proseWrap: preserve` for Markdown
so a reflow never rewrites a document's line structure.

**These values were measured, not chosen.** They are the prevailing style of the
code already in the tree. A different baseline would have reformatted every file
in the estate in the same PR that introduced the config, and a diff that large is
not reviewable. `test/config.test.mjs` pins the three that would do it
(`singleQuote`, `semi`, `printWidth`) so changing one is a deliberate migration
rather than a config edit.

`endOfLine: 'lf'` is pinned for a second reason: without it a CRLF checkout fails
the format gate on Windows for reasons that have nothing to do with the change
under review.

## Adoption in this repo

The root `package.json` points `prettier` at this package, `pnpm format:check`
is the gate, and `scripts/check-shared-configs.mjs` fails Package Quality if the
pointer is removed or a second Prettier config appears.

## Publishing

Publishable-shaped (`private: false`, versioned, `files`, `publishConfig`) and
**not published** as of 2026-09-05.

## License

MIT © Innovaciones MADFAM SAS de CV
