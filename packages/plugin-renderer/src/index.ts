import { RsbuildPlugin } from '@rsbuild/core';
import { ElectronPluginOptions } from '../../core/src/types';
/**
 * @TODO
 * vite renderer 插件改写 为rsbuild
 * */
export function rendererPlugin(options?: ElectronPluginOptions):RsbuildPlugin[] {
  return [
    {
      name: 'electron-rsbuild:renderer',

      // TODO 在解析 Vite 配置后调用
      setup(): void {
        console.log("renderer post=>",)
      },
    },
  ];
}
