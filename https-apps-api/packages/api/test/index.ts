import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import { database } from '@pfda/https-apps-shared'
import { db, mocks } from '@pfda/https-apps-shared/src/test'
import { api } from '../src/server'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

before(async () => {
  mocks.mocksSetup()

  await database.start()
  await api.startHttpServer()

  await db.initDeleteProcedure(database.connection())
})

after(async () => {
  mocks.mocksRestore()

  await api.stopServer()
  await database.stop()
})
