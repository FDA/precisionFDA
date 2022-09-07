'use strict'

module.exports = {
  timeout: 10000,
  colors: true,
  checkleaks: true,
  file: './packages/api/test/index.ts',
  require: ['ts-node/register/transpile-only', 'tsconfig-paths/register'],
  exit: true,
}
