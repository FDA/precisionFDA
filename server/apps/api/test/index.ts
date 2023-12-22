import { database, queue } from '@shared'
import { db, mocks } from '@shared/test'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import { createServer } from '../src/server'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

const server = createServer()

before(async () => {
  mocks.mocksSetup()

  await database.start()
  await queue.createQueues()
  await server.startHttpServer()

  await db.initDeleteProcedure(database.connection())
})

after(async () => {
  mocks.mocksRestore()

  await server.stopServer()
  await database.stop()
})
