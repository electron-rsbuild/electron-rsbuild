import { RsbuildPlugin } from '@rsbuild/core';
import { ElectronPluginOptions } from '../../core/src/types';
/**
 * @TODO
 * vite preload 插件改写 为rsbuild
 * */
export function preloadPlugin(
  options?: ElectronPluginOptions,
): RsbuildPlugin[] {
  return [
    {
      name: 'electron-rsbuild:preload',
      // pre: ['rsbuild:electron-preload-preset-config'],
      // TODO 在解析 Vite 配置后调用
      setup(): void {
        console.log('preload post xxx=>');
      },
    },
  ];
}
