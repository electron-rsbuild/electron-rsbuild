import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import colors from 'picocolors';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { createLogger, LogLevel } from 'rslog';
import {
  createRsbuild,
  DistPathConfig,
  FilenameConfig,
  loadConfig,
  mergeRsbuildConfig as mergeConfig,
  type RsbuildConfig,
  RsbuildMode,
  type RsbuildPlugin as Plugin,
  logger,
  mergeRsbuildConfig,
} from '@rsbuild/core';

import { mainPlugin } from '@electron-rsbuild/plugin-main';
import { preloadPlugin } from '@electron-rsbuild/plugin-preload';
import { rendererPlugin } from '@electron-rsbuild/plugin-renderer';

import { normalizePath } from './utils';
import { LoadEnvOptions, ViteConfigExport } from './types';

export { type LogLevel } from 'rslog';

export { mergeRsbuildConfig } from '@rsbuild/core';

export { defineConfig as defineViteConfig } from '@rsbuild/core';

const _require2 = createRequire(`file://${process.cwd()}/`);

export function slash(p: string): string {
  return p.replace(/\\/g, '/');
}

export const isWindows = os.platform() === 'win32';

export interface UserConfig {
  /**
   * Vite config options for electron main process
   *
   * https://vitejs.dev/config/
   */
  main?: RsbuildConfig & { configFile?: string | false };
  /**
   * Vite config options for electron renderer process
   *
   * https://vitejs.dev/config/
   */
  renderer?: RsbuildConfig & { configFile?: string | false };
  /**
   * Vite config options for electron preload files
   *
   * https://vitejs.dev/config/
   */
  preload?: RsbuildConfig & { configFile?: string | false };
}

export interface ElectronViteConfig {
  /**
   * Vite config options for electron main process
   *
   * https://vitejs.dev/config/
   */
  main?: ViteConfigExport;
  /**
   * Vite config options for electron renderer process
   *
   * https://vitejs.dev/config/
   */
  renderer?: ViteConfigExport;
  /**
   * Vite config options for electron preload files
   *
   * https://vitejs.dev/config/
   */
  preload?: ViteConfigExport;
}

export type InlineConfig = Omit<RsbuildConfig, 'base'> & {
  configFile?: string | false;
  envFile?: false;
  ignoreConfigWarning?: boolean;
  logLevel?: LogLevel;
  clearScreen?: boolean;
};

export type ElectronViteConfigFnObject = (env: LoadEnvOptions) => ElectronViteConfig;
export type ElectronViteConfigFnPromise = (env: LoadEnvOptions) => Promise<ElectronViteConfig>;
export type ElectronViteConfigFn = (env: LoadEnvOptions) => ElectronViteConfig | Promise<ElectronViteConfig>;

export type ElectronViteConfigExport = ElectronViteConfig | Promise<ElectronViteConfig> | ElectronViteConfigFnObject | ElectronViteConfigFnPromise | ElectronViteConfigFn;

/**
 * Type helper to make it easier to use `electron.rsbuild.config.*`
 * accepts a direct {@link ElectronViteConfig} object, or a function that returns it.
 * The function receives a object that exposes two properties:
 * `command` (either `'build'` or `'serve'`), and `mode`.
 */
export function defineConfig(config: ElectronViteConfig): ElectronViteConfig;
export function defineConfig(config: Promise<ElectronViteConfig>): Promise<ElectronViteConfig>;
export function defineConfig(config: ElectronViteConfigFnObject): ElectronViteConfigFnObject;
export function defineConfig(config: ElectronViteConfigExport): ElectronViteConfigExport;
export function defineConfig(config: ElectronViteConfigExport): ElectronViteConfigExport {
  return config;
}

export interface ResolvedConfig {
  userConfig?: UserConfig;
  configFile?: string;
}

/**
 * preset user config:
 * electron.rsbuild.config.ts
 * 模式1：命令行写入
 * @return {ResolvedConfig} userConfig
 * */
export async function resolveUserConfig(inlineConfig: InlineConfig, command: 'build' | 'serve', defaultMode = 'development'): Promise<ResolvedConfig> {
  const config = inlineConfig;
  const mode = inlineConfig.mode || defaultMode;

  process.env.NODE_ENV = defaultMode;

  let userConfig: UserConfig = {};

  let { configFile } = config;

  if (configFile !== false) {
    const configEnv = {
      mode,
      command,
    };

    const loadResult = await loadConfigFromFile(configEnv, configFile, config.root, config.logLevel);

    console.log('loadResult=>', loadResult);
    if (loadResult) {
      delete config.root;
      delete config.configFile;

      // mixin main config
      if (loadResult.config.main) {
        const mainMode = (inlineConfig.mode || loadResult.config.main.mode || defaultMode) as RsbuildMode;
        const mainConfig: RsbuildConfig = mergeRsbuildConfig(
          {
            mode: mainMode,
            plugins: [mainPlugin({ root: 'main-root' })],
          },
          loadResult.config.main,
        );
        userConfig.main = mainConfig;
      }

      // mixin preload config
      if (loadResult.config.preload) {
        const preloadMode = (inlineConfig.mode || loadResult.config.preload.mode || defaultMode) as RsbuildMode;
        const preloadConfig: RsbuildConfig = mergeRsbuildConfig(
          {
            mode: preloadMode,
            plugins: [mainPlugin({ root: 'preload-root' })],
          },
          loadResult.config.preload,
        );
        userConfig.preload = preloadConfig;
      }

      // mixin renderer config
      if (loadResult.config.renderer) {
        const rendererMode = (inlineConfig.mode || loadResult.config.renderer.mode || defaultMode) as RsbuildMode;
        const rendererConfig: RsbuildConfig = mergeRsbuildConfig(
          {
            mode: rendererMode,
            plugins: [mainPlugin({ root: 'renderer-root' })],
          },
          loadResult.config.renderer,
        );
        userConfig.renderer = rendererConfig;
      }
      configFile = loadResult.path;
    }
  }
  return {
    userConfig,
    configFile: configFile as string,
  };
}


const CONFIG_FILE_NAME = 'electron.rsbuild.config';

/**
 * 处理和判断用药 config 配置
 * 暴露出来一个 config 实例对象
 * 默认 isESM
 * TODO 实现 configEnv
 * TODO 实现 ignoreConfigWarning
 * TODO if (!isObject(config)
 * TODO if (config.main)
 * TODO if (config.renderer)
 * TODO if (config.preload)
 * */
export async function loadConfigFromFile(
  configEnv: LoadEnvOptions,
  configFile?: string,
  configRoot: string = process.cwd(),
  logLevel?: LogLevel,
): Promise<{
  path: string;
  config: UserConfig;
}> {
  if (configFile && /^rsbuild.config.(js|ts|mjs|cjs|mts|cts)$/.test(configFile)) {
    throw new Error(`config file cannot be named ${configFile}.`);
  }

  // "F:\\Github\\veaba\\electron-rsbuild"

  const resolvedPath = configFile ? path.resolve(configFile) : findConfigFile(configRoot, ['js', 'ts', 'mjs', 'cjs', 'mts', 'cts']);

  console.log("configFile=>", configFile)
  console.log("electron.rsbuild.config.js=>", resolvedPath)
  if (!resolvedPath) {
    return {
      path: '',
      config: { main: {}, preload: {}, renderer: {} },
    };
  }

  try {
    // load user config file: electron.rsbuild.config.ts

    console.log("读取路径 1=>", configRoot)
    console.log("读取路径 2=>", resolvedPath)
    // TODO ========== 需要转为合法数据~~
    const { content, filePath } = await loadConfig({
      cwd: configRoot,
      path: resolvedPath,
    });

    console.log("c=>", content)
    console.log("c 2=>", filePath)
    // TODO 此处省略一堆判断
    const { preload, renderer, main } = content as any;
    // TODO 附加一堆 plugins 等等
    return {
      config: {
        main: main || {},
        preload: preload || {},
        renderer: renderer || {},
      },
      path: filePath as string,
    };
  } catch (e) {
    createLogger({ level: logLevel }).error(colors.red(`failed to load config from ${resolvedPath}`), {
      error: e as Error,
    });
    throw e;
  }
}

function findConfigFile(configRoot: string, extensions: string[]): string {
  for (const ext of extensions) {
    const configFile = path.resolve(configRoot, `${CONFIG_FILE_NAME}.${ext}`);
    if (fs.existsSync(configFile)) {
      return configFile;
    }
  }
  return '';
}

/**
 * 上个版本有 esm 传入
 */
async function bundleConfigFile(fileName: FilenameConfig) {
  const dirnameVarName = '__electron_rsbuild_injected_dirname';
  const filenameVarName = '__electron_rsbuild_injected_filename';
  const importMetaUrlVarName = '__electron_rsbuild_injected_import_meta_url';
  // create a rsbuild instance
  const rsbuild = await createRsbuild({
    cwd: process.cwd(),

    // TODO 将下面配置改为 rsbuild
    rsbuildConfig: {
      output: {
        filename: fileName,
        target: 'node',
        sourceMap: {
          js: false,
          css: false,
        },
      },
      source: {
        define: {
          __dirname: dirnameVarName,
          __filename: filenameVarName,
          'import.meta.url': importMetaUrlVarName,
        },
      },
      plugins: [
        {
          name: 'externalize-deps',
          setup(build): void {
            build.onResolve({ filter: /.*/ }, (args: any) => {
              const id = args.path;
              if (id[0] !== '.' && !path.isAbsolute(id)) {
                return {
                  external: true,
                };
              }
              return null;
            });
          },
        },
        {
          name: 'replace-import-meta',
          setup(build): void {
            build.onLoad({ filter: /\.[cm]?[jt]s$/ }, async (args: any) => {
              const contents = await fs.promises.readFile(args.path, 'utf8');
              const injectValues =
                `const ${dirnameVarName} = ${JSON.stringify(path.dirname(args.path))};` +
                `const ${filenameVarName} = ${JSON.stringify(args.path)};` +
                `const ${importMetaUrlVarName} = ${JSON.stringify(pathToFileURL(args.path).href)};`;

              return {
                loader: args.path.endsWith('ts') ? 'ts' : 'js',
                contents: injectValues + contents,
              };
            });
          },
        },
      ],
    },
    // TODO bundle: true,
    // TODO format: isESM ? 'esm' : 'cjs',
  });
  // const { text } = result.outputFiles[0];

  // TODO

  console.log('rsbuild 实例=>', rsbuild);

  // console.log('用户的config=>', result)
  return rsbuild;
}
