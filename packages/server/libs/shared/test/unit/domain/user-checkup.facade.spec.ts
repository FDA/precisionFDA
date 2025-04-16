import type { EntityManager } from '@mikro-orm/mysql'
import { config } from '@shared/config'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { STATUS as DB_CLUSTER_STATUS } from '@shared/domain/db-cluster/db-cluster.enum'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { FILE_STATE_DX, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { User } from '@shared/domain/user/user.entity'
import { UserCheckupFacade } from '@shared/facade/user/user-checkup.facade'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { TASK_TYPE } from '@shared/queue/task.input'
import { create, db, generate } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import type { UserCtx } from '@shared/types'
import { Job } from 'bull'
import { expect } from 'chai'
import { stub, useFakeTimers } from 'sinon'

describe('UserCheckupFacade', () => {
  let em: EntityManager
  let user: User
  let userContext: UserCtx
  let regularApp: App
  let httpsApp: App

  const job = { data: { type: TASK_TYPE.USER_CHECKUP, user: userContext } } as Job

  const createUserDataConsistencyReportJobTaskStub = stub()
  const createSyncFilesStateTaskStub = stub()

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager
    em.clear()
    user = create.userHelper.create(em)
    create.userHelper.createAdmin(em)
    regularApp = create.appHelper.createRegular(em, { user })
    httpsApp = create.appHelper.createHTTPS(em, { user })
    await em.flush()

    // reset fakes
    mocksReset()
    createUserDataConsistencyReportJobTaskStub.reset()
    createSyncFilesStateTaskStub.reset()
  })

  it('adds job sync tasks for HTTPS apps but not regular apps to the queue', async () => {
    const job1 = create.jobHelper.create(
      em,
      { user, app: regularApp },
      {
        state: JOB_STATE.IDLE,
      },
    )
    const job2 = create.jobHelper.create(
      em,
      { user, app: httpsApp },
      {
        state: JOB_STATE.IDLE,
      },
    )
    const job3 = create.jobHelper.create(
      em,
      { user, app: regularApp },
      {
        state: JOB_STATE.TERMINATING,
      },
    )
    const job4 = create.jobHelper.create(
      em,
      { user, app: httpsApp },
      {
        state: JOB_STATE.RUNNING,
      },
    )
    const job5 = create.jobHelper.create(
      em,
      { user, app: regularApp },
      {
        state: JOB_STATE.RUNNING,
      },
    )
    create.jobHelper.create(
      em,
      { user, app: httpsApp },
      {
        state: JOB_STATE.TERMINATED,
      },
    )
    await em.flush()

    fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })

    await getInstance().runCheckup(job)

    // Only non-terminated HTTPS jobs should result in task creation
    // In this case only job2 and job4
    expect(fakes.queue.createSyncJobStatusTaskFake.callCount).to.equal(5)

    const [payload1, userCtx] = fakes.queue.createSyncJobStatusTaskFake.getCall(0).args
    expect(payload1).to.have.property('dxid', job1.dxid)
    expect(userCtx).to.have.property('dxuser', user.dxuser)

    const [payload2] = fakes.queue.createSyncJobStatusTaskFake.getCall(1).args
    expect(payload2).to.have.property('dxid', job2.dxid)

    const [payload3] = fakes.queue.createSyncJobStatusTaskFake.getCall(2).args
    expect(payload3).to.have.property('dxid', job3.dxid)

    const [payload4] = fakes.queue.createSyncJobStatusTaskFake.getCall(3).args
    expect(payload4).to.have.property('dxid', job4.dxid)

    const [payload5] = fakes.queue.createSyncJobStatusTaskFake.getCall(4).args
    expect(payload5).to.have.property('dxid', job5.dxid)
  })

  it('ignores jobs that have sync tasks already there', async () => {
    const job1 = create.jobHelper.create(
      em,
      { user, app: httpsApp },
      {
        state: JOB_STATE.RUNNING,
      },
    )
    const job2 = create.jobHelper.create(
      em,
      { user, app: httpsApp },
      {
        state: JOB_STATE.RUNNING,
      },
    )
    const job3 = create.jobHelper.create(
      em,
      { user, app: httpsApp },
      {
        state: JOB_STATE.TERMINATING,
      },
    )
    const job4 = create.jobHelper.create(
      em,
      { user, app: httpsApp },
      {
        state: JOB_STATE.TERMINATING,
      },
    )
    await em.flush()

    fakes.queue.findRepeatableFake.onCall(0).returns(undefined)
    fakes.queue.findRepeatableFake
      .onCall(1)
      .returns(generate.bullQueue.syncJobStatus(job2.dxid, userContext))
    fakes.queue.findRepeatableFake.onCall(2).returns(undefined)
    fakes.queue.findRepeatableFake
      .onCall(3)
      .returns(generate.bullQueue.syncJobStatus(job4.dxid, userContext))

    await getInstance().runCheckup(job)

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

    await getInstance().runCheckup(job)

    expect(createSyncFilesStateTaskStub.callCount).to.equal(0)
  })

  it('adds SyncFilesStateTask if user has an open file', async () => {
    const params = {
      parentId: user.id,
      parentType: PARENT_TYPE.USER,
      state: FILE_STATE_DX.OPEN,
    }
    create.filesHelper.create(em, { user }, { name: 'file1', ...params })
    await em.flush()

    await getInstance().runCheckup(job)

    expect(createSyncFilesStateTaskStub.callCount).to.equal(1)
  })

  it('adds SyncFilesStateTask if user has an open asset', async () => {
    const params = {
      parentId: user.id,
      parentType: PARENT_TYPE.USER,
      state: FILE_STATE_DX.OPEN,
    }
    create.filesHelper.create(em, { user }, { name: 'asset1', ...params })
    await em.flush()

    await getInstance().runCheckup(job)

    expect(createSyncFilesStateTaskStub.callCount).to.equal(1)
  })

  it('does not add SyncFilesStateTask if a task already exists', async () => {
    const params = {
      parentId: user.id,
      parentType: PARENT_TYPE.USER,
      state: FILE_STATE_DX.OPEN,
    }
    create.filesHelper.create(em, { user }, { name: 'file1', ...params })
    await em.flush()

    fakes.queue.findRepeatableFake.callsFake(() =>
      generate.bullQueueRepeatable.syncFilesState(user.dxuser),
    )

    await getInstance().runCheckup(job)

    expect(createSyncFilesStateTaskStub.callCount).to.equal(0)
  })

  it('queues UserDataConsistencyReport if last checkup is null', async () => {
    user.lastDataCheckup = null
    await em.flush()

    await getInstance().runCheckup(job)
    expect(createUserDataConsistencyReportJobTaskStub.callCount).to.equal(1)
  })

  it('queues UserDataConsistencyReportTask and BillToAdjustmentTask if last checkup is over the limit', async () => {
    const repeat = config.workerJobs.userDataConsistencyReport.repeatSeconds
    user.lastDataCheckup = new Date(new Date().getTime() - (repeat + 1) * 1000)
    await em.flush()

    await getInstance().runCheckup(job)
    expect(createUserDataConsistencyReportJobTaskStub.callCount).to.equal(1)
  })

  it('does not queue UserDataConsistencyReportTask and BillToAdjustmentTask if last checkup is under the limit', async () => {
    const repeat = config.workerJobs.userDataConsistencyReport.repeatSeconds
    const testTime = 1708698323689
    user.lastDataCheckup = new Date(testTime - repeat * 1000 + 1)
    await em.flush()

    // set time to testTime
    const clock = useFakeTimers({ now: testTime, toFake: ['Date'] })
    await clock.tickAsync(testTime - Date.now())
    await getInstance().runCheckup(job)
    expect(createUserDataConsistencyReportJobTaskStub.callCount).to.equal(0)
    clock.restore()
  })

  it('adds db sync tasks to the queue', async () => {
    const dbCluster1 = create.dbClusterHelper.create(
      em,
      { user },
      { status: DB_CLUSTER_STATUS.AVAILABLE },
    )
    const dbCluster2 = create.dbClusterHelper.create(
      em,
      { user },
      { status: DB_CLUSTER_STATUS.STOPPED },
    )
    await em.flush()

    await getInstance().runCheckup(job)
    expect(fakes.queue.createDbClusterSyncTaskFake.callCount).to.equal(2)
    const [payload1] = fakes.queue.createDbClusterSyncTaskFake.getCall(0).args
    expect(payload1).to.have.property('dxid', dbCluster1.dxid)
    const [payload2] = fakes.queue.createDbClusterSyncTaskFake.getCall(1).args
    expect(payload2).to.have.property('dxid', dbCluster2.dxid)
  })

  it('does nothing if all DbClusters already have sync task', async () => {
    create.dbClusterHelper.create(em, { user }, { status: DB_CLUSTER_STATUS.TERMINATED })
    await em.flush()

    await getInstance().runCheckup(job)
    expect(fakes.queue.createDbClusterSyncTaskFake.callCount).to.equal(0)
  })

  function getInstance() {
    const userContext = {
      id: user.id,
      dxuser: user.dxuser,
      accessToken: 'token',
    } as unknown as UserContext
    const fileSyncQueueJobProducer = {
      createUserDataConsistencyReportJobTask: createUserDataConsistencyReportJobTaskStub,
    } as unknown as FileSyncQueueJobProducer
    const mainQueueJobProducer = {
      createSyncFilesStateTask: createSyncFilesStateTaskStub,
    } as unknown as MainQueueJobProducer
    return new UserCheckupFacade(em, userContext, fileSyncQueueJobProducer, mainQueueJobProducer)
  }
})
