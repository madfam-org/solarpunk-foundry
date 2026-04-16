import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/common.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  minify: false,
  external: ['zod'],
});
