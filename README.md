# electron-rsbuild

Next generation Electron build tooling based on Rsbuild.

[![Release](https://github.com/veaba/electron-rsbuild/actions/workflows/release.yml/badge.svg)](https://github.com/veaba/electron-rsbuild/actions/workflows/release.yml)

## cmd-lines

```js
{
  "scripts": {
    "start": "electron-rsbuild preview", //预览生产构建
    "dev": "electron-rsbuild dev",// 开发服务和electron 程序
    "build": "electron-rsbuild build",// build 构建
  }
}

```

- https://rspack.dev/zh/plugins/webpack/electron-target-plugin
- https://rspack.dev/zh/config/externals#externalspresets
