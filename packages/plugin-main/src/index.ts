import { RsbuildPlugin } from '@rsbuild/core';
import { ElectronPluginOptions } from '../../core/src/types';
/**
 * @TODO
 * vite main 插件改写 为rsbuild
 * */
export function mainPlugin(options?: ElectronPluginOptions): RsbuildPlugin[] {
  return [
    {
      name: 'rsbuild:electron-main-preset-config',
      setup(api: any): void {
        console.log('main pre=>', options?.root);
      },
    },
    {
      name: 'rsbuild:electron-main-resolved-config',
      // TODO 在解析 Vite 配置后调用
      setup(api: any): void {
        console.log('main post=>', api);
      },
    },
  ];
}
