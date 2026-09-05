# @madfam/tsconfig

> **Boundary checkpoint (2026-09-05, platform ops):** public package surface.
> Compiler settings only; no private topology, node identities, credentials or
> cost data.
> Policy: [`docs/PUBLIC_REPO_BOUNDARY.md`](../../docs/PUBLIC_REPO_BOUNDARY.md)

One TypeScript baseline for the MADFAM ecosystem, extended per project shape.

## Why this is a package and not a template

`templates/` exists for things a repo should **copy and own** (see
[`templates/README.md`](../../templates/README.md)). A compiler baseline is the
opposite: when a copied `tsconfig.json` drifts, nothing reports it, and the
estate ends up with as many strictness levels as it has repositories. This repo
measured that on 2026-09-05 — its own thirteen packages carried thirteen
hand-written configs across two `target`s and four different strictness sets.
So this one is a dependency, and `templates/tsconfig/*.json` are now three-line
stubs that extend it.

## Install

```bash
pnpm add -D @madfam/tsconfig
```

## Use

```jsonc
// tsconfig.json — a publishable library
{ "extends": "@madfam/tsconfig/library.json" }
```

| Config               | For                                                 | Emits           |
| -------------------- | --------------------------------------------------- | --------------- |
| `base.json`          | the shared baseline every other config extends      | declarations    |
| `library.json`       | a publishable TypeScript library (`src/` → `dist/`) | yes             |
| `react-library.json` | a library that ships React components               | yes             |
| `next.json`          | a Next.js app                                       | no (Next emits) |
| `node.json`          | a Node.js service or CLI (NodeNext)                 | yes             |
| `vite.json`          | a Vite/React app                                    | no (Vite emits) |

Override in the consumer, where a reviewer sees it:

```jsonc
{
  "extends": "@madfam/tsconfig/react-library.json",
  "compilerOptions": { "target": "ES2020" },
  "exclude": ["node_modules", "dist", "src/__tests__"],
}
```

## The rules that hold this together

- **`strict` is the baseline and is never relaxed here.** Relax it in a consumer,
  deliberately, where the diff is reviewed. `test/configs.test.mjs` fails if any
  config in this package turns `strict` or `skipLibCheck` off.
- **Every config but `base.json` extends another config in this package.** A
  config that restates the baseline instead of extending it is the drift this
  package exists to end; the test asserts the extends chain.
- **Every `exports` entry names a file that exists**, and every config file is
  exported — also asserted, because a half-deleted config is the failure mode a
  config package actually has.
- **No build step.** It is JSON.

## Adoption in this repo

Every package under `packages/` extends one of these, and
`scripts/check-shared-configs.mjs` fails Package Quality if one stops.
`packages/ui` is exempt: it is a retired tombstone with no source to compile.

## Publishing

Publishable-shaped (`private: false`, versioned, `files`, `publishConfig`) and
**not published** as of 2026-09-05. Publishing is a separate, deliberate act via
`.github/workflows/publish-package.yml`.

## License

MIT © Innovaciones MADFAM SAS de CV
