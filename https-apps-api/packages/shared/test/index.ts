import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import { database, getLogger } from '@pfda/https-apps-shared'
import { db } from 'shared/src/test'
import { mocksRestore, mocksSetup } from 'shared/src/test/mocks'

const log = getLogger()

// Handle exception being thrown inside an async test
// This seems to be a flaw in mocha since 8.2.1
// See https://github.com/mochajs/mocha/issues/1128#issuecomment-975324465
//     https://github.com/modernweb-dev/web/issues/1730
//     https://github.com/mochajs/mocha/issues/2640
process.on('uncaughtException', err => {
  log.info({ err }, 'nodejs worker test: uncaughtException')
  throw err
})
process.on('unhandledRejection', err => {
  log.info({ err }, 'nodejs worker test: unhandledRejection')
  throw err
})

chai.use(chaiAsPromised)
chai.use(dirtyChai)

before(async () => {
  mocksSetup()

  await database.start()
  await db.initDeleteProcedure(database.connection())
})

after(async () => {
  mocksRestore()
  await database.stop()
})
