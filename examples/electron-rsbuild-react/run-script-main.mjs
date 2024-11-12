import { createRsbuild } from '@rsbuild/core'
import path from 'node:path'
import { pluginReact } from '@rsbuild/plugin-react'
// import pkg from './package.json'

const startDev = async () => {
  const rsbuild = await createRsbuild({
    rsbuildConfig: {
      root: './',
      // TODO 后期改为默认
      environments: {
        renderer: {
          html: {
            // pkg.name || 
            title: 'Electron-Rsbuild App'
          },
          source: {
            entry: {
              index: './src/renderer/src/main.tsx'
            },
            // TODO 后期改为默认
            alias: {
              '@renderer': path.resolve('src/renderer/src')
            }
          },
          plugins: [pluginReact()],
          output: {
            target: 'web',
            assetPrefix: 'auto',
            distPath: {
              root: 'out/renderer'
            },
            // TODO 禁用压缩
            minify: false
          }
        }
      }
    }
  })

  // 安装 @rspack/core  之后，用node 启用成功
  // const server = await rsbuild.createDevServer()

  const server = await rsbuild.startDevServer()
  console.log('server=>', server)
  // const { port, urls, server: confServer } = server
  // console.log('server=>', server)
  // if (!server.server) {
  //   throw new Error('HTTP server not available')
  // }
}

startDev()
