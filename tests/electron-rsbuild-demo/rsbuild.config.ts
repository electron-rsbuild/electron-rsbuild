/**
 * test file
 * */

import { resolve } from 'path'
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

export default defineConfig({
  source: {
    entry: {
      index: './src/renderer/src/main.tsx'
    },
    // TODO 后期改为默认
    alias: {
      '@renderer': resolve('src/renderer/src')
    }
  },
  plugins: [pluginReact()]
})
