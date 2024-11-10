/**
 * @TODO 后续可能需要拆为 1+ 3个 package 分别维护 core、main、preload、renderer
 * 处理 main 插件 */
import type { RsbuildPlugin } from '@rsbuild/core'
// import { getElectronNodeTarget } from '../../.rslib/declarations/electron'

export type PluginMainOptions = {
  message?: string
}
const electronRsbuildMainPlugin = (options: PluginMainOptions = {}): RsbuildPlugin => {
  return {
    // same as: @electron-rsbuild/plugin-electron-main
    // electron-rsbuild:electron-main-config
    name: 'electron-rsbuild:electron-main-config',
    // pre 声明前置插件的名称，在插件执行之前执行 string[]
    // post 后置插件，当前插件之后执行
    // remove 移除插件
    setup(api) {
      console.log('msg=>', options.message)
      // like as: global ctx api.context.distPath

      // 修改 config
      api.modifyRsbuildConfig(config => {

      })
      // 读取最终 config
      api.onBeforeBuild(()=>{

      })

      // 处理产物
      api.onBeforeBuild(()=>{

      })
    }
  }
}

export default electronRsbuildMainPlugin
