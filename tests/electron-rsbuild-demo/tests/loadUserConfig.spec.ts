import { loadConfig } from '@rsbuild/core'
// import { describe } from 'vitest'

const loadConfigData = await loadConfig({
  cwd: 'F:/Github/veaba/electron-rsbuild/tests/electron-rsbuild-demo',
  path: 'electron.rsbuild.config.ts'
})
// const loadConfigData= await loadConfig();

console.log('loadConfigData=>', loadConfigData) // -> Rsbuild config object

// const rsbuild = await createRsbuild({
//   rsbuildConfig: loadConfigData.content,
// });

const { content } = loadConfigData
console.log('loadConfigData 1=>', content) // -> Rsbuild config object
// console.log('loadConfigData 2=>', content.plugins) // -> Rsbuild config object
// })
