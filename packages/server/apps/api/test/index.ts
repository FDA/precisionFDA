import { INestApplication } from '@nestjs/common'
import { database } from '@shared/database'
import { db, mocks } from '@shared/test'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import { bootstrap } from '../src/bootstrap'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

export let testedApp: INestApplication

before(async () => {
  mocks.mocksSetup()
  testedApp = await bootstrap()

  await db.initDeleteProcedure(database.connection())
})

after(async () => {
  await testedApp?.close()
  mocks.mocksRestore()
})
