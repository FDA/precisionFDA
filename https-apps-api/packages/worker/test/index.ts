import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import { database, queue } from '@pfda/https-apps-shared'
import { setupHandlers } from '../src/queues'
import { initDeleteProcedure } from './utils/db'
import { mocksRestore, mocksSetup } from './utils/mocks'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

before(async () => {
  mocksSetup()

  await database.start()
  await setupHandlers()
  await initDeleteProcedure(database.connection())
})

after(async () => {
  mocksRestore()
  await queue.disconnectQueues()
  await database.stop()
})
