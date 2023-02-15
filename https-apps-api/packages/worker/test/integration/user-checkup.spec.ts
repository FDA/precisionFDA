/* eslint-disable no-undefined */
import { EntityManager } from '@mikro-orm/mysql'
import { database, queue } from '@pfda/https-apps-shared'
import { App, User } from '@pfda/https-apps-shared/src/domain'
import { expect } from 'chai'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { UserCtx } from '@pfda/https-apps-shared/src/types'
import { fakes as queueFakes, mocksReset as queueMocksReset } from '../utils/mocks'
import { FILE_STATE, FILE_STATE_DX, PARENT_TYPE } from '@pfda/https-apps-shared/src/domain/user-file/user-file.types'

const createUserCheckupTask = async (user: UserCtx) => {
  const defaultTestQueue = queue.getStatusQueue()
  await defaultTestQueue.add({
    type: queue.types.TASK_TYPE.USER_CHECKUP,
    user,
  })
}

describe('TASK: user-checkup', () => {
  let em: EntityManager
  let user: User
  let userContext: UserCtx
  let regularApp: App
  let httpsApp: App

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager
    em.clear()
    user = create.userHelper.createAdmin(em)
    regularApp = create.appHelper.createRegular(em, { user })
    httpsApp = create.appHelper.createHTTPS(em, { user })
    await em.flush()
    userContext = { id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' }

    // reset fakes
    mocksReset()
    queueMocksReset()
  })

  it('processes a queue task - calls the queue handlers', async () => {
    await createUserCheckupTask(userContext)
    expect(queueFakes.addToQueueStub.calledOnce).to.be.true()
  })

  it('adds job sync tasks for HTTPS apps but not regular apps to the queue', async () => {
    const job1 = create.jobHelper.create(em, { user, app: regularApp }, {
      state: JOB_STATE.IDLE,
    })
    const job2 = create.jobHelper.create(em, { user, app: httpsApp }, {
      state: JOB_STATE.IDLE,
    })
    const job3 = create.jobHelper.create(em, { user, app: regularApp }, {
      state: JOB_STATE.TERMINATING,
    })
    const job4 = create.jobHelper.create(em, { user, app: httpsApp }, {
      state: JOB_STATE.RUNNING,
    })
    const job5 = create.jobHelper.create(em, { user, app: regularApp }, {
      state: JOB_STATE.RUNNING,
    })
    const job6 = create.jobHelper.create(em, { user, app: httpsApp }, {
      state: JOB_STATE.TERMINATED,
    })
    await em.flush()

    fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })

    await createUserCheckupTask(userContext)

    // Only non-terminated HTTPS jobs should result in task creation
    // In this case only job2 and job4
    expect(fakes.queue.createSyncJobStatusTaskFake.callCount).to.equal(2)

    const [payload1, userCtx] = fakes.queue.createSyncJobStatusTaskFake.getCall(0).args
    expect(payload1).to.have.property('dxid', job2.dxid)
    expect(userCtx).to.have.property('dxuser', user.dxuser)

    const [payload, _] = fakes.queue.createSyncJobStatusTaskFake.getCall(1).args
    expect(payload).to.have.property('dxid', job4.dxid)
  })

  it('ignores jobs that have sync tasks already there', async () => {
    const job1 = create.jobHelper.create(em, { user, app: httpsApp }, {
      state: JOB_STATE.RUNNING,
    })
    const job2 = create.jobHelper.create(em, { user, app: httpsApp }, {
      state: JOB_STATE.RUNNING,
    })
    const job3 = create.jobHelper.create(em, { user, app: httpsApp }, {
      state: JOB_STATE.TERMINATING,
    })
    const job4 = create.jobHelper.create(em, { user, app: httpsApp }, {
      state: JOB_STATE.TERMINATING,
    })
    await em.flush()

    fakes.queue.findRepeatableFake.onCall(0).returns(undefined)
    fakes.queue.findRepeatableFake.onCall(1).returns(generate.bullQueue.syncJobStatus(job2.dxid, userContext))
    fakes.queue.findRepeatableFake.onCall(2).returns(undefined)
    fakes.queue.findRepeatableFake.onCall(3).returns(generate.bullQueue.syncJobStatus(job4.dxid, userContext))

    await createUserCheckupTask(userContext)

    expect(fakes.queue.createSyncJobStatusTaskFake.callCount).to.equal(2)

    const [payload1] = fakes.queue.createSyncJobStatusTaskFake.getCall(0).args
    expect(payload1).to.have.property('dxid', job1.dxid)
    const [payload2] = fakes.queue.createSyncJobStatusTaskFake.getCall(1).args
    expect(payload2).to.have.property('dxid', job3.dxid)
  })

  it('does not add SyncFilesStateTask if user has no open files', async () => {
    const params = {
      parentId: user.id,
      parentType: PARENT_TYPE.USER,
      state: FILE_STATE_DX.CLOSED,
    }
    create.filesHelper.create(em, { user }, { name: 'file1', ...params })
    create.filesHelper.create(em, { user }, { name: 'file2', ...params })
    await em.flush()

    await createUserCheckupTask(userContext)

    expect(fakes.queue.createSyncFilesStateTask.callCount).to.equal(0)
  })

  it('adds SyncFilesStateTask if user has an open file', async () => {
    const params = {
      parentId: user.id,
      parentType: PARENT_TYPE.USER,
      state: FILE_STATE_DX.OPEN,
    }
    create.filesHelper.create(em, { user }, { name: 'file1', ...params })
    await em.flush()

    await createUserCheckupTask(userContext)

    expect(fakes.queue.createSyncFilesStateTask.callCount).to.equal(1)
  })

  it('adds SyncFilesStateTask if user has an open asset', async () => {
    const params = {
      parentId: user.id,
      parentType: PARENT_TYPE.USER,
      state: FILE_STATE_DX.OPEN,
    }
    create.filesHelper.create(em, { user }, { name: 'asset1', ...params })
    await em.flush()

    await createUserCheckupTask(userContext)

    expect(fakes.queue.createSyncFilesStateTask.callCount).to.equal(1)
  })

  it('does not add SyncFilesStateTask if a task already exists', async () => {
    const params = {
      parentId: user.id,
      parentType: PARENT_TYPE.USER,
      state: FILE_STATE_DX.OPEN,
    }
    create.filesHelper.create(em, { user }, { name: 'file1', ...params })
    await em.flush()

    fakes.queue.findRepeatableFake.callsFake(() => generate.bullQueueRepeatable.syncFilesState(user.dxuser))

    await createUserCheckupTask(userContext)

    expect(fakes.queue.createSyncFilesStateTask.callCount).to.equal(0)
  })
})
