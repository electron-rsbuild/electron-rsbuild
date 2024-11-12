import { resolve } from 'path'
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import pkg from './package.json'
import { mainPlugin } from '@electron-rsbuild/plugin-main'

export default defineConfig({
  root: resolve(__dirname, '.'),
  environments: {
    // preload
    preload: {
      source: {
        entry: {
          index: './src/preload/index.ts'
        },
        alias: {
          '@reload': resolve('src/preload')
        }
      },
      output: {
        target: 'node',
        distPath: {
          root: 'out/preload'
        },
        // TODO 禁用压缩
        minify: false
      },
      plugins: [mainPlugin({ root: 'haha' })],
      tools: {
        rspack: {
          target: 'electron-preload'
        }
      }
    },
    // main
    main: {
      source: {
        entry: {
          index: './src/main/index.ts'
        },
        alias: {
          '@main': resolve('src/main')
        }
        // TODO
        //  exclude: [path.resolve(__dirname, 'src/module-a'), /src\/module-b/],
        // 不编译不打包： exclude: [path.resolve(__dirname, 'src/module-a'), /src\/module-b/],
      },
      output: {
        target: 'node',
        distPath: {
          root: 'out/main'
        },
        // TODO 禁用压缩
        minify: false
      },
      plugins: [mainPlugin({ root: 'haha' })],
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
                      syntax: 'typescript'
                    }
                  }
                },
                type: 'javascript/auto'
              }
            ]
          }
        }
      }
    },
    // TODO see rsbuild.config.ts
    renderer: {
      html: {
        title: pkg.name || 'Electron-Rsbuild App'
      },
      source: {
        entry: {
          index: './src/renderer/src/main.tsx'
        },
        // TODO 后期改为默认
        alias: {
          '@renderer': resolve('src/renderer/src')
        }
      },
      plugins: [pluginReact()],
      output: {
        target: 'web',
        assetPrefix: 'auto',
        distPath: {
          root: 'out/renderer'
        },
        // TODO 禁用压缩
        minify: false
      }
    }
  }

  // TODO 可以用 environments 来配置环境变量
})
