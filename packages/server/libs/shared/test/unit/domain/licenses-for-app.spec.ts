import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { LicensesForAppOperation } from '@shared/domain/license/ops/licenses-for-app'
import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'
import { User } from '@shared/domain/user/user.entity'
import { getLogger } from '@shared/logger'
import { create, db } from '../../../src/test'
import { expect } from 'chai'
import { wrap } from '@mikro-orm/core'
import P from 'pino'
import { PARENT_TYPE } from '../../../src/domain/user-file/user-file.types'
import { UidInput } from '../../../src/types'

describe("licenses for app's assets tests", () => {
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

  it('test get licenses for app via assets', async () => {
    const app = create.appHelper.createRegular(
      em,
      { user },
      { title: 'private-app', scope: 'private' },
    )
    await em.flush()

    const asset1 = create.assetHelper.create(em, { user }, { parentType: PARENT_TYPE.ASSET })
    const asset2 = create.assetHelper.create(em, { user }, { parentType: PARENT_TYPE.ASSET })
    const asset3 = create.assetHelper.create(em, { user }, { parentType: PARENT_TYPE.ASSET })
    await em.flush()

    app.assets.add(asset1)
    app.assets.add(asset2)
    app.assets.add(asset3)
    asset1.apps.add(app)
    asset2.apps.add(app)
    asset3.apps.add(app)

    const licenseOnAssets = create.licenceHelper.create(
      em,
      { user },
      { title: 'license for assets' },
    )

    const licensedItemForAsset1 = wrap(new LicensedItem(licenseOnAssets, asset1.id))
      .assign({ licenseableType: 'Node' }, { em })
    em.persist(licensedItemForAsset1)
    const licensedItemForAsset2 = wrap(new LicensedItem(licenseOnAssets, asset2.id))
      .assign({ licenseableType: 'Node' }, { em })
    em.persist(licensedItemForAsset2)

    await em.flush()

    const op = new LicensesForAppOperation({
      em: database.orm().em.fork() as EntityManager<MySqlDriver>,
      log,
      user: userCtx,
    })

    const appInput: UidInput = { uid: app.uid }
    const result = await op.execute(appInput)

    expect(result.length).to.equal(1)
    expect(result[0].id).to.equal(licenseOnAssets.id)
  })

  it('fail for incorrect app id', async () => {
    const op = new LicensesForAppOperation({
      em: database.orm().em.fork() as EntityManager<MySqlDriver>,
      log,
      user: userCtx,
    })

    try {
      await op.execute({ uid: 'bullshit' })
      expect.fail('Operation is expected to fail')
    } catch (error: any) {
      expect(error.message).to.equal('App not found ({ uid: \'bullshit\' })')
    }
  })

  it('user has app with no assets', async () => {
    const app = create.appHelper.createRegular(
      em,
      { user },
      { title: 'private-app', scope: 'private' },
    )
    await em.flush()

    const op = new LicensesForAppOperation({
      em: database.orm().em.fork() as EntityManager<MySqlDriver>,
      log,
      user: userCtx,
    })

    const appInput: UidInput = { uid: app.uid }
    const result = await op.execute(appInput)

    expect(result.length).to.equal(0)
  })
})
