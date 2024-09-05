import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { User } from '@shared/domain/user/user.entity'
import { getLogger } from '@shared/logger'
import { Logger } from 'nestjs-pino'
import { create, db } from '../../../src/test'
import { PlatformClient } from '@shared/platform-client'
import { OrgService } from '@shared/domain/org/service/org.service'

/**
 * This is just a test in progress.
 * We had to temporarily suspend work on it due to large complexity and lack of time.
 */
describe('spaces service tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let logger: Logger
  let userCtx: UserCtx
  let platformClient: PlatformClient
  let adminClient: PlatformClient
  let orgService: OrgService

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    logger = getLogger()
    await em.flush()
    userCtx = {...user, accessToken: 'foo'}

    platformClient = {
      // TODO add methods
    } as PlatformClient

    adminClient = {
      // TODO add methods
    } as PlatformClient

    // TODO mock orgService
    //@ts-ignore we're not implementing all methods
    orgService = {
      async create(dxid: string, billable: boolean | undefined): Promise<string> {
        return Promise.resolve("");
      }
    }
  })

})
