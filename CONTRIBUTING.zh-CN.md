# Electron-Rsbuild 贡献指南

感谢您有兴趣为 Electron-Rsbuild 投稿！在您开始贡献之前，请阅读以下指南。

---

## 设置环境

### 安装 Node.js

我们建议使用 Node.js 20。您可以使用以下命令检查当前的 Node.js 版本：

```bash
node -v
```

如果当前环境中没有安装 Node.js，可以使用 [nvm](https://github.com/nvm-sh/nvm) 或 [fnm](https://github.com/Schniz/fnm)
进行安装。

下面是如何通过 nvm 安装 Node.js 20 LTS 版本的示例：

```bash
# 安装Node.js 20 稳定版本
nvm install 20 --lts

# 将新安装的 Node.js 20 设置为默认版本
nvm alias default 20

# 切换到 Node 20
nvm use 20
```

### 安装以来

启用 [pnpm](https://pnpm.io/) corepack:

```sh
corepack enable
```

安装依赖:

```sh
pnpm install # 安装依赖
pnpm run dev # rslib 生成 core+ plugin* dist 包
pnpm run react # 启用预览项目测试
```

解释下:

- 会按照全部依赖，含 packages 目录下子包，利用了 nx 的能力
- 在 monorepo 项目中，的子包之间，创建软链
- 运行 `prepare` 脚本来安装所有软件包，由 [nx](https://nx.dev/) 提供支持。

## 修改与构建

在你的 For 的 repo 中设置好本地开发环境后，就可以开始开发了。

### 切下本地分支

建议在新分支上进行开发，这样以后提交拉取请求时会更方便：

```sh
git checkout -b MY_BRANCH_NAME
```

### 构建包

使用 [nx build](https://nx.dev/nx-api/nx/documents/run) 来构建要更改的软件包：

```sh
npx nx build @electron-rsbuild/core
```

构建所有包：

```sh
pnpm run build
```

---

## debug

### Bun debug for webstorm

> Only Linux、MacOS

- `Working Directory`: `xx/electron-rsbuild`
- `File`: `packages/core/bin/electron-resbuld.ts`
- `Application parameters`: `dev`
- add a debug break point at `/core/config.ts`

### Bun debug for vscode

- todo
