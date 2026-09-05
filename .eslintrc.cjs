// The rule set itself lives in `@madfam/eslint-config` (packages/eslint-config),
// so this repo eats its own baseline before asking a consumer to. Every package
// under `packages/` extends the same config; `scripts/check-shared-configs.mjs`
// fails Package Quality if one stops.
module.exports = {
  root: true,
  extends: ['@madfam/eslint-config'],
};
