import { createRsbuild } from '@rsbuild/core'
import { InlineConfig, resolveConfig } from './config'

/**
 * Bundles the electron app for production.
 */
export async function build(inlineConfig: InlineConfig = {}): Promise<void> {
  process.env.NODE_ENV_ELECTRON_VITE = 'production'
  const config = await resolveConfig(inlineConfig, 'build', 'production')
  if (config.config) {
    const mainViteConfig = config.config?.main
    if (mainViteConfig) {
      if (mainViteConfig.server?.publicDir?.watch) {
        mainViteConfig.server.publicDir.watch = null
      }
      await createRsbuild(mainViteConfig)
    }
    const preloadViteConfig = config.config?.preload
    if (preloadViteConfig) {
      if (preloadViteConfig.server?.publicDir?.watch) {
        preloadViteConfig.server.publicDir.watch = null
      }
      await createRsbuild(preloadViteConfig)
    }
    const rendererViteConfig = config.config?.renderer
    if (rendererViteConfig) {
      if (rendererViteConfig.server?.publicDir?.watch) {
        rendererViteConfig.server.publicDir.watch = null
      }
      await createRsbuild(rendererViteConfig)
    }
  }
}


/**
 * 
 * @TODO ？？？
 * - build.watch 
 * rsbuild
 * - server.publicDir.watch
 * */