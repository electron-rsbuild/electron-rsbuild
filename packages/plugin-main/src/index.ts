import { RsbuildConfig, RsbuildPlugin } from '@rsbuild/core';

/**
 * plugin-main for rsbuild
 * */
export function mainPlugin(): RsbuildPlugin[] {
  return [
    {
      name: 'electron-rsbuild:main',
      setup(api) {
        api.modifyRsbuildConfig((config: RsbuildConfig) => {
          if (config.environments?.main) {
            const { main } = config.environments;
            const { output } = main || {};

            let outMainConfig = { ...main };
            outMainConfig = {
              ...main,
              source: {
                ...main.source,
                entry: {
                  ...main.source?.entry,
                  index: main.source?.entry?.index || './src/main/index.ts',
                },
              },
              output: {
                ...output,
                target: 'node',
                distPath: {
                  ...output?.distPath,
                  root: output?.distPath?.root || 'out/main',
                },
              },
              tools: {
                ...main.tools,
                rspack: {
                  target: 'electron-main',
                  module: {
                    rules: [
                      {
                        test: /\.ts$/,
                        exclude: [/node_modules/],
                        loader: 'builtin:swc-loader',
                        options: {
                          jsc: {
                            parser: {
                              syntax: 'typescript',
                            },
                          },
                        },
                        type: 'javascript/auto',
                      },
                    ],
                  },
                },
              },
            };
            config.environments.main = { ...outMainConfig };
          }
        });
      },
    },
  ];
}
