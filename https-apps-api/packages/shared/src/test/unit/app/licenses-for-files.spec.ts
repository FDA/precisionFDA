import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { database, getLogger, types } from '@pfda/https-apps-shared'
import { expect } from 'chai'
import { wrap } from '@mikro-orm/core'
import { FilesInput } from 'shared/src/domain/licence/license.input'
import { entities, license, User } from '../../../domain'

describe('licenses for files tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: P.Logger
  let userCtx: types.UserCtx

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }
  })

  it('test get licenses for multiple files', async () => {
    // three files, two of them have the same license
    // operation should return only distinct licenses
    const file1 = create.filesHelper.create(em, { user }, {})
    const file2 = create.filesHelper.create(em, { user }, {})
    const file3 = create.filesHelper.create(em, { user }, {})
    const license1 = create.licenceHelper.create(em, { user }, {})
    const license2 = create.licenceHelper.create(em, { user }, {})
    em.persist(file1)
    em.persist(file2)
    em.persist(file3)
    em.persist(license1)
    em.persist(license2)
    await em.flush()

    const licensedItem1 = wrap(new entities.LicensedItem(license1, file1.id))
      .assign({ licenseableType: 'Node' }, { em })
    em.persist(licensedItem1)
    const licensedItem2 = wrap(new entities.LicensedItem(license1, file2.id))
      .assign({ licenseableType: 'Node' }, { em })
    em.persist(licensedItem2)
    const licensedItem3 = wrap(new entities.LicensedItem(license2, file3.id))
      .assign({ licenseableType: 'Node' }, { em })
    em.persist(licensedItem3)
    await em.flush()

    const op = new license.LicensesForFilesOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    const opInput: FilesInput = { ids: [file1.id, file2.id, file3.id] }
    const result = await op.execute(opInput)

    // unique licenses are 2
    expect(result.length).to.equal(2)
  })
})
