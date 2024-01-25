import { database } from '@shared/database'
import { db } from '@shared/test'
import { mocksRestore, mocksSetup } from '@shared/test/mocks'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import { startWorker } from '../src'
import { mocksRestore as localMocksRestore, mocksSetup as localMocksSetup } from './utils/mocks'

// Handle exception being thrown inside an async test
// This seems to be a flaw in mocha since 8.2.1
// See https://github.com/mochajs/mocha/issues/1128#issuecomment-975324465
//     https://github.com/modernweb-dev/web/issues/1730
//     https://github.com/mochajs/mocha/issues/2640
process.on('uncaughtException', err => {
  console.log({ err }, 'nodejs worker test: uncaughtException')
  throw err
})
process.on('unhandledRejection', err => {
  console.log({ err }, 'nodejs worker test: unhandledRejection')
  throw err
})

chai.use(chaiAsPromised)
chai.use(dirtyChai)

before(async () => {
  mocksSetup()
  localMocksSetup()

  await startWorker()
  await db.initDeleteProcedure(database.connection())
})

after(async () => {
  localMocksRestore()
  mocksRestore()
})
