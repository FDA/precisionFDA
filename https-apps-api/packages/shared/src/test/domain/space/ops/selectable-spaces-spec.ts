import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { database, getLogger, types } from '@pfda/https-apps-shared'
import { expect } from 'chai'
import P from 'pino'
import { space, User } from 'shared/src/domain'

describe('selectable spaces tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: P.Logger
  let userCtx: types.UserCtx

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }
  })

  it('test unsupported space type', async () => {
    const unsupportedSpace = create.spacesHelper.create(em, { name: "space", type: 6 })
    await em.flush()
    create.appHelper.createRegular(
      em, { user }, {
        title: 'private-app',
        scope: `scope-${unsupportedSpace.id}`,
      }
    )
    await em.flush()

    const op = new space.SelectableSpacesOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })
    const unknownResult = await op.execute(unsupportedSpace.id)
    expect(unknownResult.length).to.equal(0)
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

    const op = new space.SelectableSpacesOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    const scopedAppResult = await op.execute(masterSpace.id)

    // both spaces must appear in results
    expect(scopedAppResult.length).to.equal(2)
  })

})
