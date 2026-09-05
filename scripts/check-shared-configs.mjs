#!/usr/bin/env node
// Boundary checkpoint (2026-09-04, platform ops): public repo automation.
// Public-safe abstractions only; no node identity, credentials or cost data.
// Policy: docs/PUBLIC_REPO_BOUNDARY.md

/**
 * The foundry eats its own shared configs. This is the guard.
 *
 * WHY THIS EXISTS (2026-09-05, Wave 4.5): this repo publishes `@madfam/tsconfig`,
 * `@madfam/eslint-config` and `@madfam/prettier-config` for the estate to adopt,
 * and asking a consuming repo to adopt a baseline the publisher does not use is
 * how a baseline becomes advice. Measured here before this change: thirteen
 * packages carried thirteen hand-written tsconfigs across two `target`s and four
 * strictness sets, and every one of them relied on a single root `.eslintrc.cjs`
 * that no consumer could install.
 *
 * WHAT IT CHECKS (each with a read-proof, never a bare "ok"):
 *   tsconfig   every package extends `@madfam/tsconfig/*` and declares it
 *   eslint     every package has an `.eslintrc.cjs` extending
 *              `@madfam/eslint-config`, declares it, and the repo root does too
 *   prettier   the root points `prettier` at `@madfam/prettier-config`, and no
 *              second Prettier config file exists anywhere in the tree
 *   overrides  no package tsconfig re-states a value the shared config already
 *              gives it. A dead override is how a baseline stops being one: it
 *              looks adopted and behaves forked.
 *
 * WHAT IT CANNOT CHECK, said out loud: that the shared configs are *good*. It
 * checks that there is one of each and that everything uses it.
 *
 * The exemption list is REASONED and CANNOT ROT: an entry naming a package that
 * no longer exists, or one that has since gained the config it is exempt from,
 * is itself a failure.
 *
 * Exit codes:
 *   0  every package adopts the shared configs (or is exempt with a reason)
 *   1  findings
 *   2  UNDETERMINED - no workspace packages were found, so nothing was checked
 *      (decisions/2026-07-26-fail-closed-seam-doctrine.md)
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const TSCONFIG_PKG = '@madfam/tsconfig';
export const ESLINT_PKG = '@madfam/eslint-config';
export const PRETTIER_PKG = '@madfam/prettier-config';

/**
 * Reasoned exemptions: { "<package dir>": { "<what>": "<reason>" } }.
 * A reason is mandatory, and the entry dies with the thing it excuses.
 */
export const EXEMPT = {
  tsconfig: { tsconfig: 'it IS the shared tsconfig; extending itself is circular', eslint: 'JSON only - nothing to lint' },
  'eslint-config': {
    tsconfig: 'no TypeScript source; the package is one CommonJS module',
    eslint: 'it IS the shared ESLint config - it lints itself with --no-eslintrc rather than resolving itself through node_modules',
  },
  'prettier-config': {
    tsconfig: 'no TypeScript source; the package is one CommonJS module',
    eslint: 'one CommonJS module, linted with --no-eslintrc so a config package needs no config package',
  },
  ui: { tsconfig: 'retired tombstone (2026-09-05) - no source to compile', eslint: 'retired tombstone - no source to lint' },
};

/** A Prettier config anywhere but the root `prettier` field is a second opinion. */
const PRETTIER_FILES = [
  '.prettierrc', '.prettierrc.json', '.prettierrc.json5', '.prettierrc.yml', '.prettierrc.yaml',
  '.prettierrc.js', '.prettierrc.cjs', '.prettierrc.mjs', '.prettierrc.toml',
  'prettier.config.js', 'prettier.config.cjs', 'prettier.config.mjs',
];

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.next', '.turbo', 'coverage']);

/** Strips comments so a JSONC tsconfig parses. Strings are respected. */
export function parseJsonc(text) {
  let out = '';
  let inString = false;
  let inLine = false;
  let inBlock = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    const next = text[i + 1];
    if (inLine) {
      if (c === '\n') { inLine = false; out += c; }
      continue;
    }
    if (inBlock) {
      if (c === '*' && next === '/') { inBlock = false; i += 1; }
      continue;
    }
    if (inString) {
      out += c;
      if (c === '\\') { out += next ?? ''; i += 1; continue; }
      if (c === '"') inString = false;
      continue;
    }
    if (c === '"') { inString = true; out += c; continue; }
    if (c === '/' && next === '/') { inLine = true; i += 1; continue; }
    if (c === '/' && next === '*') { inBlock = true; i += 1; continue; }
    out += c;
  }
  return JSON.parse(out);
}

function readJson(path) {
  return parseJsonc(readFileSync(path, 'utf8'));
}

function packageDirs(root) {
  const parent = join(root, 'packages');
  if (!existsSync(parent)) return [];
  return readdirSync(parent)
    .filter((entry) => statSync(join(parent, entry)).isDirectory())
    .filter((entry) => existsSync(join(parent, entry, 'package.json')))
    .sort();
}

/** Resolves the shared config's compilerOptions through its `extends` chain. */
export function resolveSharedOptions(root, extendsSpec) {
  const relative = extendsSpec.replace(`${TSCONFIG_PKG}/`, '');
  let file = join(root, 'packages', 'tsconfig', relative);
  const options = {};
  const seen = new Set();
  while (file && existsSync(file) && !seen.has(file)) {
    seen.add(file);
    const config = readJson(file);
    for (const [k, v] of Object.entries(config.compilerOptions ?? {})) {
      if (!(k in options)) options[k] = v;
    }
    file = config.extends ? join(dirname(file), config.extends) : null;
  }
  return options;
}

function findPrettierFiles(dir, root, out) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      findPrettierFiles(full, root, out);
    } else if (PRETTIER_FILES.includes(entry)) {
      out.push(full.slice(root.length + 1));
    }
  }
  return out;
}

export function checkSharedConfigs(root, exempt = EXEMPT) {
  const findings = [];
  const dirs = packageDirs(root);
  if (dirs.length === 0) {
    return { undetermined: 'no workspace packages found under packages/' };
  }

  let tsconfigAdopted = 0;
  let eslintAdopted = 0;
  let deadOverrides = 0;

  for (const dir of dirs) {
    const pkgDir = join(root, 'packages', dir);
    const manifest = readJson(join(pkgDir, 'package.json'));
    const dev = { ...(manifest.devDependencies ?? {}), ...(manifest.dependencies ?? {}) };
    const excused = exempt[dir] ?? {};

    // ── tsconfig ─────────────────────────────────────────────────────────────
    const tsconfigPath = join(pkgDir, 'tsconfig.json');
    if (excused.tsconfig) {
      if (existsSync(tsconfigPath)) {
        findings.push(
          `\`packages/${dir}\` is exempt from ${TSCONFIG_PKG} ("${excused.tsconfig}") but now has a tsconfig.json. ` +
            'Adopt the shared config and drop the exemption.'
        );
      }
    } else if (!existsSync(tsconfigPath)) {
      findings.push(`\`packages/${dir}\` has no tsconfig.json and no reasoned exemption`);
    } else {
      const config = readJson(tsconfigPath);
      if (typeof config.extends !== 'string' || !config.extends.startsWith(`${TSCONFIG_PKG}/`)) {
        findings.push(
          `\`packages/${dir}/tsconfig.json\` does not extend ${TSCONFIG_PKG}/* (extends: ${JSON.stringify(config.extends)})`
        );
      } else {
        tsconfigAdopted += 1;
        if (!dev[TSCONFIG_PKG]) {
          findings.push(`\`packages/${dir}\` extends ${TSCONFIG_PKG} without declaring it as a dependency`);
        }
        // Dead overrides: a value the shared config already gives you.
        const shared = resolveSharedOptions(root, config.extends);
        for (const [key, value] of Object.entries(config.compilerOptions ?? {})) {
          if (key in shared && JSON.stringify(shared[key]) === JSON.stringify(value)) {
            deadOverrides += 1;
            findings.push(
              `\`packages/${dir}/tsconfig.json\` re-states \`${key}\`, which ${config.extends} already sets to the ` +
                'same value. Delete it: an override that changes nothing makes the package look forked.'
            );
          }
        }
      }
    }

    // ── eslint ───────────────────────────────────────────────────────────────
    const eslintPath = join(pkgDir, '.eslintrc.cjs');
    if (excused.eslint) {
      if (existsSync(eslintPath)) {
        findings.push(
          `\`packages/${dir}\` is exempt from ${ESLINT_PKG} ("${excused.eslint}") but now has an .eslintrc.cjs. ` +
            'Adopt the shared config and drop the exemption.'
        );
      }
    } else if (!existsSync(eslintPath)) {
      findings.push(`\`packages/${dir}\` has no .eslintrc.cjs and no reasoned exemption`);
    } else if (!readFileSync(eslintPath, 'utf8').includes(ESLINT_PKG)) {
      findings.push(`\`packages/${dir}/.eslintrc.cjs\` does not extend ${ESLINT_PKG}`);
    } else {
      eslintAdopted += 1;
      if (!dev[ESLINT_PKG]) {
        findings.push(`\`packages/${dir}\` extends ${ESLINT_PKG} without declaring it as a dependency`);
      }
    }
  }

  // ── stale exemptions ───────────────────────────────────────────────────────
  for (const [dir, reasons] of Object.entries(exempt)) {
    if (!dirs.includes(dir)) {
      findings.push(`exemption for \`packages/${dir}\` names a package that does not exist`);
      continue;
    }
    for (const [what, reason] of Object.entries(reasons)) {
      if (!reason || !String(reason).trim()) {
        findings.push(`exemption \`packages/${dir}\`.${what} carries no reason`);
      }
    }
  }

  // ── the root ───────────────────────────────────────────────────────────────
  const rootEslint = join(root, '.eslintrc.cjs');
  if (!existsSync(rootEslint)) {
    findings.push('the repo root has no .eslintrc.cjs');
  } else if (!readFileSync(rootEslint, 'utf8').includes(ESLINT_PKG)) {
    findings.push(`the root .eslintrc.cjs does not extend ${ESLINT_PKG} - the repo publishes a baseline it does not use`);
  }

  const rootManifest = readJson(join(root, 'package.json'));
  if (rootManifest.prettier !== PRETTIER_PKG) {
    findings.push(`the root package.json does not point \`prettier\` at ${PRETTIER_PKG} (found: ${JSON.stringify(rootManifest.prettier)})`);
  }
  for (const script of ['format', 'format:check']) {
    if (!rootManifest.scripts?.[script]) {
      findings.push(`the root package.json has no \`${script}\` script - the consumer CI contract requires one`);
    }
  }

  const strayPrettier = findPrettierFiles(root, root, []);
  for (const file of strayPrettier) {
    findings.push(`${file} is a second Prettier config - the baseline is ${PRETTIER_PKG}, referenced from package.json`);
  }

  return {
    findings,
    packagesScanned: dirs.length,
    tsconfigAdopted,
    eslintAdopted,
    exemptions: Object.keys(exempt).length,
    deadOverrides,
    prettierConfigsFound: strayPrettier.length,
  };
}

export function main(argv = []) {
  const here = dirname(fileURLToPath(import.meta.url));
  const positional = argv.filter((a) => !a.startsWith('--'));
  const root = resolve(positional[0] ?? join(here, '..'));
  const result = checkSharedConfigs(root);

  if (result.undetermined) {
    console.error(`[shared-configs] UNDETERMINED - ${result.undetermined}`);
    console.log('Shared config adoption check UNDETERMINED - packages_scanned=0');
    return 2;
  }

  for (const finding of result.findings) console.error(`[shared-configs] ${finding}`);

  // READ-PROOF. "I read nothing" and "I read everything and found nothing wrong"
  // must not print the same line.
  console.log(
    `Shared config adoption: packages_scanned=${result.packagesScanned} ` +
      `tsconfig_adopted=${result.tsconfigAdopted} eslint_adopted=${result.eslintAdopted} ` +
      `exemptions=${result.exemptions} dead_overrides=${result.deadOverrides} ` +
      `stray_prettier_configs=${result.prettierConfigsFound} findings=${result.findings.length}`
  );
  return result.findings.length === 0 ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main(process.argv.slice(2)));
}
