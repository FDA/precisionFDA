import { wrap } from '@mikro-orm/core'
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Uid } from '@shared/domain/entity/domain/uid'
import { LicenseService } from '@shared/domain/license/license.service'
import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'
import { LicensedItemRepository } from '@shared/domain/licensed-item/licensed-item.repository'
import { User } from '@shared/domain/user/user.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { create, db } from '../../../src/test'

describe("licenses for app's assets tests", () => {
  let em: EntityManager<MySqlDriver>
  let user: User

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    await em.flush()
  })

  it('test get licenses for app via assets', async () => {
    const app = create.appHelper.createRegular(em, { user }, { title: 'private-app', scope: 'private' })
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

    const licenseOnAssets = create.licenseHelper.create(em, { user }, { title: 'license for assets' })

    const licensedItemForAsset1 = wrap(new LicensedItem(licenseOnAssets, asset1.id)).assign(
      { licenseableType: 'Node' },
      { em },
    )
    em.persist(licensedItemForAsset1)
    const licensedItemForAsset2 = wrap(new LicensedItem(licenseOnAssets, asset2.id)).assign(
      { licenseableType: 'Node' },
      { em },
    )
    em.persist(licensedItemForAsset2)

    await em.flush()

    const freshEm = database.orm().em.fork() as EntityManager<MySqlDriver>
    const freshLicenseService = new LicenseService(
      freshEm.getRepository(LicensedItem) as LicensedItemRepository,
      freshEm.getRepository(Node) as unknown as NodeRepository,
    )

    const freshApp = await freshEm.findOneOrFail(App, { uid: app.uid })
    await freshApp.assets.init()
    const assetIds = freshApp.assets.getItems().map(asset => asset.id)

    const result = await freshLicenseService.findLicensesForNodeIds(assetIds)

    expect(result.length).to.equal(1)
    expect(result[0].id).to.equal(licenseOnAssets.id)
  })

  it('fail for incorrect app id', async () => {
    const freshEm = database.orm().em.fork() as EntityManager<MySqlDriver>

    try {
      await freshEm.findOneOrFail(App, { uid: 'bullshit' as Uid<'app'> })
      expect.fail('Operation is expected to fail')
    } catch (error: unknown) {
      expect(error.message).to.equal("App not found ({ uid: 'bullshit' })")
    }
  })

  it('user has app with no assets', async () => {
    const app = create.appHelper.createRegular(em, { user }, { title: 'private-app', scope: 'private' })
    await em.flush()

    const freshEm = database.orm().em.fork() as EntityManager<MySqlDriver>
    const freshLicenseService = new LicenseService(
      freshEm.getRepository(LicensedItem) as LicensedItemRepository,
      freshEm.getRepository(Node) as unknown as NodeRepository,
    )

    const freshApp = await freshEm.findOneOrFail(App, { uid: app.uid })
    await freshApp.assets.init()
    const assetIds = freshApp.assets.getItems().map(asset => asset.id)

    const result = await freshLicenseService.findLicensesForNodeIds(assetIds)

    expect(result.length).to.equal(0)
  })
})
