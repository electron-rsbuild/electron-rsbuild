import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import colors from 'picocolors';

export { type LogLevel, logger } from 'rslog';
import { createLogger, LogLevel } from 'rslog';

export { mergeRsbuildConfig } from '@rsbuild/core';

import {
  type RsbuildConfig,
  type RsbuildPlugin as Plugin,
  mergeRsbuildConfig as mergeConfig,
  createRsbuild,
  RsbuildMode,
  DistPathConfig,
  FilenameConfig,
} from '@rsbuild/core';
import { RsbuildConfigExport as ViteConfigExport } from '@rsbuild/core/dist-types/config';
import { LoadEnvOptions as ConfigEnv } from '@rsbuild/core/dist-types/loadEnv';
import { electronMainVitePlugin, electronPreloadVitePlugin, electronRendererVitePlugin } from './plugins/electron';
import assetPlugin from './plugins/asset';
import workerPlugin from './plugins/worker';
import importMetaPlugin from './plugins/importMeta';
import esmShimPlugin from './plugins/esm';
import modulePathPlugin from './plugins/modulePath';
import { isObject, isFilePathESM } from './utils';
export { defineConfig as defineViteConfig } from '@rsbuild/core';

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

export type ElectronViteConfigFnObject = (env: ConfigEnv) => ElectronViteConfig;
export type ElectronViteConfigFnPromise = (env: ConfigEnv) => Promise<ElectronViteConfig>;
export type ElectronViteConfigFn = (env: ConfigEnv) => ElectronViteConfig | Promise<ElectronViteConfig>;

export type ElectronViteConfigExport =
  | ElectronViteConfig
  | Promise<ElectronViteConfig>
  | ElectronViteConfigFnObject
  | ElectronViteConfigFnPromise
  | ElectronViteConfigFn;

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
  config?: UserConfig;
  configFile?: string;
  configFileDependencies: string[];
}

export async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development'
): Promise<ResolvedConfig> {
  const config = inlineConfig;
  const mode = inlineConfig.mode || defaultMode;

  process.env.NODE_ENV = defaultMode;

  let userConfig: UserConfig | undefined;
  let configFileDependencies: string[] = [];

  let { configFile } = config;
  if (configFile !== false) {
    const configEnv = {
      mode,
      command,
    };
    const loadResult = await loadConfigFromFile(
      configEnv,
      configFile,
      config.root,
      config.logLevel,
      config.ignoreConfigWarning
    );
    if (loadResult) {
      const root = config.root;
      delete config.root;
      delete config.configFile;

      const outDir = config.output?.distPath as string;

      if (loadResult.config.main) {
        const mainViteConfig: RsbuildConfig = mergeConfig(loadResult.config.main, deepClone(config));

        mainViteConfig.mode = (inlineConfig.mode || mainViteConfig.mode || defaultMode) as RsbuildMode;

        if (outDir) {
          resetOutDir(mainViteConfig, outDir, 'main');
        }

        mergePlugins(mainViteConfig, [
          ...electronMainVitePlugin({ root }),
          assetPlugin(),
          workerPlugin(),
          modulePathPlugin(),
          importMetaPlugin(),
          esmShimPlugin(),
        ]);

        loadResult.config.main = mainViteConfig;
        loadResult.config.main.configFile = false;
      }

      if (loadResult.config.preload) {
        const preloadViteConfig: RsbuildConfig = mergeConfig(loadResult.config.preload, deepClone(config));

        preloadViteConfig.mode = (inlineConfig.mode || preloadViteConfig.mode || defaultMode) as RsbuildMode;

        if (outDir) {
          resetOutDir(preloadViteConfig, outDir, 'preload');
        }
        mergePlugins(preloadViteConfig, [
          ...electronPreloadVitePlugin({ root }),
          assetPlugin(),
          importMetaPlugin(),
          esmShimPlugin(),
        ]);

        loadResult.config.preload = preloadViteConfig;
        loadResult.config.preload.configFile = false;
      }

      if (loadResult.config.renderer) {
        const rendererViteConfig: RsbuildConfig = mergeConfig(loadResult.config.renderer, deepClone(config));

        rendererViteConfig.mode = (inlineConfig.mode || rendererViteConfig.mode || defaultMode) as RsbuildMode;

        if (outDir) {
          resetOutDir(rendererViteConfig, outDir, 'renderer');
        }

        mergePlugins(rendererViteConfig, electronRendererVitePlugin({ root }));

        loadResult.config.renderer = rendererViteConfig;
        loadResult.config.renderer.configFile = false;
      }

      userConfig = loadResult.config;
      configFile = loadResult.path;
      configFileDependencies = loadResult.dependencies;
    }
  }

  const resolved: ResolvedConfig = {
    config: userConfig,
    configFile: configFile ? normalizePath(configFile) : undefined,
    configFileDependencies,
  };

  return resolved;
}

function deepClone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function resetOutDir(config: RsbuildConfig, outDir: string, subOutDir: string): void {
  let userOutDir = config.output?.distPath;
  if (outDir === userOutDir) {
    userOutDir = path.resolve(config.root || process.cwd(), outDir, subOutDir) as DistPathConfig;
    if (config.output) {
      config.output.distPath = userOutDir;
    } else {
      config.output = { distPath: userOutDir };
    }
  }
}

function mergePlugins(config: RsbuildConfig, plugins: Plugin[]): void {
  const userPlugins = config.plugins || [];
  config.plugins = userPlugins.concat(plugins);
}

const CONFIG_FILE_NAME = 'electron.rsbuild.config';

export async function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
  configRoot: string = process.cwd(),
  logLevel?: LogLevel,
  ignoreConfigWarning = false
): Promise<{
  path: string;
  config: UserConfig;
  dependencies: string[];
}> {
  if (configFile && /^rsbuild.config.(js|ts|mjs|cjs|mts|cts)$/.test(configFile)) {
    throw new Error(`config file cannot be named ${configFile}.`);
  }

  const resolvedPath = configFile
    ? path.resolve(configFile)
    : findConfigFile(configRoot, ['js', 'ts', 'mjs', 'cjs', 'mts', 'cts']);

  if (!resolvedPath) {
    return {
      path: '',
      config: { main: {}, preload: {}, renderer: {} },
      dependencies: [],
    };
  }

  const isESM = isFilePathESM(resolvedPath);

  try {
    const bundled = await bundleConfigFile(resolvedPath);
    const userConfig = await loadConfigFormBundledFile(configRoot, resolvedPath, bundled.code, isESM);

    const config = await (typeof userConfig === 'function' ? userConfig(configEnv) : userConfig);
    if (!isObject(config)) {
      throw new Error(`config must export or return an object`);
    }

    const configRequired: string[] = [];

    let mainConfig;
    if (config.main) {
      const mainViteConfig = config.main;
      mainConfig = await (typeof mainViteConfig === 'function' ? mainViteConfig(configEnv) : mainViteConfig);
      if (!isObject(mainConfig)) {
        throw new Error(`main config must export or return an object`);
      }
    } else {
      configRequired.push('main');
    }

    let rendererConfig;
    if (config.renderer) {
      const rendererViteConfig = config.renderer;
      rendererConfig = await (typeof rendererViteConfig === 'function'
        ? rendererViteConfig(configEnv)
        : rendererViteConfig);
      if (!isObject(rendererConfig)) {
        throw new Error(`renderer config must export or return an object`);
      }
    } else {
      configRequired.push('renderer');
    }

    let preloadConfig;
    if (config.preload) {
      const preloadViteConfig = config.preload;
      preloadConfig = await (typeof preloadViteConfig === 'function'
        ? preloadViteConfig(configEnv)
        : preloadViteConfig);
      if (!isObject(preloadConfig)) {
        throw new Error(`preload config must export or return an object`);
      }
    } else {
      configRequired.push('preload');
    }

    if (!ignoreConfigWarning && configRequired.length > 0) {
      createLogger({ level: logLevel }).warn(colors.yellow(`${configRequired.join(' and ')} config is missing`));
    }

    return {
      path: normalizePath(resolvedPath),
      config: {
        main: mainConfig,
        renderer: rendererConfig,
        preload: preloadConfig,
      },
      dependencies: bundled.dependencies,
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
  // TODO
  const result = await createRsbuild({
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
            build.onResolve({ filter: /.*/ }, (args) => {
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
            build.onLoad({ filter: /\.[cm]?[jt]s$/ }, async (args) => {
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
    // TODO metafile: true,
  });
  // const { text } = result.outputFiles[0];

  // // TODO
  // return {
  //   code: text,
  //   dependencies: result.metafile ? Object.keys(result.metafile.inputs) : [],
  // };
  return result;
}

interface NodeModuleWithCompile extends NodeModule {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  _compile(code: string, filename: string): any;
}

const _require = createRequire(import.meta.url);
async function loadConfigFormBundledFile(
  configRoot: string,
  configFile: string,
  bundledCode: string,
  isESM: boolean
): Promise<ElectronViteConfigExport> {
  if (isESM) {
    const fileNameTmp = path.resolve(configRoot, `${CONFIG_FILE_NAME}.${Date.now()}.mjs`);
    fs.writeFileSync(fileNameTmp, bundledCode);

    const fileUrl = pathToFileURL(fileNameTmp);
    try {
      return (await import(fileUrl.href)).default;
    } finally {
      try {
        fs.unlinkSync(fileNameTmp);
      } catch {}
    }
  } else {
    const extension = path.extname(configFile);
    const realFileName = fs.realpathSync(configFile);
    const loaderExt = extension in _require.extensions ? extension : '.js';
    const defaultLoader = _require.extensions[loaderExt]!;
    _require.extensions[loaderExt] = (module: NodeModule, filename: string): void => {
      if (filename === realFileName) {
        (module as NodeModuleWithCompile)._compile(bundledCode, filename);
      } else {
        defaultLoader(module, filename);
      }
    };
    delete _require.cache[_require.resolve(configFile)];
    const raw = _require(configFile);
    _require.extensions[loaderExt] = defaultLoader;
    return raw.__esModule ? raw.default : raw;
  }
}
