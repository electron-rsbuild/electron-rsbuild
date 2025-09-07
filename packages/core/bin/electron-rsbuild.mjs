#!/usr/bin/env node

const debugIndex = process.argv.findIndex((arg) => /^(?:-d|--debug)$/.test(arg))
const filterIndex = process.argv.findIndex((arg) => /^(?:-f|--filter)$/.test(arg))

if (debugIndex > 0) {
  let value = process.argv[debugIndex + 1]
  if (!value || value.startsWith('-')) {
    value = 'rsbuild:*'
  } else {
    value = value
      .split(',')
      .map((v) => `rsbuild:${v}`)
      .join(',')
  }
  process.env.DEBUG = `${process.env.DEBUG ? `${process.env.DEBUG},` : ''}${value}`

  if (filterIndex > 0) {
    const filter = process.argv[filterIndex + 1]
    if (filter && !filter.startsWith('-')) {
      // TODO
      process.env.RSBUILD_DEBUG_FILTER = filter
    }
  }
}

function run() {
  import('../dist/cli.js')
  // import('../src/cli.cjs');
}

run()
