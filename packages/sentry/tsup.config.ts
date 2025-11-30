import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    node: 'src/node.ts',
    react: 'src/react.tsx',
    utils: 'src/utils.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [
    '@sentry/node',
    '@sentry/react',
    '@sentry/nextjs',
    'react',
    'react-dom',
  ],
});
