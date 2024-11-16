import { type RsbuildConfig, EnvironmentConfig, RsbuildPlugin } from '@rsbuild/core';
import { resolve } from 'node:path';

export const rendererConfig: EnvironmentConfig = {
  html: {
    title: 'Electron-Rsbuild App',
  },
  source: {
    entry: {
      index: './src/renderer/src/main.tsx',
    },
    alias: {
      '@renderer': resolve('src/renderer/src'),
    },
  },
  output: {
    target: 'web',
    assetPrefix: 'auto',
    distPath: {
      root: 'out/renderer',
    },
    minify: false,
  },
};
/**
 * plugin-renderer for rsbuild
 * */
export const rendererPlugin = (): RsbuildPlugin => ({
  name: 'electron-rsbuild:renderer',
  pre: ['rsbuild:react'],
  setup(api) {
    api.modifyEnvironmentConfig((config, { mergeEnvironmentConfig }) => {
      return mergeEnvironmentConfig(config, rendererConfig);
    });
  },
});
