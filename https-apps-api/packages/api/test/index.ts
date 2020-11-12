import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import { database } from '@pfda/https-apps-shared'
import { api } from '../src/server'
import { initDeleteProcedure } from './utils/db'
import { mocksRestore, mocksSetup } from './utils/mocks'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

before(async () => {
  mocksSetup()

  await database.start()
  await api.startHttpServer()

  await initDeleteProcedure(database.connection())
})

after(async () => {
  mocksRestore()

  await api.stopServer()
  await database.stop()
})
