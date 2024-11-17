# electron-rsbuild

Export Next generation Electron build tooling based on Rsbuild.

[![Release](https://github.com/veaba/electron-rsbuild/actions/workflows/release.yml/badge.svg)](https://github.com/veaba/electron-rsbuild/actions/workflows/release.yml)

- [document](https://electron-rsbuild.org/)
- [electron-rsbuild repo](https://github.com/veaba/electron-rsbuild/)
- [electron-rsbuild org](https://github.com/electron-rsbuild/)

## Usage

### by npm package

```sh
pnpm add @electron-rsbuild/core
```

update `package.json` file like this:

```json
{
  "scripts": {
    "start": "electron-rsbuild preview", // preview
    "dev": "electron-rsbuild dev", // dev
    "build": "electron-rsbuild build", // build
  }
}

### by rsbuild plugin

cmd-lines



```

## Benchmark TODO

## Reference

- [rsbuild](https://github.com/web-infra-dev/rsbuild)
- [rspack](https://github.com/web-infra-dev/rspack)
- [vite](https://github.com/vitejs/vite)
- [electron-vite](https://github.com/alex8088/electron-vite)
- [electron](https://github.com/electron/electron)
