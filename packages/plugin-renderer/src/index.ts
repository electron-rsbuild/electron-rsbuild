import {resolve} from 'node:path'
import type {EnvironmentConfig, RsbuildPlugin} from '@rsbuild/core'

export const defaultRendererConfig: EnvironmentConfig = {
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
}
/**
 * plugin-renderer for rsbuild
 * */
export const rendererPlugin = (userRendererConfig?: EnvironmentConfig): RsbuildPlugin => ({
  name: 'electron-rsbuild:renderer',
  pre: ['rsbuild:react'],
  setup(api) {
    api.modifyEnvironmentConfig((config, {mergeEnvironmentConfig}) => {
      const rendererConfig = Object.assign({}, defaultRendererConfig, userRendererConfig)
      return mergeEnvironmentConfig(config, rendererConfig)
    })
  },
})
