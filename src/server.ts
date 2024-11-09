import type { ChildProcess } from 'node:child_process'

import { createLogger } from 'rslog'
import {
  RsbuildConfig,
  createRsbuild as rsbuildCreateServer,
  createRsbuild as viteBuild,
  mergeRsbuildConfig
} from '@rsbuild/core'

import colors from 'picocolors'
import { type InlineConfig, resolveConfig } from './config'
import { resolveHostname } from './utils'
import { startElectron } from './electron'

export async function createServer(
  inlineConfig: InlineConfig = {},
  options: { rendererOnly?: boolean }
): Promise<void> {
  process.env.NODE_ENV_ELECTRON_VITE = 'development'

  const config = await resolveConfig(inlineConfig, 'serve', 'development')

  if (config.config) {

    const logger = createLogger({ level: inlineConfig.logLevel })

    let server = undefined
    let ps: ChildProcess | undefined

    const errorHook = (e: { message: string | number | null | undefined; }): void => {
      logger.error(`${colors.bgRed(colors.white(' ERROR '))} ${colors.red(e.message)}`)
    }

    const mainRsbuildConfig = config.config?.main
    if (mainRsbuildConfig && !options.rendererOnly) {
      const watchHook = (): void => {
        logger.info(colors.green(`\nrebuild the electron main process successfully`))

        if (ps) {
          logger.info(colors.cyan(`\n  waiting for electron to exit...`))

          ps.removeAllListeners()
          ps.kill()

          ps = startElectron(inlineConfig.root)

          logger.info(colors.green(`\nrestart electron app...`))
        }
      }

      await doBuild(mainRsbuildConfig, watchHook, errorHook)

      logger.info(colors.green(`\nbuild the electron main process successfully`))
    }

    const preloadRsbuildConfig = config.config?.preload
    if (preloadRsbuildConfig && !options.rendererOnly) {
      logger.info(colors.gray(`\n-----\n`))

      const watchHook = (): void => {
        logger.info(colors.green(`\nrebuild the electron preload files successfully`))

        if (server) {
          logger.info(colors.cyan(`\n  trigger renderer reload`))

          // TODO
          server.connectWebSocket.send({ type: 'full-reload' })
        }
      }

      await doBuild(preloadRsbuildConfig, watchHook, errorHook)

      logger.info(colors.green(`\nbuild the electron preload files successfully`))
    }

    if (options.rendererOnly) {
      logger.warn(
        `\n${colors.yellow(colors.bold('warn'))}:${colors.yellow(
          ' you have skipped the main process and preload scripts building'
        )}`
      )
    }

    const rendererRsbuildConfig = config.config?.renderer
    if (rendererRsbuildConfig) {
      logger.info(colors.gray(`\n-----\n`))

      server = await rsbuildCreateServer(rendererRsbuildConfig)

      if (!server.httpServer) {
        throw new Error('HTTP server not available')
      }

      await server.listen()

      const conf = server.config.server

      const protocol = conf.https ? 'https:' : 'http:'
      const host = resolveHostname(conf.host)
      const port = conf.port
      process.env.ELECTRON_RENDERER_URL = `${protocol}//${host}:${port}`

      const slogger = server.config.logger

      slogger.info(colors.green(`dev server running for the electron renderer process at:\n`), {
        clear: !slogger.hasWarned && !options.rendererOnly
      })

      server.printUrls()
    }

    console.log('ps1')
    ps = startElectron(inlineConfig.root)
    console.log('ps2')

    logger.info(colors.green(`\nstart electron app...\n`))
  }
}

type UserConfig = RsbuildConfig & { configFile?: string | false };

/**
 * 执行构建
 * */
async function doBuild(config: UserConfig, watchHook: () => void, errorHook: (e: Error) => void): Promise<void> {
  return new Promise((resolve) => {
    if (config.server?.publicDir?.watch) {
      let firstBundle = true
      const closeBundle = (): void => {
        if (firstBundle) {
          firstBundle = false
          resolve()
        } else {
          watchHook()
        }
      }

      config = mergeRsbuildConfig(config, {
        plugins: [
          {
            name: 'rsbuild:electron-watcher',
            closeBundle
          }
        ]
      })
    }

    viteBuild(config)
      .then(() => {
        if (!config.server?.publicDir?.watch) {
          resolve()
        }
      })
      .catch((e) => errorHook(e))
  })
}
