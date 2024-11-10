/**
 * test file
 * */

import { resolve } from 'path'
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import pkg from './package.json'

export default defineConfig({
  dev: {
    // dev 写入磁盘~
    // 也可以匹配 hot-update 文件
    // writeToDisk: true
  },
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
  server: {
    port: 3000
  },
  output: {
    distPath: {
      root: 'out/renderer'
    },
    assetPrefix: 'auto',
    minify: false
  }
})
