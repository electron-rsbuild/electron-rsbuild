import type { Plugin } from '@rsbuild/core'

export default function importMetaPlugin(): Plugin {
  return {
    name: 'rsbuild:import-meta',
    apply: 'build',
    enforce: 'pre',
    resolveImportMeta(property, { format }): string | null {
      if (property === 'url' && format === 'cjs') {
        return `require("url").pathToFileURL(__filename).href`
      }
      if (property === 'filename' && format === 'cjs') {
        return `__filename`
      }
      if (property === 'dirname' && format === 'cjs') {
        return `__dirname`
      }
      return null
    }
  }
}
