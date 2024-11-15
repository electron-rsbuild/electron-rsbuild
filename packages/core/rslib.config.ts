import { defineConfig } from '@rslib/core';
import { mainPlugin } from '@electron-rsbuild/plugin-main';
import { preloadPlugin } from '@electron-rsbuild/plugin-preload';
import { rendererPlugin } from '@electron-rsbuild/plugin-renderer';

const shared = {
  dts: {
    bundle: false,
  },
};

export default defineConfig({
  source: {
    entry: {
      index: ['./src/index.ts'],
      cli: ['.//src/cli.ts'],
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
