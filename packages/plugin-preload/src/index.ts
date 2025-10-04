import type {EnvironmentConfig, RsbuildPlugin} from '@rsbuild/core'

export const preloadConfig: EnvironmentConfig = {
  source: {
    entry: {
      index: './src/preload/index.ts',
    },
    alias: {
      '@preload': 'src/preload',
    },
  },
  output: {
    target: 'node',
    distPath: {
      root: 'out/preload',
      js: '.',
    },
    minify: false,
  },
  tools: {
    rspack: {
      target: 'electron-preload',
    },
  },
}
/**
 * plugin-preload for rsbuild
 * */
export const preloadPlugin = (): RsbuildPlugin => ({
  name: 'electron-rsbuild:preload',
  setup(api) {
    api.modifyEnvironmentConfig((config, {mergeEnvironmentConfig}) => {
      return mergeEnvironmentConfig(config, preloadConfig)
    })
  },
})
