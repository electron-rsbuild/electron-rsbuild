/**
 * test file
 * build main 产物
 * */

import { defineConfig } from '@rsbuild/core'
import { mainPlugin } from '@electron-rsbuild/plugin-main'
import path from 'node:path';
import { pluginReact } from '@rsbuild/plugin-react'
import pkg from './package.json'

export default defineConfig({
  // 利用 rsbuild-main 生成环境配置能力
  environments: {
    web: {
      html: {
        title: pkg.name || 'Electron-Rsbuild App'
      },
      source: {
        entry: {
          index: './src/renderer/src/main.tsx'
        },
        // TODO 后期改为默认
        alias: {
          '@renderer': path.resolve('src/renderer/src')
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
    },
    // preload
    preload: {
      source: {
        entry: {
          index: './src/preload/index.ts'
        },
        alias: {
          '@reload': path.resolve('src/preload')
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
          '@main': path.resolve('src/main')
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
    }
  }
})
