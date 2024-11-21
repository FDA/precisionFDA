import { EntityManager } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { User } from '@shared/domain/user/user.entity'
import { create, db } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import { expect } from 'chai'
import supertest from 'supertest'
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
    create.sessionHelper.create(em, { user })
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
        accessToken: 'fake-token',
        dxuser: user.dxuser,
        sessionId: `session-id-${user.dxuser}`,
      },
    ])

    // actual task logic is tested in server/libs/worker/test/integration/permissions-synchronize.spec.ts
  })
})
