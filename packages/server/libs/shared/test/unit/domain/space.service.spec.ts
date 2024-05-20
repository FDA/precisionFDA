import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { entities } from '@shared/database/entities'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { getLogger } from '@shared/logger'
import { create, db } from '../../../src/test'
import P from 'pino'
import { PlatformClient } from '../../../src/platform-client'
import { SpaceService } from '../../../src/domain/space/service/space.service'
import { SpaceParam } from '../../../src/domain/space/service/space.types'
import { SPACE_TYPE } from '../../../src/domain/space/space.enum'
import { expect } from 'chai'
import { OrgService } from '../../../src/domain/org/service/org.service'

/**
 * This is just a test in progress.
 * We had to temporarily suspend work on it due to large complexity and lack of time.
 */
describe('spaces service tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: P.Logger
  let userCtx: UserCtx
  let platformClient: PlatformClient
  let adminClient: PlatformClient
  let orgService: OrgService

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    log = getLogger()
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

  it('test create space', async () => {
    const spaceService = new SpaceService(em, platformClient, adminClient, orgService)
    const spaceInput: SpaceParam = {
      name: 'space_name',
      description: 'description',
      type: SPACE_TYPE.GROUPS
    }

    const spaceId = await spaceService.create(spaceInput)
    em.clear()

    const loadedSpace = await em.findOneOrFail(Space, {id: spaceId})
    expect(loadedSpace.name).eq('space_name')
  })
})
