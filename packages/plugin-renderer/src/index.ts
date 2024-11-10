import path from 'node:path';
import fs from 'node:fs';
import { builtinModules } from 'node:module';
import { type Plugin } from '@rsbuild/core';
import {mergeRsbuildConfig as mergeConfig } from '@rsbuild/core';
import { ElectronPluginOptions } from '../../core/src/types';
import { getElectronNodeTarget, supportESM } from '../../core/src/electron';
import { loadPackageData } from '../../core/src/utils';

/**
 * @TODO
 * vite main 插件改写 为rsbuild
 * */
export function renderPlugin(options?: ElectronPluginOptions): Plugin[] {
  return [
    {
      name: 'rsbuild:electron-renderer-preset-config',
      setup(api): void {
        const root = options?.root || process.cwd();

        const nodeTarget = getElectronNodeTarget();

        const pkg = loadPackageData() || { type: 'commonjs' };

        console.log('执行 electronMainVitePlugin')

        const format = pkg.type && pkg.type === 'module' && supportESM() ? 'es' : 'cjs';

        const defaultConfig = {
          resolve: {
            browserField: false,
            mainFields: ['module', 'jsnext:main', 'jsnext'],
            conditions: ['node'],
          },
          build: {
            outDir: path.resolve(root, 'out', 'main'),
            target: nodeTarget,
            assetsDir: 'chunks',
            rollupOptions: {
              external: ['electron', /^electron\/.+/, ...builtinModules.flatMap((m) => [m, `node:${m}`])],
              output: {},
            },
            reportCompressedSize: false,
            minify: false,
          },
        };

        const build = api.build || {};
        const rollupOptions = build.rollupOptions || {};
        if (!rollupOptions.input) {
          const libOptions = build.lib;
          const outputOptions = rollupOptions.output;
          defaultConfig.build['lib'] = {
            entry: findLibEntry(root, 'main'),
            formats:
              libOptions && libOptions.formats && libOptions.formats.length > 0
                ? []
                : [
                  outputOptions && !Array.isArray(outputOptions) && outputOptions.format
                    ? outputOptions.format
                    : format,
                ],
          };
        } else {
          defaultConfig.build.rollupOptions.output['format'] = format;
        }

        defaultConfig.build.rollupOptions.output['assetFileNames'] = path.posix.join(
          build.assetsDir || defaultConfig.build.assetsDir,
          '[name]-[hash].[ext]'
        );

        const buildConfig = mergeConfig(defaultConfig.build, build);
        api.build = buildConfig;

        api.resolve = mergeConfig(defaultConfig.resolve, api.resolve || {});

        api.define = api.define || {};
        api.define = { ...processEnvDefine(), ...api.define };

        api.envPrefix = api.envPrefix || ['MAIN_VITE_', 'RSBUILD_'];

        api.publicDir = api.publicDir || 'resources';
        // do not copy public dir
        api.build.copyPublicDir = false;
        // module preload polyfill does not apply to nodejs (main process)
        api.build.modulePreload = false;
        // enable ssr build
        api.build.ssr = true;
        api.build.ssrEmitAssets = true;
        api.ssr = { ...api.ssr, ...{ noExternal: true } };
      },
    },
    {
      name: 'rsbuild:electron-main-resolved-config',
      // TODO 在解析 Vite 配置后调用
      configResolved(api): void {
        const build = api.build;
        if (!build.target) {
          throw new Error('build.target option is required in the electron rsbuild main config.');
        } else {
          const targets = Array.isArray(build.target) ? build.target : [build.target];
          if (targets.some((t) => !t.startsWith('node'))) {
            throw new Error('The electron rsbuild main config build.target option must be "node?".');
          }
        }

        const libOptions = build.lib;
        const rollupOptions = build.rollupOptions;

        if (!(libOptions && libOptions.entry) && !rollupOptions?.input) {
          throw new Error(
            'An entry point is required in the electron rsbuild main config, ' +
            'which can be specified using "build.lib.entry" or "build.rollupOptions.input".'
          );
        }

        const resolvedOutputs = resolveBuildOutputs(rollupOptions.output, libOptions);

        if (resolvedOutputs) {
          const outputs = Array.isArray(resolvedOutputs) ? resolvedOutputs : [resolvedOutputs];
          if (outputs.length > 1) {
            throw new Error('The electron rsbuild main config does not support multiple outputs.');
          } else {
            const outpout = outputs[0];
            if (['es', 'cjs'].includes(outpout.format || '')) {

              console.log('执行 2')
              if (outpout.format === 'es' && !supportESM()) {
                throw new Error(
                  'The electron rsbuild main config output format does not support "es", ' +
                  'you can upgrade electron to the latest version or switch to "cjs" format.'
                );
              }
            } else {
              throw new Error(
                `The electron rsbuild main config output format must be "cjs"${supportESM() ? ' or "es"' : ''}.`
              );
            }
          }
        }
      },
    },
  ];
}

function processEnvDefine(): any {
  throw new Error('Function not implemented.');
}
