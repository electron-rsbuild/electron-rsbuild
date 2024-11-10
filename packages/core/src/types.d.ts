import { type RsbuildConfig } from '@rsbuild/core';

export interface ExistingRawSourceMap {
  file?: string;
  mappings: string;
  names: string[];
  sourceRoot?: string;
  sources: string[];
  sourcesContent?: string[];
  version: number;
  x_google_ignoreList?: number[];
}

export type SourceMapInput = ExistingRawSourceMap | string | null | { mappings: '' };

export type ConfigParams = {
  env: string;
  command: string;
  envMode?: string;
};

export type RsbuildConfigAsyncFn = (env: ConfigParams) => Promise<RsbuildConfig>;
export type RsbuildConfigSyncFn = (env: ConfigParams) => RsbuildConfig;

export type ViteConfigExport = RsbuildConfig | RsbuildConfigAsyncFn | RsbuildConfigSyncFn;

export type LoadEnvOptions = {
	/**
	 * The root path to load the env file
	 * @default process.cwd()
	 */
	cwd?: string;
	/**
	 * Used to specify the name of the .env.[mode] file
	 * @default process.env.NODE_ENV
	 */
	mode?: string;
	/**
	 * The prefix of public variables
	 * @default ['PUBLIC_']
	 */
	prefixes?: string[];
};

export type RsbuildConfigExport =
  | RsbuildConfig
  | RsbuildConfigSyncFn
  | RsbuildConfigAsyncFn;

	export interface ElectronPluginOptions {
		root?: string;
	}