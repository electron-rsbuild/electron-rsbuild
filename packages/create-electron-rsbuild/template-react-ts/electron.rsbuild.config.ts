import {resolve} from 'path'
import {defineConfig} from '@rsbuild/core'
import {pluginReact} from '@rsbuild/plugin-react'

export default defineConfig({
  root: resolve(__dirname, '.'),
  environments: {
    // main
    main: {},
    // preload
    preload: {},
    // renderer
    renderer: {
      plugins: [pluginReact()],
    },
  },
})
