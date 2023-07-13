import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { database, getLogger } from '@pfda/https-apps-shared'
import { expect } from 'chai'
import P from 'pino'
import { User } from '@pfda/https-apps-shared/src/domain'
import { UserService } from '@pfda/https-apps-shared/src/domain/user'
import { UserCtx, UserOpsCtx } from '../../../types'

describe('user service tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: P.Logger
  let ctx: UserOpsCtx
  let userService: UserService

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    let userCtx = {
      id: user.id,
      accessToken: 'foo',
      dxuser: user.dxuser,
    } as UserCtx
    ctx = {
      user: userCtx,
      log,
      em,
    } as UserOpsCtx

    userService = new UserService(ctx)
  })

  it('test list active user names', async () => {
    create.userHelper.create(em, {dxuser: 'user1', userState: 1})
    create.userHelper.create(em, {dxuser: 'user2', userState: 0})
    create.userHelper.create(em, {dxuser: 'user3', userState: 0})

    const result = await userService.listActiveUserNames()
    expect(result.length).eq(3) // one user created for test cases and two in it block
  })

  it('test list government user names', async () => {
    create.userHelper.create(em, {dxuser: 'gov-user1', userState: 0, email: 'user1@fda.hhs.gov'})
    create.userHelper.create(em, {dxuser: 'gov-user2', userState: 0, email: 'user2@fda.hhs.gov'})

    const result = await userService.listGovernmentUserNames()
    expect(result.length).eq(2)
    expect(result[0]).eq('gov-user1')
    expect(result[1]).eq('gov-user2')
  })
})
