import { RsbuildConfig, RsbuildPlugin } from '@rsbuild/core';
import { ElectronPluginOptions } from '../../core/src/types';
/**
 * @TODO
 * vite main 插件改写 为rsbuild
 * */
export function mainPlugin(options?: ElectronPluginOptions): RsbuildPlugin[] {
  return [
    {
      name: 'electron-rsbuild:main',
      // pre 声明前置插件的名称，在插件执行之前执行 string[]
      // post 后置插件，当前插件之后执行
      setup(api) {
        // like as: global ctx api.context.distPath
        // 修改 config
        api.modifyRsbuildConfig((config: RsbuildConfig) => {
          console.log("准备修改 main config=>", config.environments)
          // environments
          console.log('xx 1', config.environments?.main)
        });
        // 读取最终 config
        api.onBeforeBuild(() => {});

        // 处理产物
        api.onBeforeBuild(() => {});
      },
    },
  ];
}
