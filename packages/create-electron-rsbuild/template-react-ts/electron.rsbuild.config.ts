import {resolve} from 'node:path'
import {defineConfig} from '@rsbuild/core'
import {pluginReact} from '@rsbuild/plugin-react'

const template = resolve(__dirname, 'src', 'renderer', 'index.html')

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
      html: {
        template,
      },
    },
  },
})
