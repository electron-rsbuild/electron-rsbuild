import type { ChildProcess } from 'node:child_process';

import { createLogger } from 'rslog';
import { RsbuildConfig, createRsbuild, createRsbuild as viteBuild, mergeRsbuildConfig, RsbuildInstance } from '@rsbuild/core';

import colors from 'picocolors';
import { type InlineConfig, resolveUserConfig } from './config';
import { resolveHostname } from './utils';
import { startElectron } from './electron';

/**
 * create renderer server
 * */
export async function createServer(inlineConfig: InlineConfig = {}, options: { rendererOnly?: boolean; entry?: string }): Promise<void> {
  process.env.NODE_ENV_ELECTRON_RSBUILD = 'development';

  const { userConfig, configFile } = await resolveUserConfig(inlineConfig, 'serve', 'development');

  if (userConfig?.environments) {
    const { environments } = userConfig;
    const logger = createLogger({ level: inlineConfig.logLevel });

    let server: any = undefined;
    let ps: ChildProcess | undefined;
    const errorHook = (e: { message: string | number | null | undefined }): void => {
      logger.error(`${colors.bgRed(colors.white(' ERROR '))} ${colors.red(e.message)}`);
    };

    if (!options.entry) {
      // process.env.ELECTRON_ENTRY = "http://localhost:3000/"
      // process.env.ELECTRON_ENTRY = userConfig.root + '/out/renderer/index.html';
    }

    // main 构建
    const mainRsbuildConfig = environments?.main;
    if (mainRsbuildConfig) {
      const mainRsbuild = await createRsbuild({
        cwd: userConfig.root,
        rsbuildConfig: {
          environments: {
            main: { ...mainRsbuildConfig },
          },
        },
      });

      await mainRsbuild.build();
      if (ps) {
        logger.info(colors.green(`rebuild the electron main process successfully`));
        ps.removeAllListeners();
        ps.kill();
        ps = startElectron(userConfig.root);
        logger.info(colors.green(`restart electron app...`));
      }
    }

    // preload 构建
    const preloadRsbuildConfig = environments?.preload;
    if (preloadRsbuildConfig) {
      const preloadRsbuild = await createRsbuild({
        cwd: userConfig.root,
        rsbuildConfig: {
          environments: {
            preload: { ...preloadRsbuildConfig },
          },
        },
      });
      await preloadRsbuild.build();
    }

    const rendererRsbuildConfig = environments?.renderer;
    if (rendererRsbuildConfig) {
      const renderRsbuild = await createRsbuild({
        cwd: userConfig.root,
        rsbuildConfig: {
          environments: {
            renderer: {
              ...rendererRsbuildConfig,
            },
          },
        },
      });

      logger.success(colors.green(`electron-rsbuild dev server running for the electron renderer process at:\n`));

      server = await renderRsbuild.startDevServer();
      const { urls } = server;
      if (!server.server) {
        throw new Error('HTTP server not available');
      }
      const renderDevURL = urls[0];
      const hostURL = resolveHostname(renderDevURL);
      process.env.ELECTRON_RENDERER_URL = `${hostURL}`;
    }
    ps = startElectron(userConfig.root);
    logger.info(colors.green(`start electron app...\n`));
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
    // TODO watch~~
  });
}
