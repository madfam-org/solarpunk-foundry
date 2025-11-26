import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/brand.ts',
    'src/locales.ts',
    'src/currencies.ts',
    'src/events.ts',
    'src/products.ts',
    'src/legal.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false, // Keep readable for debugging
});
