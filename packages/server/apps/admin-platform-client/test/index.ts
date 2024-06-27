process.env.ADMIN_TOKEN = 'MOCKED_ADMIN_TOKEN'

import { INestApplication } from '@nestjs/common'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import { bootstrap } from '../src/bootstrap'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

export let testedApp: INestApplication

before(async () => {
  testedApp = await bootstrap()
})

after(async () => {
  await testedApp?.close()
})
