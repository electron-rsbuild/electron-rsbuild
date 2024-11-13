import colors from 'picocolors';
import { logger, createRsbuild } from '@rsbuild/core';
import { InlineConfig, resolveUserConfig } from './config';

/**
 * Bundles the electron app for production.
 */
export async function createBuild(inlineConfig: InlineConfig = {}): Promise<void> {
  process.env.NODE_ENV_ELECTRON_RSBUILD = 'production';
  const { userConfig, configFile } = await resolveUserConfig(inlineConfig, 'build', 'production');

  if (userConfig?.environments) {
    const { main, preload, renderer } = userConfig.environments || {};
    if (!main || !preload || !renderer) {
      logger.error(`main,preload,renderer is required in environments`);
      return;
    }

    const { environments } = userConfig;
    if (userConfig?.environments.main) {
      const mainRsbuildConfig = environments?.main;
      const preloadRsbuildConfig = environments?.preload;
      const rendererRsbuildConfig = environments?.renderer;

      const rsbuild = await createRsbuild({
        cwd: userConfig.root,
        rsbuildConfig: {
          environments: {
            main: { ...mainRsbuildConfig },
            preload: { ...preloadRsbuildConfig },
            renderer: { ...rendererRsbuildConfig },
          },
        },
      });
      await rsbuild.build();
    }
  }
}
