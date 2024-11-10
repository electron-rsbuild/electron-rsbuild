# Electron-Rsbuild Contribution Guide

Thank you for your interest in contributing to Electron-Rsbuild! Before you start your contribution, please take a moment to read the following guidelines.

---

## Setup the Environment

### Fork the Repo

[Fork](https://help.github.com/articles/fork-a-repo/) this repository to your
own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local.


### Install Node.js

We recommend using Node.js 20. You can check your current Node.js version using the following command:

```bash
node -v
```

If you do not have Node.js installed in your current environment, you can use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to install it.

Here is an example of how to install the Node.js 20 LTS version via nvm:

```bash
# Install the LTS version of Node.js 20
nvm install 20 --lts

# Make the newly installed Node.js 20 as the default version
nvm alias default 20

# Switch to the newly installed Node.js 20
nvm use 20
```

### Install Dependencies

Enable [pnpm](https://pnpm.io/) with corepack:

```sh
corepack enable
```

Install dependencies:

```sh
pnpm install
```

What this will do:

- Install all dependencies
- Create symlinks between packages in the monorepo
- Run the `prepare` script to build all packages, powered by [nx](https://nx.dev/).

### Set Git Email

Please make sure you have your email set up in `<https://github.com/settings/emails>`. This will be needed later when you want to submit a pull request.

Check that your git client is already configured the email:

```sh
git config --list | grep email
```

Set the email to global config:

```sh
git config --global user.email "SOME_EMAIL@example.com"
```

Set the email for local repo:

```sh
git config user.email "SOME_EMAIL@example.com"
```

---

## Making Changes and Building

Once you have set up the local development environment in your forked repo, we can start development.

### Checkout A New Branch

It is recommended to develop on a new branch, as it will make things easier later when you submit a pull request:

```sh
git checkout -b MY_BRANCH_NAME
```

### Build the Package

Use [nx build](https://nx.dev/nx-api/nx/documents/run) to build the package you want to change:

```sh
npx nx build @electron-rsbuild/core
```

Build all packages:

```sh
pnpm run build
```

---

## Testing

### Add New Tests

If you've fixed a bug or added code that should be tested, then add some tests.

You can add unit test cases in the `<PACKAGE_DIR>/tests` folder. The test runner is based on [Vitest](https://vitest.dev/).

### Run Unit Tests

Before submitting a pull request, it's important to make sure that the changes haven't introduced any regressions or bugs. You can run the unit tests for the project by executing the following command:

```sh
pnpm run ut
```

You can also run the unit tests of single package:

```sh
pnpm run ut packages/core
```

### ~~Run E2E Tests~~

> NOT SUPPORT YET.

You can run the `e2e` command to run E2E tests:

```sh
pnpm run e2e
```

If you need to run a specified test, you can add keywords to filter:

```sh
# Only run test cases which contains `vue` keyword in file path with Rspack
pnpm e2e:rspack vue
# Only run test cases which contains `vue` keyword in test name with Rspack
pnpm e2e:rspack -g vue
```

---

## Linting

To help maintain consistency and readability of the codebase, we use [Biome](https://github.com/biomejs/biome) to lint the codes.

You can run the linters by executing the following command:

```sh
pnpm run lint
```

For VS Code users, you can install the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) to see lints while typing.

---
