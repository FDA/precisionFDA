import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { database, entities, getLogger, types } from '@pfda/https-apps-shared'
import P from 'pino'
import { User } from 'shared/src/domain'
import { PlatformClient } from '../../../../platform-client'
import { SpaceService } from '../../../../domain/space/service/space.service'
import { SpaceParam } from '../../../../domain/space/service/space.types'
import { SPACE_TYPE } from '../../../../domain/space/space.enum'
import { expect } from 'chai'
import { OrgService } from '../../../../domain/org/service/org.service'

describe('spaces service tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: P.Logger
  let userCtx: types.UserCtx
  let platformClient: PlatformClient
  let orgService: OrgService

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    userCtx = {...user, accessToken: 'foo'}

    platformClient = {
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
    const spaceService = new SpaceService(em, platformClient, orgService)
    const spaceInput: SpaceParam = {
      name: 'space_name',
      description: 'description',
      type: SPACE_TYPE.GROUPS
    }

    const spaceUid = await spaceService.create(spaceInput)
    em.clear()

    const loadedSpace = await em.findOneOrFail(entities.Space, {uid: spaceUid})
    expect(loadedSpace.name).eq('space_name')
  })
})
