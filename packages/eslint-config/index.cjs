// Boundary checkpoint (2026-09-05, platform ops): public package source.
// Lint policy only; no private topology, credentials or cost data.
// Policy: docs/PUBLIC_REPO_BOUNDARY.md

/**
 * @madfam/eslint-config - the shared ESLint baseline for the MADFAM ecosystem.
 *
 * This is the `eslintrc` shape, not flat config: the foundry and the consuming
 * repos are on ESLint 8. When a repo moves to ESLint 9, add a `flat.js` export
 * here rather than forking the rule set - the rules are the shared thing, the
 * config format is not.
 *
 * Consumers:
 *   // .eslintrc.cjs
 *   module.exports = { root: true, extends: ['@madfam/eslint-config'] };
 */
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['dist/', 'node_modules/', '*.config.*'],
  rules: {
    // `_`-prefixed is the ecosystem's "deliberately unused" convention; the
    // recommended set flags it, which trains people to delete the marker.
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
    ],
  },
};
