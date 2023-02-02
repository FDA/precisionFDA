import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { wrap } from '@mikro-orm/core'
import { database, getLogger, types } from '../../..'
import { PARENT_TYPE } from '../../../domain/user-file/user-file.types'
import { create, db } from '../..'
import { entities, license, User } from '../../../domain'
import { UidInput } from 'shared/src/types'

describe('licenses for workflow tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: any
  let userCtx: types.UserCtx

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }
  })

  it('test get licenses for workflow apps (stages)', async () => {
    const app1 = create.appHelper.createRegular(
      em,
      { user },
      { title: 'private-app', scope: 'private', uid: 'app-uid-1' },
    )
    const app2 = create.appHelper.createRegular(
      em,
      { user },
      { title: 'private-app', scope: 'private', uid: 'app-uid-2' },
    )
    await em.flush()

    const asset1 = create.assetHelper.create(em, { user }, { parentType: PARENT_TYPE.ASSET })
    const asset2 = create.assetHelper.create(em, { user }, { parentType: PARENT_TYPE.ASSET })
    await em.flush()

    app1.assets.add(asset1)
    asset1.apps.add(app1)
    app2.assets.add(asset2)
    asset2.apps.add(app2)
    await em.flush()

    const license1 = create.licenceHelper.createForAsset(
      em, { user, asset: asset1 },
      { content: 'approval required', title: 'with approval', approvalRequired: true },
    )
    const licensedItem1 = wrap(new entities.LicensedItem(license1, asset1.id))
      .assign({ licenseableType: 'Node' }, { em })
    em.persist(licensedItem1)

    const license2 = create.licenceHelper.createForAsset(
      em, { user, asset: asset2 },
      { content: 'accepted license', title: 'with accepted license', approvalRequired: true },
    )
    const licensedItem2 = wrap(new entities.LicensedItem(license2, asset2.id))
      .assign({ licenseableType: 'Node' }, { em })
    em.persist(licensedItem2)

    await em.flush()

    const spec = '{"input_spec": {"stages": [{"app_uid": "'
      + `${app1.uid}"},{"app_uid": "${app2.uid}"}]}}`

    const workflow = create.workflowHelper.create(em, { user }, { spec })
    em.persist(workflow)
    await em.flush()

    const op = new license.LicensesForWorkflowOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    const appInput: UidInput = { uid: workflow.uid }
    const result = await op.execute(appInput)

    expect(result.length).to.equal(2)
  })
})
