# @madfam/eslint-config

> **Boundary checkpoint (2026-09-05, platform ops):** public package surface.
> Lint policy only; no private topology, node identities, credentials or cost
> data.
> Policy: [`docs/PUBLIC_REPO_BOUNDARY.md`](../../docs/PUBLIC_REPO_BOUNDARY.md)

The shared ESLint baseline for the MADFAM ecosystem.

## Install

```bash
pnpm add -D @madfam/eslint-config eslint
```

## Use

```js
// .eslintrc.cjs
module.exports = {
  root: true,
  extends: ['@madfam/eslint-config'],
};
```

The config is the **`eslintrc`** shape, because the foundry and the consuming
repos are on ESLint 8. When a repo moves to ESLint 9, add a flat-config export
here rather than forking the rule set: the rules are the shared thing, the
config format is not.

## What it carries

- `@typescript-eslint/parser` with `ecmaVersion: 2022`, ES modules and JSX.
- `eslint:recommended` + `plugin:@typescript-eslint/recommended`.
- `browser`, `es2022` and `node` environments.
- `no-unused-vars` relaxed for `_`-prefixed bindings — the ecosystem's
  "deliberately unused" convention. The recommended set flags those, which
  trains people to delete the marker instead of keeping it.
- `dist/`, `node_modules/` and `*.config.*` ignored.

It deliberately does **not** set `root`. That is the consumer's decision; a
shareable config that sets it hijacks every repo that extends it.
`test/config.test.mjs` asserts that, and that every parser and plugin the config
names is a declared dependency of this package — a rule set that only resolves
on the machine it was written on is the failure mode a config package has.

## Adoption in this repo

The root `.eslintrc.cjs` and every package under `packages/` extend this config,
and `scripts/check-shared-configs.mjs` fails Package Quality if one stops.

## Publishing

Publishable-shaped (`private: false`, versioned, `files`, `publishConfig`) and
**not published** as of 2026-09-05.

## License

MIT © Innovaciones MADFAM SAS de CV
