# CI/CD Templates

> **Boundary checkpoint (2026-09-05, platform ops):** public CI contract.
> Commands, exit codes and public-safe abstractions only; runner names, node
> identities, credentials and cost data stay in `internal-devops`.
> Policy: [`docs/PUBLIC_REPO_BOUNDARY.md`](../../docs/PUBLIC_REPO_BOUNDARY.md)

Pre-configured GitHub Actions workflows for MADFAM ecosystem projects.

## Consumer CI contract

What a repo consuming the foundry's shared packages must run in CI, what each
command must print, and what its exit code means. This is a contract, not a
suggestion: a repo that adopts `@madfam/core`, `@madfam/tsconfig`,
`@madfam/eslint-config` or `@madfam/prettier-config` and runs none of these has
adopted the packages and none of the guarantees.

### The exit-code contract

Every guard in this contract uses the same three codes, and the third is the one
that matters:

| Code | Meaning                                                                                                                               | What CI must do |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `0`  | the check ran and found nothing                                                                                                       | pass            |
| `1`  | the check ran and found something                                                                                                     | **fail**        |
| `2`  | **UNDETERMINED** — the check could not run (a file it needs is missing, the tree is not a git checkout, a pattern file is unreadable) | **fail**        |

**Exit 2 is never a pass.** "I could not look" and "I looked and it was clean"
must not produce the same CI result; a guard that degrades to green when its
input is missing protects nothing. Do not wrap any of these in `|| true`, and do
not add `continue-on-error`. Source:
`internal-devops/decisions/2026-07-26-fail-closed-seam-doctrine.md`.

For the same reason, every guard prints a **read-proof** — a line naming how much
it examined (`files_scanned=`, `packages_scanned=`, `products_scanned=`,
`considered=`). A green run whose read-proof says `0` examined nothing. Read the
number, not the colour.

### The seven checks

Run them in this order: the cheap, specific guards first, so a failure names its
own cause instead of surfacing later as a type error.

```bash
# 1. Typecheck — every package, no emit
pnpm -r typecheck

# 2. Lint — the shared ESLint baseline
pnpm -r lint

# 3. Test
pnpm -r test

# 4. Format — check only; never write in CI
pnpm format:check

# 5. Boundary checkpoint — public-facing surfaces carry a checkpoint note
scripts/boundary-checkpoint-check.sh

# 6. Action pins — every `uses:` is a 40-hex SHA
scripts/check-action-pins.sh

# 7. Product projection freshness — the product registry is in step
node scripts/check-product-projection.mjs
```

| #   | Check                | Command                                     | Proves                                                                                          | Fails when                                                                                       |
| --- | -------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | Typecheck            | `pnpm -r typecheck`                         | every package compiles under the shared `@madfam/tsconfig` baseline                             | a type error, or a package that stopped extending the baseline                                   |
| 2   | Lint                 | `pnpm -r lint`                              | the shared `@madfam/eslint-config` rules hold                                                   | a lint error, or a warning (`--max-warnings=0`)                                                  |
| 3   | Test                 | `pnpm -r test`                              | the suites run                                                                                  | a failing test                                                                                   |
| 4   | Format               | `pnpm format:check`                         | the tree matches `@madfam/prettier-config`                                                      | a file Prettier would rewrite                                                                    |
| 5   | Boundary checkpoint  | `scripts/boundary-checkpoint-check.sh`      | every changed public-facing surface carries a boundary note                                     | a changed surface with no checkpoint marker; exit 2 outside a git tree                           |
| 6   | Action pins          | `scripts/check-action-pins.sh`              | no workflow runs an action from a moving ref                                                    | a `uses:` on `@main`, `@master` or a tag                                                         |
| 7   | Projection freshness | `node scripts/check-product-projection.mjs` | the vendored product projection was not hand-edited and everything generated from it is in step | a hash mismatch, a stale generated module, a retired brand that would render, an undeclared host |

**`pnpm -r` skips silently.** `pnpm -r lint` and `pnpm -r test` skip any package
that does not define the script **and still exit 0** — measured on this repo:
`pnpm -r lint` reported "13 of 14 workspace projects" while 2 packages actually
ran. Steps 2 and 3 are therefore not gates on their own. Run the coverage guard
before them:

```bash
node scripts/check-package-scripts.mjs   # every package defines lint and test
```

### Guards a consumer needs a copy of

Checks 5, 6 and 7 are scripts, not published packages. Copy
`scripts/boundary-checkpoint-check.sh`, `scripts/check-action-pins.sh`,
`scripts/check-product-projection.mjs` and `scripts/check-package-scripts.mjs`
into the consuming repo (each has a `node --test` or shell self-test next to it —
copy that too, and run it in CI **before** the guard it tests: a guard whose own
test does not run is an assertion nobody checked).

`boundary-checkpoint-check.sh` carries a repo-specific surface list in
`is_boundary_surface()`. Edit that list for the consuming repo; do not edit the
change-set logic.

### The projection freshness check in a consuming repo

A repo that consumes `@madfam/core`'s product registry does **not** vendor the
projection. It pins the stamp instead:

```typescript
import { PRODUCT_PROJECTION } from '@madfam/core/products';

expect(PRODUCT_PROJECTION.schema).toBe('madfam-product-projection/v1');
expect(PRODUCT_PROJECTION.registryVersion).toBe(EXPECTED_REGISTRY_VERSION);
expect(PRODUCT_PROJECTION.sourceSha256).toBe(EXPECTED_PROJECTION_SHA);
```

Bumping those constants is the review surface: a product fact changed upstream,
someone read the diff, and the routes and copy were checked against it. Do not
assert on a product count or a slug list — that is a second registry in test
form. Full statement: [`packages/core/README.md`](../../packages/core/README.md)
§ "Downstream contract".

### Secrets, and what must never be in a CI log

None of these checks needs a secret. Two rules travel with them:

- A guard that scans for private patterns prints `file:line` only, **never the
  matched text** — CI logs on a public repo are public.
- Secrets reach production through the operator's secret-intake path, never a
  workflow file, a PR body or a CI log.

### Workflow shape

```yaml
- run: pnpm install --frozen-lockfile
- run: node --test scripts/check-product-projection.test.mjs # guard self-test first
- run: node scripts/check-product-projection.mjs
- run: pnpm -r typecheck
- run: node scripts/check-package-scripts.mjs # before the recursive steps
- run: pnpm -r lint
- run: pnpm -r test
- run: pnpm format:check
- run: pnpm -r build
```

Pin every `uses:` to a 40-hex SHA with a trailing comment naming the ref and the
date it was pinned — check 6 exists because a moving ref is the same trust
decision as running someone else's code with your secrets. See the pinning note
below.

## Available Templates

### `lint-workflow.yml` - Documentation Linting

Enforces documentation quality across your repository:

- **Env Var Audit**: Ensures all `.env.example` variables are documented in README
- **Dead Link Check**: Verifies all HTTP(S) links return 200 OK
- **Brand Police**: Enforces inclusive language and brand-safe terminology

#### Usage

1. Copy `lint-workflow.yml` to `.github/workflows/doc-lint.yml` in your repo
2. Commit and push
3. DocGuard will run on every PR that modifies documentation

```bash
# Quick setup
cp templates/ci/lint-workflow.yml .github/workflows/doc-lint.yml
```

Or use the direct reference in your workflow:

```yaml
- uses: madfam-org/solarpunk-foundry/.github/actions/doc-guard@05f164e7d3d0a701632d5970f01c01f56c40e583 # solarpunk-foundry main, 2026-09-04
```

> **Pin by SHA.** `@main` gives every pusher to this repository's default branch
> execution inside _your_ CI, with _your_ secrets — `npm-madfam-auth` is handed
> `NPM_MADFAM_TOKEN`. Tags move too, so `@v1` is not a pin either. Use a 40-hex
> commit SHA and keep the trailing comment: it is what shows a reader how stale
> the pin is. Enable Dependabot's `github-actions` ecosystem and it will bump
> both the SHA and the comment.

### `npm-madfam-auth` — private registry CI auth

Use from any `madfam-org` repo (public action — no org Actions access config needed):

```yaml
- uses: madfam-org/solarpunk-foundry/.github/actions/npm-madfam-auth@05f164e7d3d0a701632d5970f01c01f56c40e583 # solarpunk-foundry main, 2026-09-04
  with:
    token: ${{ secrets.NPM_MADFAM_TOKEN }}
    require-publish-capable: 'true' # optional publish dry-run smoke
```

> **Pin by SHA.** `@main` gives every pusher to this repository's default branch
> execution inside _your_ CI, with _your_ secrets — `npm-madfam-auth` is handed
> `NPM_MADFAM_TOKEN`. Tags move too, so `@v1` is not a pin either. Use a 40-hex
> commit SHA and keep the trailing comment: it is what shows a reader how stale
> the pin is. Enable Dependabot's `github-actions` ecosystem and it will bump
> both the SHA and the comment.

Requires a repo-level `.npmrc` with `@scope:registry=https://npm.madfam.io` mappings (see janua or dhanam `.npmrc`).

#### Configuration Options

| Input               | Default  | Description                        |
| ------------------- | -------- | ---------------------------------- |
| `doc-path`          | `./docs` | Path to documentation directory    |
| `strict`            | `false`  | Fail on warnings (not just errors) |
| `check-env-vars`    | `true`   | Audit environment variables        |
| `check-links`       | `true`   | Verify markdown links              |
| `check-terminology` | `true`   | Enforce brand-safe terms           |
| `banned-terms-file` | `''`     | Custom banned terms file (JSON)    |

#### Custom Banned Terms

Create a JSON file with additional banned terms:

```json
{
  "legacy term": "preferred term",
  "old name": "new name"
}
```

Then reference it in your workflow:

```yaml
- uses: madfam-org/solarpunk-foundry/.github/actions/doc-guard@05f164e7d3d0a701632d5970f01c01f56c40e583 # solarpunk-foundry main, 2026-09-04
  with:
    banned-terms-file: '.github/banned-terms.json'
```

> **Pin by SHA.** `@main` gives every pusher to this repository's default branch
> execution inside _your_ CI, with _your_ secrets — `npm-madfam-auth` is handed
> `NPM_MADFAM_TOKEN`. Tags move too, so `@v1` is not a pin either. Use a 40-hex
> commit SHA and keep the trailing comment: it is what shows a reader how stale
> the pin is. Enable Dependabot's `github-actions` ecosystem and it will bump
> both the SHA and the comment.

#### Default Banned Terms

DocGuard enforces these terms by default:

**Inclusive Language:**
| Banned | Replacement |
|--------|-------------|
| master/slave | primary/replica |
| master branch | main branch |
| whitelist | allowlist |
| blacklist | blocklist |
| sanity check | validation check |
| dummy | placeholder |

**Brand Protection:**
| Banned | Replacement |
|--------|-------------|
| auth0 | identity provider (or Janua) |
| vercel | deployment platform (or Enclii) |
| railway | PaaS (or Enclii) |
| heroku | PaaS (or Enclii) |

#### Example Output

```
============================================================
DocGuard - Documentation Quality Enforcement
============================================================
Doc path: ./docs
Strict mode: false

Checking environment variable documentation...
Checking terminology compliance...
Checking link validity (this may take a moment)...

============================================================
RESULTS
============================================================

2 WARNINGS:
  docs/example.md:15 - Banned term 'whitelist' found
    Suggestion: Replace with: allowlist
  .env.example:0 - Environment variable 'SECRET_KEY' not documented in README
    Suggestion: Add documentation for SECRET_KEY in README.md

All checks passed!
```

## Adding New Templates

When adding new CI templates:

1. Create the template in `templates/ci/`
2. Add documentation to this README
3. Test the template in a sample repository
4. Update the main Foundry README if needed

## Related Documentation

- [DocGuard Action Source](../../.github/actions/doc-guard/)
- [Federated architecture](../../docs/architecture/FEDERATED_ARCHITECTURE_README.md) — this link previously pointed at a `TRINITY.md` that has never existed in this repository
- [Port Allocation Registry](../../docs/PORT_ALLOCATION.md)
