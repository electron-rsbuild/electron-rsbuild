import type { ChildProcess } from 'node:child_process';
import { logger, createRsbuild } from '@rsbuild/core';
import colors from 'picocolors';
import { mainPlugin } from '@electron-rsbuild/plugin-main';
import { preloadPlugin } from '@electron-rsbuild/plugin-preload';
import { rendererPlugin } from '@electron-rsbuild/plugin-renderer';
import { type InlineConfig, resolveUserConfig } from './config';
import { resolveHostname } from './utils';
import { startElectron } from './electron';

/**
 * create renderer server
 * */
export async function createServer(inlineConfig: InlineConfig = {}, options: { rendererOnly?: boolean; entry?: string }): Promise<void> {
  process.env.NODE_ENV_ELECTRON_RSBUILD = 'development';

  const { userConfig } = await resolveUserConfig(inlineConfig, 'serve', 'development');

  if (userConfig?.environments) {
    const { environments } = userConfig;

    let server: any = undefined;
    let ps: ChildProcess | undefined;

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
      mainRsbuild.addPlugins([mainPlugin]);

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
      preloadRsbuild.addPlugins([preloadPlugin])
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
      renderRsbuild.addPlugins([rendererPlugin])

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
