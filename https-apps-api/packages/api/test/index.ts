import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import { database } from '@pfda/https-apps-shared'
import { db, mocks } from '@pfda/https-apps-shared/src/test'
import { createServer } from '../src/server'
import { createApp } from 'api/src/server/app'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

const server = createServer(createApp().callback())

before(async () => {
  mocks.mocksSetup()

  await database.start()
  await server.startHttpServer()

  await db.initDeleteProcedure(database.connection())
})

after(async () => {
  mocks.mocksRestore()

  await server.stopServer()
  await database.stop()
})
