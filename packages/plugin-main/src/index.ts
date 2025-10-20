import type {EnvironmentConfig, RsbuildPlugin} from '@rsbuild/core'

export const defaultMainConfig: EnvironmentConfig = {
  source: {
    entry: {
      index: './src/main/index.ts',
    },
    alias: {
      '@main': 'src/main',
    },
    // TODO
    //  exclude: [path.resolve(__dirname, 'src/module-a'), /src\/module-b/],
    // 不编译不打包： exclude: [path.resolve(__dirname, 'src/module-a'), /src\/module-b/],
  },
  output: {
    target: 'node',
    distPath: {
      root: 'out/main',
      js: '.',
    },
    minify: false,
  },
  tools: {
    rspack: {
      target: 'electron-main',
      module: {
        rules: [
          {
            test: /\.ts$/,
            exclude: [/node_modules/],
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                },
              },
            },
            type: 'javascript/auto',
          },
        ],
      },
    },
  },
}

/**
 * plugin-main for rsbuild
 * */
export const mainPlugin = (userMainConfig?: EnvironmentConfig={}): RsbuildPlugin => ({
  name: 'electron-rsbuild:main',
  setup(api) {
    api.modifyEnvironmentConfig((config, {mergeEnvironmentConfig}) => {
      // TODO 更改 dev
      const mainConfig = Object.assign({}, defaultMainConfig, userMainConfig)
      return mergeEnvironmentConfig(config, mainConfig)
    })
  },
})
