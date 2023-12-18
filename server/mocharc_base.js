'use strict'

const fs = require('fs')

const getConfig = (packagePath) => {
  const configForIDETests = './test/index.ts'
  const configForCI = `${packagePath}/test/index.ts`

  return {
    timeout: 60000,
    colors: true,
    checkleaks: true,
    file: fs.existsSync(configForIDETests) ? configForIDETests : configForCI,
    require: ['ts-node/register/transpile-only', 'tsconfig-paths/register'],
    exit: true,
  }
}

module.exports = getConfig
