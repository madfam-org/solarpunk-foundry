import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Same reason as tsconfig's `paths`: the suite runs before `pnpm -r build`, so
// `@madfam/core` is resolved to core's source rather than to a `dist` that does
// not exist yet. Tests therefore exercise the same filter CI typechecks.
const coreSrc = fileURLToPath(new URL('../core/src', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@madfam\/core\/(.*)$/, replacement: `${coreSrc}/$1.ts` },
      { find: /^@madfam\/core$/, replacement: `${coreSrc}/index.ts` },
    ],
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
