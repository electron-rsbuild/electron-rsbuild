import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import colors from 'picocolors';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { createLogger, LogLevel } from 'rslog';
import {
  type RsbuildConfig,
  createRsbuild,
  FilenameConfig,
  loadConfig,
  RsbuildMode,
  mergeRsbuildConfig,
} from '@rsbuild/core';

// import { mainPlugin } from '@electron-rsbuild/plugin-main';
// import { preloadPlugin } from '@electron-rsbuild/plugin-preload';
// import { rendererPlugin } from '@electron-rsbuild/plugin-renderer';
import { type LoadEnvOptions, ViteConfigExport } from './types';
import { CONFIG_FILE_NAME } from './constants';

export { type LogLevel } from 'rslog';

export { mergeRsbuildConfig } from '@rsbuild/core';

export { defineConfig as defineViteConfig } from '@rsbuild/core';

const _require2 = createRequire(`file://${process.cwd()}/`);

export function slash(p: string): string {
  return p.replace(/\\/g, '/');
}

export const isWindows = os.platform() === 'win32';

export interface UserConfig extends RsbuildConfig {
  // TODO
  root?: string;
  environments: {
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
  };
}

export interface ElectronRsbuildConfig {
  environments: {
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
  };
}

export type InlineConfig = Omit<RsbuildConfig, 'base'> & {
  configFile?: string | false;
  envFile?: false;
  ignoreConfigWarning?: boolean;
  logLevel?: LogLevel;
  clearScreen?: boolean;
};

export type ElectronViteConfigFnObject = (env: LoadEnvOptions) => ElectronRsbuildConfig;
export type ElectronViteConfigFnPromise = (env: LoadEnvOptions) => Promise<ElectronRsbuildConfig>;
export type ElectronViteConfigFn = (env: LoadEnvOptions) => ElectronRsbuildConfig | Promise<ElectronRsbuildConfig>;

export type ElectronViteConfigExport = ElectronRsbuildConfig | Promise<ElectronRsbuildConfig> | ElectronViteConfigFnObject | ElectronViteConfigFnPromise | ElectronViteConfigFn;

/**
 * Type helper to make it easier to use `electron.rsbuild.config.*`
 * accepts a direct {@link ElectronRsbuildConfig} object, or a function that returns it.
 * The function receives a object that exposes two properties:
 * `command` (either `'build'` or `'serve'`), and `mode`.
 */
export function defineConfig(config: ElectronRsbuildConfig): ElectronRsbuildConfig;
export function defineConfig(config: Promise<ElectronRsbuildConfig>): Promise<ElectronRsbuildConfig>;
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

  let userConfig: UserConfig = { root: process.cwd(), environments: {} };

  let { configFile } = config;

  if (configFile !== false) {
    const configEnv = {
      mode,
      command,
    };

    const { config, path: loadResultPath } = await loadConfigFromFile(configEnv, configFile, undefined, undefined);
    const { environments: loadEnvConfig, root } = config;
    if (loadEnvConfig) {
      // mixin main config
      if (loadEnvConfig.main) {
        const mainMode = (inlineConfig.mode || loadEnvConfig.main.mode || defaultMode) as RsbuildMode;
        const mainConfig: RsbuildConfig = mergeRsbuildConfig(
          {
            mode: mainMode,
 
          },
          loadEnvConfig.main,
        );
        userConfig.environments.main = mainConfig;
      }

      // mixin preload config
      if (loadEnvConfig.preload) {
        const preloadMode = (inlineConfig.mode || loadEnvConfig.preload.mode || defaultMode) as RsbuildMode;
        const preloadConfig: RsbuildConfig = mergeRsbuildConfig(
          {
            mode: preloadMode,
            // plugins: [preloadPlugin({ root: 'preload-root' })],
          },
          loadEnvConfig.preload,
        );
        userConfig.environments.preload = preloadConfig;
      }

      // mixin renderer config
      if (loadEnvConfig.renderer) {
        const rendererMode = (inlineConfig.mode || loadEnvConfig.renderer.mode || defaultMode) as RsbuildMode;
        const rendererConfig: RsbuildConfig = mergeRsbuildConfig(
          {
            mode: rendererMode,
            // plugins: [rendererPlugin({ root: 'renderer-root' })],
          },
          loadEnvConfig.renderer,
        );
        userConfig.environments.renderer = rendererConfig;
      }
      configFile = loadResultPath;
      userConfig.root = root || userConfig.root;
    }
  }
  return {
    userConfig,
    configFile: configFile as string,
  };
}

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

  const resolvedPath = configFile ? path.resolve(configFile) : findConfigFile(configRoot, ['js', 'ts', 'mjs', 'cjs', 'mts', 'cts']);

  if (!resolvedPath) {
    return {
      path: '',
      config: {
        environments: { main: {}, preload: {}, renderer: {} },
      },
    };
  }

  try {
    // load user config file: electron.rsbuild.config.ts
    const { content, filePath } = await loadConfig({
      cwd: configRoot,
      path: resolvedPath,
    });

    const { preload, renderer, main } = content.environments || {};

    return {
      config: {
        root: content.root,
        environments: {
          main: main || {},
          preload: preload || {},
          renderer: renderer || {},
        },
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
