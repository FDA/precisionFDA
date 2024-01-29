import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { LicensesForFilesOperation } from '@shared/domain/license/ops/licenses-for-files'
import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'
import { User } from '@shared/domain/user/user.entity'
import { getLogger } from '@shared/logger'
import { create, db } from '../../../src/test'
import { expect } from 'chai'
import { wrap } from '@mikro-orm/core'
import { FilesInput } from '../../../src/domain/license/license.input'
import P from 'pino'

describe('licenses for files tests', () => {
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

    const licensedItem1 = wrap(new LicensedItem(license1, file1.id))
      .assign({ licenseableType: 'Node' }, { em })
    em.persist(licensedItem1)
    const licensedItem2 = wrap(new LicensedItem(license1, file2.id))
      .assign({ licenseableType: 'Node' }, { em })
    em.persist(licensedItem2)
    const licensedItem3 = wrap(new LicensedItem(license2, file3.id))
      .assign({ licenseableType: 'Node' }, { em })
    em.persist(licensedItem3)
    await em.flush()

    const op = new LicensesForFilesOperation({
      em: database.orm().em.fork() as EntityManager<MySqlDriver>,
      log,
      user: userCtx,
    })

    const opInput: FilesInput = { ids: [file1.id, file2.id, file3.id] }
    const result = await op.execute(opInput)

    // unique licenses are 2
    expect(result.length).to.equal(2)
  })
})
