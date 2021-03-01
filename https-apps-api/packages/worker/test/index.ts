import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import { database, queue } from '@pfda/https-apps-shared'
import { db } from '@pfda/https-apps-shared/src/utils/test'
import { mocksRestore, mocksSetup } from '@pfda/https-apps-shared/src/utils/test/mocks'
import { setupHandlers } from '../src/queues'
import { mocksSetup as localMocksSetup, mocksRestore as localMocksRestore } from './utils/mocks'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

before(async () => {
  mocksSetup()
  localMocksSetup()

  await database.start()
  await setupHandlers()
  await db.initDeleteProcedure(database.connection())
})

after(async () => {
  localMocksRestore()
  mocksRestore()
  await queue.disconnectQueues()
  await database.stop()
})
