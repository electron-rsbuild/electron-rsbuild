import fs from 'node:fs'
import {createRequire} from 'node:module'
import os from 'node:os'
import path from 'node:path'

interface PackageData {
  main?: string
  type?: 'module' | 'commonjs'
  dependencies?: Record<string, string>
}

let packageCached: PackageData | null = null

export function loadPackageData(root = process.cwd()): PackageData | null {
  if (packageCached) return packageCached
  const pkg = path.join(root, 'package.json')
  if (fs.existsSync(pkg)) {
    const _require = createRequire(import.meta.url)
    const data = _require(pkg)
    packageCached = {
      main: data.main,
      type: data.type,
      dependencies: data.dependencies,
    }
    return packageCached
  }
  return null
}

export const isWindows = os.platform() === 'win32'
