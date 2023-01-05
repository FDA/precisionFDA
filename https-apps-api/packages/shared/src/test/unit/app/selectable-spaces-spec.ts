import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { database, getLogger, types } from '@pfda/https-apps-shared'
import { expect } from 'chai'
import P from 'pino'
import { UidInput } from 'shared/src/types'
import { app, User } from 'shared/src/domain'

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

  it('test app has no selectable spaces', async () => {
    // create test app
    const privateApp = create.appHelper.createRegular(em, { user }, { title: 'private-app', scope: 'private' })
    const appWithUnknownSpaceType = create.appHelper.createWithSpace(
      em, { user }, {
        title: 'private-app',
        scope: 'private',
      },
      { name: 'space-in-review', type: 3, description: 'desc', hostDxOrg: 'hostDxOrg' },
    ) // space type that doesn't fit anything

    await em.flush()

    const op = new app.SelectableSpacesOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    const privateAppInput: UidInput = { uid: privateApp.uid }
    const privateAppResult = await op.execute(privateAppInput)
    expect(privateAppResult.length).to.equal(0)

    const unknownInput: UidInput = { uid: appWithUnknownSpaceType.uid }
    const unknownResult = await op.execute(unknownInput)
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

    const op = new app.SelectableSpacesOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    const scopedAppInput: UidInput = { uid: scopedApp.uid }
    const scopedAppResult = await op.execute(scopedAppInput)

    // both spaces must appear in results
    expect(scopedAppResult.length).to.equal(2)
  })

  it('test fails for non nexistent app id', async () => {
    const op = new app.SelectableSpacesOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    try {
      await op.execute({ uid: 'bullshit' })
      expect.fail('Operation is expected to fail')
    } catch (error) {
      expect(error.message).to.equal('App not found ({ uid: \'bullshit\' })')
    }
  })
})
