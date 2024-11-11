import type { ChildProcess } from 'node:child_process';

import { createLogger } from 'rslog';
import { RsbuildConfig, createRsbuild, createRsbuild as viteBuild, mergeRsbuildConfig } from '@rsbuild/core';

import colors from 'picocolors';
import { type InlineConfig, resolveUserConfig } from './config';
import { resolveHostname } from './utils';
import { startElectron } from './electron';

/**
 * create renderer server
 * */
export async function createServer(inlineConfig: InlineConfig = {}, options: { rendererOnly?: boolean }): Promise<void> {
  process.env.NODE_ENV_ELECTRON_RSBUILD = 'development';

  const { userConfig, configFile } = await resolveUserConfig(inlineConfig, 'serve', 'development');

  if (userConfig) {
    const logger = createLogger({ level: inlineConfig.logLevel });

    let server: any = undefined;
    let ps: ChildProcess | undefined;

    const errorHook = (e: { message: string | number | null | undefined }): void => {
      logger.error(`${colors.bgRed(colors.white(' ERROR '))} ${colors.red(e.message)}`);
    };

    // TODO main 构建~
    const mainRsbuildConfig = userConfig?.main;
    

    // TODO preload 构建
    const preloadRsbuildConfig = userConfig?.preload;
    if (options.rendererOnly) {
      logger.warn(`\n${colors.yellow(colors.bold('warn'))}:${colors.yellow(' you have skipped the main process and preload scripts building')}`);
    }

    const rendererRsbuildConfig = userConfig?.renderer;
    if (rendererRsbuildConfig) {
      const rsbuild = await createRsbuild({
        cwd: process.cwd(),
        rsbuildConfig: {
          ...rendererRsbuildConfig,
        },
      });

      logger.info(colors.green(`electron-rsbuild dev server running for the electron renderer process at:\n`));
      server = await rsbuild.startDevServer();
      const { port, urls, server: confServer } = server;
      if (!server.server) {
        throw new Error('HTTP server not available');
      }
      // await server.listen()

      const renderDevURL = urls[0];
      const hostURL = resolveHostname(renderDevURL);
      process.env.ELECTRON_RENDERER_URL = `${hostURL}}`;
      // TODO 绿色提示 dev server running for the electron renderer process，可由外部
    }

    console.log('ps1');
    // TODO 记录下进度 2024年11月10日01:13:09
    ps = startElectron(inlineConfig.root);
    console.log('ps2');

    logger.info(colors.green(`\nstart electron app...\n`));
  }
}

type UserConfig = RsbuildConfig & { configFile?: string | false };

/**
 * 执行构建
 * */
async function doBuild(config: UserConfig, watchHook: () => void, errorHook: (e: Error) => void): Promise<void> {
  return new Promise((resolve) => {
    const publicDir = config.server?.publicDir;
    console.log('server 执行构建 publicDir', publicDir);
    // if (publicDir && publicDir?.watch) {
    //   let firstBundle = true
    //   const closeBundle = (): void => {
    //     if (firstBundle) {
    //       firstBundle = false
    //       resolve()
    //     } else {
    //       watchHook()
    //     }
    //   }

    //   config = mergeRsbuildConfig(config, {
    //     plugins: [
    //       {
    //         name: 'rsbuild:electron-watcher',
    //         closeBundle
    //       }
    //     ]
    //   })
    // }

    // viteBuild(config)
    //   .then(() => {
    //     if (!config.server?.publicDir?.watch) {
    //       resolve()
    //     }
    //   })
    //   .catch((e) => errorHook(e))
  });
}
