import { resolve } from 'path'
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import pkg from './package.json'

export default defineConfig({
  root: resolve(__dirname, '.'),
  environments: {
    // TODO see electron.rsbuild.config.ts
    main: {},
    // TODO see electron.preload.config.ts
    preload: {},
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
