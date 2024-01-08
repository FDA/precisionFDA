/* eslint-disable no-undefined */
import { EntityManager } from '@mikro-orm/core'
import { database } from '@shared/database'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { getMaintenanceQueue } from '@shared/queue'
import { TASK_TYPE } from '@shared/queue/task.input'
import { expect } from 'chai'
import { create, db } from '@shared/test'
import { UserCtx } from '@shared/types'
import { fakes, mocksReset } from '@shared/test/mocks'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { JobOptions } from 'bull'
import { fakes as queueFakes, mocksReset as queueMocksReset } from '../utils/mocks'

const createSyncSpacesPermissionsTask = async (user: UserCtx) => {
  const defaultQueue = getMaintenanceQueue()
  const options: JobOptions = { jobId: `${TASK_TYPE.SYNC_SPACES_PERMISSIONS}` }

  await defaultQueue.add(
    TASK_TYPE.SYNC_SPACES_PERMISSIONS,
    {
      type: TASK_TYPE.SYNC_SPACES_PERMISSIONS,
      user,
    },
    options,
  )
}

describe('TASK: permissions-synchronize', () => {
  let em: EntityManager
  let user1: User
  let user2: User
  let user3: User

  let userContext: UserCtx
  let space: Space

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()
    user1 = create.userHelper.create(em, { dxuser: 'randall.ebert' })
    user2 = create.userHelper.create(em, { dxuser: 'harry.potter' })
    user3 = create.userHelper.create(em, { dxuser: 'mmaltcev3' })
    space = create.spacesHelper.create(em)

    await em.flush()
    userContext = { id: user1.id, dxuser: user1.dxuser, accessToken: 'fake-token' }

    // reset fakes
    mocksReset()
    queueMocksReset()
  })

  it('processes a queue task - calls the queue handlers', async () => {
    await createSyncSpacesPermissionsTask(userContext)
    expect(queueFakes.addToQueueStub.calledOnce).to.be.true()
  })

  it('checks platform side of a space and does nothing as it matches pFDA', async () => {
    create.spacesHelper.addMember(em, { user: user1, space }, { role: SPACE_MEMBERSHIP_ROLE.LEAD })
    create.spacesHelper.addMember(em, { user: user2, space }, { role: SPACE_MEMBERSHIP_ROLE.ADMIN })
    create.spacesHelper.addMember(
      em,
      {
        user: user3,
        space,
      },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR },
    )
    await em.flush()
    await createSyncSpacesPermissionsTask(userContext)
    expect(fakes.client.orgFindMembersFake.calledOnce).to.be.true()
    expect(fakes.client.inviteUserToOrganizationFake.notCalled).to.be.true()
    expect(fakes.client.removeUserFromOrganizationFake.notCalled).to.be.true()
  })

  it('checks platform side of a space and adds missing users to platform to match pFDA side', async () => {
    create.spacesHelper.addMember(em, { user: user1, space }, { role: SPACE_MEMBERSHIP_ROLE.LEAD })
    create.spacesHelper.addMember(em, { user: user2, space }, { role: SPACE_MEMBERSHIP_ROLE.ADMIN })
    create.spacesHelper.addMember(
      em,
      {
        user: user3,
        space,
      },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR },
    )
    const user4 = create.userHelper.create(em, { dxuser: 'pfda_autotest1' })

    create.spacesHelper.addMember(
      em,
      {
        user: user4,
        space,
      },
      { role: SPACE_MEMBERSHIP_ROLE.VIEWER },
    )

    await em.flush()
    await createSyncSpacesPermissionsTask(userContext)
    expect(fakes.client.orgFindMembersFake.calledOnce).to.be.true()
    expect(fakes.client.inviteUserToOrganizationFake.calledOnce).to.be.true()
    expect(fakes.client.removeUserFromOrganizationFake.notCalled).to.be.true()

    const inviteUserCallArgs = fakes.client.inviteUserToOrganizationFake.getCall(0).args[0]
    expect(inviteUserCallArgs.data.invitee).to.be.equal('user-pfda_autotest1')
  })

  it('checks platform side of a space and does not remove members from platform to match pFDA side', async () => {
    create.spacesHelper.addMember(em, { user: user1, space }, { role: SPACE_MEMBERSHIP_ROLE.LEAD })
    create.spacesHelper.addMember(em, { user: user2, space }, { role: SPACE_MEMBERSHIP_ROLE.ADMIN })

    await em.flush()
    await createSyncSpacesPermissionsTask(userContext)
    expect(fakes.client.orgFindMembersFake.calledOnce).to.be.true()
    expect(fakes.client.inviteUserToOrganizationFake.notCalled).to.be.true()
    expect(fakes.client.removeUserFromOrganizationFake.notCalled).to.be.true()

    em.clear()
    const fixedSpace = await em.findOne(Space, { id: space.id }, {})

    await fixedSpace.spaceMemberships.loadItems()
    expect(fixedSpace.spaceMemberships.getItems().length).to.be.eq(2)
  })
})
