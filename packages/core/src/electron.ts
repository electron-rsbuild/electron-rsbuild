import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { type ChildProcess, spawn } from 'node:child_process';
import { loadPackageData } from './utils';

// const _require = createRequire(import.meta.url)
// TODO
// const projectPath = `file://${process.cwd()}/tests/electron-rsbuild-demo/` 外部执行~
const projectPath = `file://${process.cwd()}/`;

console.log('路径==>projectPath=>', projectPath);
const _require2 = createRequire(projectPath);

const chromeVer: Record<string, string> = {
  '32': '128',
  '31': '126',
  '30': '124',
  '29': '122',
  '28': '120',
  '27': '118',
  '26': '116',
  '25': '114',
  '24': '112',
  '23': '110',
  '22': '108',
  '21': '106',
  '20': '104',
  '19': '102',
  '18': '100',
  '17': '98',
  '16': '96',
  '15': '94',
  '14': '93',
  '13': '91',
};
const nodeVer: Record<string, string> = {
  '32': '20.16',
  '31': '20.14',
  '30': '20.11',
  '29': '20.9',
  '28': '18.18',
  '27': '18.17',
  '26': '18.16',
  '25': '18.15',
  '24': '18.14',
  '23': '18.12',
  '22': '16.17',
  '21': '16.16',
  '20': '16.15',
  '19': '16.14',
  '18': '16.13',
  '17': '16.13',
  '16': '16.9',
  '15': '16.5',
  '14': '14.17',
  '13': '14.17',
};

const ensureElectronEntryFile = (root = process.cwd()): void => {
  if (process.env.ELECTRON_ENTRY) return;
  const pkg = loadPackageData();
  if (pkg) {
    if (!pkg.main) {
      throw new Error('No entry point found for electron app, please add a "main" field to package.json');
    } else {
      const entryPath = path.resolve(root, pkg.main);
      if (!fs.existsSync(entryPath)) {
        throw new Error(`No electron app entry file found: ${entryPath}`);
      }
    }
  } else {
    throw new Error('Not found: package.json');
  }
};
// TODO dev 下也会生成 out/main/index.js
// TODO dev 下也会生成 out/preload/index.js

const getElectronMajorVer = (): string => {
  let majorVer = process.env.ELECTRON_MAJOR_VER || '';
  if (!majorVer) {
    const pkgPath = _require2.resolve('electron/package.json');
    if (fs.existsSync(pkgPath)) {
      const { version } = _require2(pkgPath);
      majorVer = version.split('.')[0];

      console.log('majorVer=>', majorVer);
      process.env.ELECTRON_MAJOR_VER = majorVer;
    }
  }
  return majorVer;
};

export function supportESM(): boolean {
  console.log('执行 supportESM');
  const majorVer = getElectronMajorVer();
  return parseInt(majorVer) >= 28;
}

export function getElectronMajorVersion(): number {
  const majorVer = getElectronMajorVer();
  return parseInt(majorVer);
}

export function getElectronPath(): string {
  let electronExecPath = process.env.ELECTRON_EXEC_PATH || '';
  if (!electronExecPath) {
    const electronModulePath = path.dirname(_require2.resolve('electron'));
    const pathFile = path.join(electronModulePath, 'path.txt');
    let executablePath;
    if (fs.existsSync(pathFile)) {
      executablePath = fs.readFileSync(pathFile, 'utf-8');
    }
    if (executablePath) {
      electronExecPath = path.join(electronModulePath, 'dist', executablePath);
      process.env.ELECTRON_EXEC_PATH = electronExecPath;
    } else {
      throw new Error('Electron uninstall');
    }
  }
  return electronExecPath;
}

export function getElectronNodeTarget(): string {
  const electronVer = getElectronMajorVer();

  if (electronVer && parseInt(electronVer) > 10) {
    let target = nodeVer[electronVer];
    if (!target) target = Object.values(nodeVer).reverse()[0];
    return 'node' + target;
  }
  return '';
}

export function getElectronChromeTarget(): string {
  const electronVer: string = getElectronMajorVer();

  if (electronVer && parseInt(electronVer) > 10) {
    let target: string = chromeVer[electronVer] as string;
    if (!target) target = Object.values(chromeVer).reverse()[0];
    return 'chrome' + target;
  }
  return '';
}

export function startElectron(root: string | undefined, flag?:number): ChildProcess {

  console.log("flag=>", flag)
  ensureElectronEntryFile(root);

  const electronPath = getElectronPath();

  console.log('electron 路径=>', electronPath);

  const isDev = process.env.NODE_ENV_ELECTRON_RSBUILD === 'development';

  const args: string[] = process.env.ELECTRON_CLI_ARGS ? JSON.parse(process.env.ELECTRON_CLI_ARGS) : [];

  if (!!process.env.REMOTE_DEBUGGING_PORT && isDev) {
    args.push(`--remote-debugging-port=${process.env.REMOTE_DEBUGGING_PORT}`);
  }

  if (!!process.env.V8_INSPECTOR_PORT && isDev) {
    args.push(`--inspect=${process.env.V8_INSPECTOR_PORT}`);
  }

  if (!!process.env.V8_INSPECTOR_BRK_PORT && isDev) {
    args.push(`--inspect-brk=${process.env.V8_INSPECTOR_BRK_PORT}`);
  }

  if (process.env.NO_SANDBOX === '1') {
    args.push('--no-sandbox');
  }

  const entry = process.env.ELECTRON_ENTRY || '.';
  const ps = spawn(electronPath, [entry].concat(args), { stdio: 'inherit' });
  ps.on('close', process.exit);
  return ps;
}
