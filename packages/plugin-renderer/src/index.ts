import { RsbuildPlugin } from '@rsbuild/core';
import { ElectronPluginOptions } from '../../core/src/types';
/**
 * @TODO
 * vite renderer 插件改写 为rsbuild
 * */
export function rendererPlugin(options?: ElectronPluginOptions):RsbuildPlugin[] {
  return [
    {
      name: 'rsbuild:electron-renderer-preset-config',
      setup(): void {
        console.log("renderer pre=>",options?.root)
      },
    },
    {
      name: 'rsbuild:electron-renderer-resolved-config',
      // TODO 在解析 Vite 配置后调用
      setup(): void {
        console.log("renderer post=>",)
      },
    },
  ];
}
