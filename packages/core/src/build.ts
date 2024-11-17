import { mainPlugin } from '@electron-rsbuild/plugin-main';
import { preloadPlugin } from '@electron-rsbuild/plugin-preload';
import { rendererPlugin } from '@electron-rsbuild/plugin-renderer';
import { createRsbuild, logger } from '@rsbuild/core';
import { InlineConfig, resolveUserConfig } from './config';

/**
 * Bundles the electron app for production.
 */
export async function createBuild(inlineConfig: InlineConfig = {}): Promise<void> {
  process.env.NODE_ENV_ELECTRON_RSBUILD = 'production';
  const { userConfig } = await resolveUserConfig(inlineConfig, 'build', 'production');

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

      const isMainPlugin = rsbuild.isPluginExists('electron-rsbuild:main', { environment: 'main' });
      const isPreloadPlugin = rsbuild.isPluginExists('electron-rsbuild:preload', { environment: 'preload' });
      const isRendererPlugin = rsbuild.isPluginExists('electron-rsbuild:renderer', { environment: 'renderer' });

      !isMainPlugin && rsbuild.addPlugins([mainPlugin()], { environment: 'main' });
      !isPreloadPlugin && rsbuild.addPlugins([preloadPlugin()], { environment: 'preload' });
      !isRendererPlugin && rsbuild.addPlugins([rendererPlugin()], { environment: 'renderer' });

      await rsbuild.build();
    }
  }
}
