import { INestApplicationContext } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { exposeOrm } from '@shared/app-initialization'
import { database } from '@shared/database'
import { DatabaseModule } from '@shared/database/database.module'
import { getLogger } from '@shared/logger'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import dirtyChai from 'dirty-chai'
import { db } from '../src/test'
import { mocksRestore, mocksSetup } from '../src/test/mocks'

const log = getLogger()

// Handle exception being thrown inside an async test
// This seems to be a flaw in mocha since 8.2.1
// See https://github.com/mochajs/mocha/issues/1128#issuecomment-975324465
//     https://github.com/modernweb-dev/web/issues/1730
//     https://github.com/mochajs/mocha/issues/2640
process.on('uncaughtException', err => {
  log.log('nodejs worker test: uncaughtException', err.stack)
  throw err
})
process.on('unhandledRejection', (err: Error) => {
  log.log('nodejs worker test: unhandledRejection', err.stack)
  throw err
})

chai.use(chaiAsPromised)
chai.use(dirtyChai)

let app: INestApplicationContext

before(async () => {
  mocksSetup()

  app = await NestFactory.create(DatabaseModule)
  app.enableShutdownHooks()
  exposeOrm(app)

  await db.initDeleteProcedure(database.connection())
})

after(async () => {
  await app.close()
  mocksRestore()
})
