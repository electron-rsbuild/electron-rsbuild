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

/**
 * create renderer server
 * */
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
      const rsbuild = await rsbuildCreateServer({
        cwd: process.cwd(),
        rsbuildConfig: {
          ...rendererRsbuildConfig
        }
      })

      // TODO
      server = await rsbuild.startDevServer()
      // server = await rsbuild.createDevServer()

      console.log('启动服务=>', server)

      const { port, urls, server: confServer } = server
      if (!server.server) {
        throw new Error('HTTP server not available')
      }

      // await server.listen()
      const renderDevURL = urls[0]

      const hostURL = resolveHostname(renderDevURL)
      process.env.ELECTRON_RENDERER_URL = `${hostURL}}`
      // TODO 绿色提示 dev server running for the electron renderer process，可由外部
      logger.info(colors.green(`dev server running for the electron renderer process at:\n`))


      // 由于 rsbuild 没有暴露相关方法，而且判断的过于复杂，此处就没必要增加复杂度了
      let urlStr = ''
      for (let i = 0; i < server.urls.length; i++) {
        const url = server.urls[i]
        urlStr += `\n url-${i + 1} ➜ ${url}`
      }
      if(urlStr){
        logger.info(colors.green(urlStr))
      }
    }

    console.log('ps1')
    // TODO 记录下进度 2024年11月10日01:13:09
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
