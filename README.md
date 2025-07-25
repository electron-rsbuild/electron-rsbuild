# electron-rsbuild

> WIP, do not use it directly in the production environment.

Export Next generation Electron build tooling based on Rsbuild.

[![Release](https://github.com/electron-rsbuild/electron-rsbuild/actions/workflows/release.yml/badge.svg)](https://github.com/electron-rsbuild/electron-rsbuild/actions/workflows/release.yml)

- [document](https://electron-rsbuild.org/)
- [electron-rsbuild](https://github.com/electron-rsbuild/electron-rsbuild/)
- [electron-rsbuild org](https://github.com/electron-rsbuild/)

## Usage

### by npm package

1. install core package:

```sh
pnpm add @electron-rsbuild/core
```

2. update `package.json` file like this:

```json
{
  "scripts": {
    "start": "electron-rsbuild preview",
    "dev": "electron-rsbuild dev",
    "build": "electron-rsbuild build"
  }
}
```

3. create a `electron.rsbuild.config.ts` file to your project root directory:

```ts
import { resolve } from 'path';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  root: resolve(__dirname, '.'),
  environments: {
    // main
    main: {},
    // preload
    preload: {},
    // renderer
    renderer: {
      plugins: [pluginReact()],
    },
  },
});
```

### by rsbuild plugin

> Note that if you use electron-rsbuild as a plugin, you will be missing a lot of built-in features.

```sh
pnpm add -D @electron-rsbuild/plugin-main @electron-rsbuild/plugin-preload @electron-rsbuild/plugin-renderer
```

update `rsbuild.config.ts`:

```ts
import { resolve } from 'path';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { mainPlugin } from '@electron-rsbuild/plugin-main';
import { preloadPlugin } from '@electron-rsbuild/plugin-preload';
import { rendererPlugin } from '@electron-rsbuild/plugin-renderer';

export default defineConfig({
  root: resolve(__dirname, '.'),
  environments: {
    // main
    main: {
      plugins: [mainPlugin()],
    },
    // preload
    preload: {
      plugins: [preloadPlugin()],
    },

    // renderer
    renderer: {
      plugins: [pluginReact(), rendererPlugin()],
    },
  },
});
```

`package.json`:

```json
  "scripts": {
    "dev": "rsbuild dev",
    "build": "rsbuild build"
  }

```

## Playground Snapshot

Use `npm create electron-rsbuild@0.0.10` create a electron-rsbuild project:

![playground-install-npm](https://electron-rsbuild.org/playground/playground-install-npm.png)

Use `pnpm run dev` launch electron:

![playground-demo](https://electron-rsbuild.org/playground/playground-demo.png)

## Benchmark TODO

## Reference

- [rsbuild](https://github.com/web-infra-dev/rsbuild)
- [rspack](https://github.com/web-infra-dev/rspack)
- [vite](https://github.com/vitejs/vite)
- [electron-vite](https://github.com/alex8088/electron-vite)
- [electron](https://github.com/electron/electron)

## 🤝 Contribution

> New contributors welcome!

Please read the [Contributing Guide](https://github.com/electron-rsbuild/electron-rsbuild/blob/main/CONTRIBUTING.md).

## 📖 License

Electron-Rsbuild is licensed under the MIT License.
