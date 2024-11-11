import { defineConfig } from '@rslib/core';

const shared = {
  dts: {
    bundle: false,
  },
};

export default defineConfig({
  source: {
    entry: {
      index: ['./src/index.ts'],
    },
  },
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      ...shared,
    },
    {
      format: 'cjs',
      syntax: 'es2021',
    },
  ],
  output: { target: 'node' },
});
