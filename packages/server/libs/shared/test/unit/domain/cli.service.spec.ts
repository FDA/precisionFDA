import { EntityManager, MySqlDriver, SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { User } from '@shared/domain/user/user.entity'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { PlatformClient } from '@shared/platform-client'
import { EntityLinkService } from '@shared/domain/entity/entity-link/entity-link.service'
import { database } from '@shared/database'
import { create } from '@shared/test'
import { CliService } from '@shared/domain/cli/service/cli.service'

describe('CliService tests', () => {
  let em: SqlEntityManager<MySqlDriver>
  let user: User
  let userCtx: UserCtx
  let discussionService: DiscussionService
  let entityLinkService: EntityLinkService
  let fetcher: EntityFetcherService
  let client: PlatformClient
  let cliService: CliService

  beforeEach(() => {
    em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    const accessToken = 'accessToken'
    userCtx = new UserContext(user.id, accessToken, user.dxuser, null)
    discussionService = null // new DiscussionService()
    entityLinkService = null // new EntityLinkService()
    fetcher = new EntityFetcherService(em, userCtx)
    client = new PlatformClient({ accessToken })

    cliService = new CliService(em, userCtx, fetcher, discussionService, client, entityLinkService)
  })

  it('should be defined', () => {
    expect(cliService).to.be.not.undefined
  })
})
