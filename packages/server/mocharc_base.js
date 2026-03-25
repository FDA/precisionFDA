/* global process, __dirname, require, module */
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/explicit-function-return-type */
'use strict'
process.env.NODE_ENV = 'ci_test'
process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  module: 'CommonJS',
  moduleResolution: 'node',
})
process.chdir(__dirname)
const fs = require('fs')

const getConfig = (packagePath) => {
  const configForIDETestsTs = './test/index.ts'
  const configForCIJs = `${packagePath}/test/index.js`
  const configForCITs = `${packagePath}/test/index.ts`

  const candidates = [configForIDETestsTs, configForCIJs]
  let file = configForCITs

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      file = candidate
      break
    }
  }

  return {
    timeout: 60000,
    colors: true,
    checkleaks: true,
    file,
    require: ['ts-node/register/transpile-only', 'tsconfig-paths/register'],
    exit: true,
  }
}

module.exports = getConfig
