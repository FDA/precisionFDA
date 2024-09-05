import { USER_CONTEXT_HTTP_HEADERS } from '@shared/config/consts'
import { database } from '@shared/database'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import supertest from 'supertest'
import { create, db } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import { testedApp } from '../../index'
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

    const args = []
    fakes.queue.createSyncSpacesPermissionsTask.callsFake((...a) => {
      a[0] = { ...a[0] }
      args.push(a)
    })

    await supertest(testedApp.getHttpServer())
      .post('/account/checkSpacesPermissions')
      .set(userHeaderData)
      .expect(204)

    expect(fakes.queue.createSyncSpacesPermissionsTask.calledOnce).to.be.true()
    const fakeCreateSyncSpacesPermissionsArgs = args[0]
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
