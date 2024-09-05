import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { SelectableSpacesOperation } from '@shared/domain/space/ops/selectable-spaces'
import { User } from '@shared/domain/user/user.entity'
import { getLogger } from '@shared/logger'
import { create, db } from '../../../src/test'
import { expect } from 'chai'
import P from 'pino'

describe('selectable spaces tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: P.Logger
  let userCtx: UserCtx

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }
  })

  it('test app has selectable spaces with confidential space', async () => {
    const masterSpace = create.spacesHelper.create(em, { name: 'master-space' })
    await em.flush()
    create.spacesHelper.addMember(em, { user, space: masterSpace })
    const confidentialSpace = create.spacesHelper.create(em, { name: 'confidential-space', spaceId: masterSpace.id })
    await em.flush()
    create.spacesHelper.addMember(em, { user, space: confidentialSpace })
    const scopedApp = create.appHelper.createRegular(em, { user }, { title: 'private-app', scope: `space-${masterSpace.id}` })
    await em.flush()

    const op = new SelectableSpacesOperation({
      em: database.orm().em.fork() as EntityManager<MySqlDriver>,
      log,
      user: userCtx,
    })

    const scopedAppResult = await op.execute(masterSpace.id)

    // both spaces must appear in results
    expect(scopedAppResult.length).to.equal(2)
  })

})
