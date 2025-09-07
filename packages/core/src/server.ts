import type {ChildProcess} from 'node:child_process'
import {mainPlugin} from '@electron-rsbuild/plugin-main'
import {preloadPlugin} from '@electron-rsbuild/plugin-preload'
import {rendererPlugin} from '@electron-rsbuild/plugin-renderer'
import {createRsbuild, logger} from '@rsbuild/core'
import colors from 'picocolors'
import {type InlineConfig, resolveUserConfig} from './config'
import {startElectron} from './electron'

/**
 * create renderer server
 * TODO: createServer used to accept options but they weren't used. Need to clarify.
 * */
export async function createServer(inlineConfig: InlineConfig): Promise<void> {
  process.env.NODE_ENV_ELECTRON_RSBUILD = 'development'

  const {userConfig} = await resolveUserConfig(inlineConfig, 'serve', 'development')

  if (userConfig?.environments) {
    const {environments} = userConfig

    let server: any = undefined
    let ps: ChildProcess | undefined

    // build main
    const mainRsbuildConfig = environments?.main
    if (mainRsbuildConfig) {
      const mainRsbuild = await createRsbuild({
        cwd: userConfig.root,
        rsbuildConfig: {
          environments: {
            main: mainRsbuildConfig,
          },
        },
      })
      const isMainPlugin = mainRsbuild.isPluginExists('electron-rsbuild:main', {environment: 'main'})
      !isMainPlugin && mainRsbuild.addPlugins([mainPlugin()], {environment: 'main'})

      await mainRsbuild.build()
      if (ps) {
        logger.info(colors.green('rebuild the electron main process successfully'))
        ps.removeAllListeners()
        ps.kill()
        ps = startElectron(userConfig.root)
        logger.info(colors.green('restart electron app...'))
      }
    }

    // // build preload
    const preloadRsbuildConfig = environments?.preload
    if (preloadRsbuildConfig) {
      const preloadRsbuild = await createRsbuild({
        cwd: userConfig.root,
        rsbuildConfig: {
          environments: {
            preload: preloadRsbuildConfig,
          },
        },
      })

      const isPreloadPlugin = preloadRsbuild.isPluginExists('electron-rsbuild:main', {environment: 'preload'})
      !isPreloadPlugin && preloadRsbuild.addPlugins([preloadPlugin()], {environment: 'preload'})
      await preloadRsbuild.build()
    }

    const rendererRsbuildConfig = environments?.renderer
    // render dev server
    if (rendererRsbuildConfig) {
      const renderRsbuild = await createRsbuild({
        cwd: userConfig.root,
        rsbuildConfig: {
          environments: {
            renderer: rendererRsbuildConfig,
          },
        },
      })

      logger.success(colors.green('electron-rsbuild dev server running for the electron renderer process at:\n'))

      const isRendererPlugin = renderRsbuild.isPluginExists('electron-rsbuild:renderer', {environment: 'renderer'})
      if (!isRendererPlugin) {
        renderRsbuild.addPlugins([rendererPlugin()], {environment: 'renderer'})
      }

      renderRsbuild.onBeforeStartDevServer(() => {
        const isReactPlugin = renderRsbuild.isPluginExists('rsbuild:react', {environment: 'renderer'})
        if (!isReactPlugin) {
          throw new Error('You will need to manually install the @rsbuild/react plugin see: https://rsbuild.dev/zh/plugins/list/plugin-react')
        }
      })

      server = await renderRsbuild.startDevServer()
      const {urls} = server
      if (!server.server) {
        throw new Error('HTTP server not available')
      }
      process.env.ELECTRON_RENDERER_URL = `${urls[0]}`
    }
    ps = startElectron(userConfig.root)
    logger.info(colors.green('start electron app...\n'))
  }
}
