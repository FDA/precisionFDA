import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import supertest from 'supertest'
import { database, USER_CONTEXT_HTTP_HEADERS } from '@shared'
import { create, db } from '@shared/test'
import { User } from '@shared/domain'
import { fakes, mocksReset } from '@shared/test/mocks'
import { getServer } from '../../../src/server'
import { getDefaultHeaderData } from '../../utils/expect-helper'


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
    const userHeaderData = getDefaultHeaderData(user)

    await supertest(getServer())
      .post('/account/checkSpacesPermissions')
      .set(userHeaderData)
      .expect(204)


    expect(fakes.queue.createSyncSpacesPermissionsTask.calledOnce).to.be.true()
    const fakeCreateSyncSpacesPermissionsArgs = fakes.queue.createSyncSpacesPermissionsTask.getCall(0).args
    expect(fakeCreateSyncSpacesPermissionsArgs).to.deep.equal([
      {
        id: user.id,
        accessToken: userHeaderData[USER_CONTEXT_HTTP_HEADERS.accessToken],
        dxuser: user.dxuser,
      },
    ])

    // actual task logic is tested in server/libs/worker/test/integration/permissions-synchronize.spec.ts
  })
})
