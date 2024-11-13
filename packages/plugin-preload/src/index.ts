import { RsbuildConfig, RsbuildPlugin } from '@rsbuild/core';
import { version } from 'punycode';

/**
 * plugin-preload for rsbuild
 * */
export function preloadPlugin(): RsbuildPlugin[] {
  return [
    {
      name: 'electron-rsbuild:preload',
      setup(api) {
        api.modifyRsbuildConfig((config: RsbuildConfig) => {
          if (config.environments?.preload) {
            const { preload } = config.environments;
            const { output } = preload || {};

            let outPreloadConfig = { ...preload };
            outPreloadConfig = {
              ...preload,
              source: {
                ...preload.source,
                entry: {
                  ...preload.source?.entry,
                  index: preload.source?.entry?.index || './src/preload/index.ts',
                },
              },
              output: {
                ...output,
                target: 'node',
                distPath: {
                  ...output?.distPath,
                  root: output?.distPath?.root || 'out/preload',
                },
              },
              tools: {
                ...preload.tools,
                rspack: {
                  target: 'electron-preload',
                },
              },
            };
            config.environments.preload = { ...outPreloadConfig };
          }
        });
      },
    },
  ];
}
