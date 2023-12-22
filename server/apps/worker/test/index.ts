import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import { database, queue } from '@shared'
import { db } from '@shared/test'
import { mocksRestore, mocksSetup } from '@shared/test/mocks'
import { setupHandlers } from '../src/queues'
import { initLogger } from '../src/utils'
import { mocksSetup as localMocksSetup, mocksRestore as localMocksRestore } from './utils/mocks'

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
  await initLogger()
  mocksSetup()
  localMocksSetup()

  await database.start()
  await setupHandlers()
  await db.initDeleteProcedure(database.connection())
})

after(async () => {
  localMocksRestore()
  mocksRestore()
  // TODO(samuel) solve this somehow
  // uncommenting throws timeout errors, failed to investigate why, as it works locally
  // shouldn't impact test results as redis communication is mocked
  // await queue.disconnectQueues()
  await database.stop()
})
