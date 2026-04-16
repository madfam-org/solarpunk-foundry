import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    timing: 'src/timing.ts',
    queue: 'src/queue.ts',
    pagination: 'src/pagination.ts',
    retry: 'src/retry.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
});
