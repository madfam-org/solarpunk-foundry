// Boundary checkpoint (2026-09-05, platform ops): public package source.
// Formatting policy only; no private topology, credentials or cost data.
// Policy: docs/PUBLIC_REPO_BOUNDARY.md

/**
 * @madfam/prettier-config - the shared Prettier baseline for the MADFAM ecosystem.
 *
 * The values are the prevailing style of the existing code, measured rather than
 * chosen: single quotes, semicolons, a 100-column line and ES5 trailing commas.
 * Picking a different baseline would have reformatted every file in the estate
 * in the same PR that introduced the config, and a diff that large is not
 * reviewable.
 *
 * Consumers:
 *   // package.json
 *   "prettier": "@madfam/prettier-config"
 */
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  overrides: [
    {
      // JSON has no single-quote form, and Prettier's JSON printer ignores
      // `singleQuote` anyway - stated here so nobody re-derives it.
      files: ['*.json', '*.jsonc'],
      options: { trailingComma: 'none' },
    },
    {
      files: ['*.md'],
      options: { proseWrap: 'preserve' },
    },
  ],
};
