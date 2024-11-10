import { resolve } from 'path'
import { defineConfig } from 'electron-rsbuild'
import { pluginReact } from '@rsbuild/plugin-react'

export default defineConfig({
  // TODO see electron.rsbuild.config.ts
  main: {
  },
  // TODO see electron.preload.config.ts
  preload: {
  },
  // TODO see rsbuild.config.ts
  renderer: {
    source: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      },
      // TODO 后期改为默认
      entry: {
        index: './src/renderer/src/main.tsx'
      }
    },
    plugins: [pluginReact()]
  }
  // TODO 可以用 environments 来配置环境变量
})
