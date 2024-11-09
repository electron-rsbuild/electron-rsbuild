import { resolve } from 'path'
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  main: {
    // plugins: [externalizeDepsPlugin()]
  },
  preload: {
    // plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [pluginReact()]
  }
})
