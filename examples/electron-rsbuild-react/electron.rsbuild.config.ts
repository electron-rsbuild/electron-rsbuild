import { resolve } from 'path'
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { mainPlugin } from '@electron-rsbuild/plugin-main'
import { preloadPlugin } from '@electron-rsbuild/plugin-preload'
import { rendererPlugin } from '@electron-rsbuild/plugin-renderer'

export default defineConfig({
  root: resolve(__dirname, '.'),
  environments: {
    // main
    main: {
      plugins: [mainPlugin()]
    },
    // preload
    preload: {
      plugins: [preloadPlugin()]
    },

    // renderer
    renderer: {
      // plugins: [pluginReact()]
      plugins: [pluginReact(), rendererPlugin()]
    }
  }
})
