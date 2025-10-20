import type {EnvironmentConfig, RsbuildPlugin} from '@rsbuild/core'

export const defaultPreloadConfig: EnvironmentConfig = {
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
export const preloadPlugin = (userPreloadConfig?: EnvironmentConfig={}): RsbuildPlugin => ({
  name: 'electron-rsbuild:preload',
  setup(api) {
    api.modifyEnvironmentConfig((config, {mergeEnvironmentConfig}) => {
      const preloadConfig = Object.assign({}, defaultPreloadConfig, userPreloadConfig)
      return mergeEnvironmentConfig(config, preloadConfig)
    })
  },
})
