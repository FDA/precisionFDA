import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import supertest from 'supertest'
import { database } from '@pfda/https-apps-shared'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { User } from '@pfda/https-apps-shared/src/domain'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { getServer } from '../../../src/server'
import { getDefaultQueryData } from '../../utils/expect-helper'


describe('POST /account/checkSpacesPermissions', () => {
  let em: EntityManager
  let user: User

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em)
    await em.flush()
    mocksReset()
  })

  it('adds createSyncSpacesPermissionsTask to the queue', async () => {
    const userQueryData = getDefaultQueryData(user)

    await supertest(getServer())
      .post('/account/checkSpacesPermissions')
      .query({ ...userQueryData })
      .expect(204)


    expect(fakes.queue.createSyncSpacesPermissionsTask.calledOnce).to.be.true()
    const fakeCreateSyncSpacesPermissionsArgs = fakes.queue.createSyncSpacesPermissionsTask.getCall(0).args
    expect(fakeCreateSyncSpacesPermissionsArgs).to.deep.equal([
      {
        id: user.id,
        accessToken: userQueryData.accessToken,
        dxuser: user.dxuser,
      },
    ])

    // actual task logic is tested in https-apps-api/packages/worker/test/integration/permissions-synchronize.spec.ts
  })
})
