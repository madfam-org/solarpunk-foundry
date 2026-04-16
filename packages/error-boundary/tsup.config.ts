import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [
    'react',
    'react-dom',
    '@madfam/sentry',
  ],
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      '.tsx': 'tsx',
    };
  },
});
