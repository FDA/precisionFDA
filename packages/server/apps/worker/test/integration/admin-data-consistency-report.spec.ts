/* eslint-disable max-len */
import { database } from '@shared/database'
import {
  AdminDataConsistencyReportOperation
} from '@shared/debug/ops/admin-data-consistency-report'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { getLogger } from '@shared/logger'
/* eslint-disable no-inline-comments */
/* eslint-disable no-undefined */
import { expect } from 'chai'
import { create, db, generate } from '@shared/test'
import { mocksReset } from '@shared/test/mocks'
import { fakes as queueFakes, mocksReset as queueMocksReset } from '../utils/mocks'
import { EntityManager } from '@mikro-orm/mysql'
import { FILE_STATE_DX, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'


const log = getLogger()

// Very basic tests for now to make sure this queues and runs
describe('TASK: AdminDataConsistencyReportOperation', () => {
  let em: EntityManager
  let adminUser: User
  let user: User
  let app: App
  let fakeNodes: Node[]
  let fakeJobs: Job[]
  let exceedingHostSpace: Space
  let exceedingGuestSpace: Space
  let normalSpace: Space

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = <EntityManager>database.orm().em.fork()
    em.clear()
    adminUser = create.userHelper.createAdmin(em)
    user = create.userHelper.create(em)
    await em.flush()

    const filesParams = {
      parentId: user.id,
      parentType: PARENT_TYPE.USER,
      state: FILE_STATE_DX.CLOSED
    }

    fakeNodes = [
      create.filesHelper.create(em, { user }, { ...filesParams, parentFolderId: 1 }),
      create.filesHelper.create(em, { user }, { ...filesParams, scopedParentFolderId: 1 }),
      create.filesHelper.create(em, { user }, { ...filesParams, parentFolderId: 1, scopedParentFolderId: 0 }),
      create.filesHelper.create(em, { user }, { ...filesParams, parentFolderId: 2, scopedParentFolderId: 1 }),
    ]

    fakeJobs = [
      create.jobHelper.create(em, { user, app }, { state: JOB_STATE.RUNNING }),
      create.jobHelper.create(em, { user, app }, { state: JOB_STATE.DONE }),
      create.jobHelper.create(em, { user, app }, { state: JOB_STATE.RUNNING })
    ]

    const host = create.userHelper.create(em)
    const user1 = create.userHelper.create(em)
    const guest = create.userHelper.create(em)

    exceedingHostSpace = create.spacesHelper.create(em)
    create.spacesHelper.addMember(em, {user: host, space: exceedingHostSpace}, {role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST})
    create.spacesHelper.addMember(em, {user: user1, space: exceedingHostSpace}, {role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST})
    create.spacesHelper.addMember(em, {user: guest, space: exceedingHostSpace}, {role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST})

    exceedingGuestSpace = create.spacesHelper.create(em, generate.space.group())
    create.spacesHelper.addMember(em, {user: host, space: exceedingGuestSpace}, {role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST})
    create.spacesHelper.addMember(em, {user: guest, space: exceedingGuestSpace}, {role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST})
    create.spacesHelper.addMember(em, {user: user1, space: exceedingGuestSpace}, {role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST})

    normalSpace = create.spacesHelper.create(em)
    create.spacesHelper.addMember(em, {user: host, space: normalSpace}, {role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST})
    create.spacesHelper.addMember(em, {user: guest, space: normalSpace}, {role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST})

    await em.flush()
    mocksReset()
    queueMocksReset()
  })

  it('enqueues correctly', async () => {
    await AdminDataConsistencyReportOperation.enqueue()
    expect(queueFakes.addToQueueStub.callCount).to.equal(1)
  })

  it('checkInconsistentSpaces', async () => {
    const op = new AdminDataConsistencyReportOperation({ em, log })
    const output = await op.checkInconsistentSpaces()
    expect(output).to.have.length(2)
  })

  it('checkRunningJobs returns user info', async () => {
    const op = new AdminDataConsistencyReportOperation({ em, log })
    const output = await op.checkRunningJobs()
    expect(output).to.have.length(2)
    expect(output[0].userDxid).to.be.equal(user.dxid)
    expect(output[1].userDxid).to.be.equal(user.dxid)
  })

  it('checkInconsistentNodes', async () => {
    const op = new AdminDataConsistencyReportOperation({ em, log })
    const output = await op.checkInconsistentNodes()
    expect(output).to.have.length(2)
    expect(output[0].parentFolderId).to.not.be.null()
    expect(output[0].scopedParentFolderId).to.not.be.null()
    expect(output[1].parentFolderId).to.not.be.null()
    expect(output[1].scopedParentFolderId).to.not.be.null()
  })

  it('runs', async () => {
    const op = new AdminDataConsistencyReportOperation({ em, log })
    const output = await op.run()
    expect(output).to.not.be.null()
  })
})
