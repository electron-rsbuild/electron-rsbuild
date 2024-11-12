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
      // pre 声明前置插件的名称，在插件执行之前执行 string[]
      // post 后置插件，当前插件之后执行
      setup(api: any): void {
        console.log('main post=>', api.context.version);
        // like as: global ctx api.context.distPath

        // 修改 config
        api.modifyRsbuildConfig(() => {});
        // 读取最终 config
        api.onBeforeBuild(() => {});

        // 处理产物
        api.onBeforeBuild(() => {});
      },
    },
  ];
}
