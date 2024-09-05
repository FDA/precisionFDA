/* eslint-disable max-len */
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { User } from '@shared/domain/user/user.entity'
import { getLogger } from '@shared/logger'
/* eslint-disable no-inline-comments */
/* eslint-disable no-undefined */
import { expect } from 'chai'
import { create, generate, db } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import { fakes as queueFakes, mocksReset as queueMocksReset } from '../utils/mocks'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { UserCtx, UserOpsCtx } from '@shared/types'
import { WorkstationSnapshotOperation } from '@shared/domain/job/ops/workstation-snapshot'
import { MySqlDriver, SqlEntityManager } from '@mikro-orm/mysql'
import { ErrorCodes, InvalidStateError, JobNotFoundError } from '@shared/errors'
import { errorsFactory } from '../utils/errors-factory'

const log = getLogger('workstation-snapshot.spec')

describe('TASK: workstation-snapshot', () => {
  let em: SqlEntityManager<MySqlDriver>
  let user: User
  let userCtx: UserCtx

  // Regular app / job
  let app: App
  let job: Job

  // HTTPS app / job
  let httpsApp: App
  let httpsJob: Job

  // HTTPS app / job that has workstation API v1.0
  let httpsAppWithAPI: App
  let httpsJobWithAPI: Job

  // HTTPS app / job that has workstation API v1.1
  let httpsAppWithAPI_v1_1: App
  let httpsJobWithAPI_v1_1: Job

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as SqlEntityManager<MySqlDriver>

    user = create.userHelper.create(em)
    app = create.appHelper.createRegular(em, { user })
    job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.RUNNING })

    httpsApp = create.appHelper.createHTTPS(em, { user }, {
      spec: generate.app.ttydAppSpecData(),
      internal: generate.app.ttydAppInternal(),
    })
    httpsJob = create.jobHelper.create(em, { user, app: httpsApp }, { scope: 'private', state: JOB_STATE.RUNNING })

    httpsAppWithAPI = create.appHelper.createHTTPS(em, { user }, {
      spec: generate.app.ttydAppSpecData(),
      internal: generate.app.ttydAppInternalWithAPI('1.0.0'),
    })
    httpsJobWithAPI = create.jobHelper.create(em, { user, app: httpsAppWithAPI }, { scope: 'private', state: JOB_STATE.RUNNING })

    httpsAppWithAPI_v1_1 = create.appHelper.createHTTPS(em, { user }, {
      spec: generate.app.ttydAppSpecData(),
      internal: generate.app.ttydAppInternalWithAPI('1.1.0'),
    })
    httpsJobWithAPI_v1_1 = create.jobHelper.create(em, { user, app: httpsAppWithAPI_v1_1 }, { scope: 'private', state: JOB_STATE.RUNNING })

    await em.flush()
    mocksReset()
    queueMocksReset()

    userCtx = { id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' }
  })

  it('enqueues and runs via the worker', async () => {
    const input = {
      jobDxid: httpsJobWithAPI.dxid,
      name: 'SomeSnapshotName',
      terminate: false,
      code: 'code',
      key: 'key',
    }
    const userOpsCtx: UserOpsCtx = { em, log, user: userCtx }
    await new WorkstationSnapshotOperation(userOpsCtx).enqueue(input)
    expect(queueFakes.addToQueueStub.calledOnce).to.be.true()
  })

  it('does not allow multiple tasks for the same job to be in the queue', async () => {
    const input = {
      jobDxid: httpsJobWithAPI.dxid,
      name: 'SomeSnapshotName',
      terminate: false,
      code: 'code',
      key: 'key',
    }
    const userOpsCtx: UserOpsCtx = { em, log, user: userCtx }
    queueFakes.getJobStub.callsFake((jobId: string) => {
      return jobId === WorkstationSnapshotOperation.getBullJobId(httpsJobWithAPI.dxid) ? { } : undefined
    })

    await expect(new WorkstationSnapshotOperation(userOpsCtx).enqueue(input)).to.be.rejectedWith(InvalidStateError)
  })

  it('works and returns success', async () => {
    const input = {
      jobDxid: httpsJobWithAPI.dxid,
      name: 'MySnapshot',
      terminate: false,
      code: 'code from auth server',
      key: 'hello key',
    }
    const userOpsCtx: UserOpsCtx = { em, log, user: userCtx }
    const invoke = async () => await new WorkstationSnapshotOperation(userOpsCtx).execute(input)
    const res = await invoke()
    await expect(res.result).equal('success')

    expect(fakes.workstationClient.oauthAccess.getCall(0).args).to.be.deep.equal(
      ['code from auth server']
    )
    expect(fakes.workstationClient.setAPIKey.getCall(0).args[0]).to.equal('hello key')
    expect(fakes.workstationClient.snapshot.getCall(0).args).to.deep.equal([{
      name: 'MySnapshot',
      terminate: false,
    }])

    // TODO currently not unit testable, WorkstationSnapshotOperation needs to accept  params through constructor
    // expect(fakes.notificationService.createNotification.callCount).to.equal(1)
    // expect(fakes.notificationService.createNotification.args[0][0]).to.include({
    //   action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_COMPLETED,
    //   severity: SEVERITY.INFO,
    // })
  })

  it('works with terminate true', async () => {
    const input = {
      jobDxid: httpsJobWithAPI.dxid,
      name: 'MySnapshotWithTerminate',
      terminate: true,
      code: 'code from auth server',
      key: 'hello key',
    }
    const userOpsCtx: UserOpsCtx = { em, log, user: userCtx }
    const invoke = async () => await new WorkstationSnapshotOperation(userOpsCtx).execute(input)
    const res = await invoke()
    await expect(res.result).equal('success')

    expect(fakes.workstationClient.oauthAccess.getCall(0).args).to.be.deep.equal(
      ['code from auth server']
    )
    expect(fakes.workstationClient.setAPIKey.getCall(0).args[0]).to.equal('hello key')
    expect(fakes.workstationClient.snapshot.getCall(0).args).to.deep.equal([{
      name: 'MySnapshotWithTerminate',
      terminate: true,
    }])

    // TODO currently not unit testable, WorkstationSnapshotOperation needs to accept  params through constructor
    // expect(fakes.notificationService.createNotification.callCount).to.equal(1)
    // expect(fakes.notificationService.createNotification.args[0][0]).to.include({
    //   action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_COMPLETED,
    //   severity: SEVERITY.INFO,
    // })
  })

  it('fails gracefully if connectivity to workstation API fails', async () => {
    // Simulate workstation client somehow died, or not accessible
    fakes.workstationClient.oauthAccess.rejects(errorsFactory.createServiceUnavailableError())
    const input = {
      jobDxid: httpsJobWithAPI.dxid,
      name: 'MySnapshotWithTerminate',
      terminate: true,
      code: 'code from auth server',
      key: 'hello key',
    }
    const userOpsCtx: UserOpsCtx = { em, log, user: userCtx }
    const invoke = async () => await new WorkstationSnapshotOperation(userOpsCtx).execute(input)
    const res = await invoke()
    expect(res.error).to.have.property('code', ErrorCodes.WORKSTATION_API_ERROR)
    expect(res.error.message).to.include('Error')

    // TODO currently not unit testable, WorkstationSnapshotOperation needs to accept  params through constructor
    // expect(fakes.notificationService.createNotification.callCount).to.equal(1)
    // expect(fakes.notificationService.createNotification.args[0][0]).to.include({
    //   action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_ERROR,
    //   severity: SEVERITY.ERROR,
    // })
  })

  it('fails gracefully if workstation API somehow fails', async () => {
    // Simulate workstation client having an internal error
    fakes.workstationClient.snapshot.callsFake(() => ({
      error: {
        message: 'An error has occurred'
      }
    }))

    const input = {
      jobDxid: httpsJobWithAPI.dxid,
      name: 'MySnapshotWithTerminate',
      terminate: true,
      code: 'code from auth server',
      key: 'hello key',
    }
    const userOpsCtx: UserOpsCtx = { em, log, user: userCtx }
    const invoke = async () => await new WorkstationSnapshotOperation(userOpsCtx).execute(input)
    const res = await invoke()
    expect(res.error.message).to.include('error')

    // TODO currently not unit testable, WorkstationSnapshotOperation needs to accept  params through constructor
    // expect(fakes.notificationService.createNotification.callCount).to.equal(1)
    // expect(fakes.notificationService.createNotification.args[0][0]).to.include({
    //   action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_ERROR,
    //   severity: SEVERITY.ERROR,
    // })
  })

  it('fails if job is not found', async () => {
    const input = {
      jobDxid: 'not-a-job',
      name: 'SomeSnapshotName',
      terminate: false,
      code: 'code',
      key: 'key',
    }
    const userOpsCtx: UserOpsCtx = { em, log, user: userCtx }
    const invoke = async () => await new WorkstationSnapshotOperation(userOpsCtx).execute(input)

    await expect(invoke()).to.eventually.be.rejectedWith(JobNotFoundError)

    expect(fakes.workstationClient.oauthAccess.notCalled).to.be.true()
    expect(fakes.workstationClient.setAPIKey.notCalled).to.be.true()
    expect(fakes.workstationClient.snapshot.notCalled).to.be.true()

    expect(fakes.notificationService.createNotification.callCount).to.equal(0)
  })

  it('fails if job is not a workstation', async () => {
    const input = {
      jobDxid: job.dxid,
      name: 'SomeSnapshotName',
      terminate: false,
      code: 'code',
      key: 'key',
    }
    const userOpsCtx: UserOpsCtx = { em, log, user: userCtx }
    const invoke = async () => await new WorkstationSnapshotOperation(userOpsCtx).execute(input)

    await expect(invoke()).to.eventually.be.rejectedWith(InvalidStateError)

    expect(fakes.workstationClient.oauthAccess.notCalled).to.be.true()
    expect(fakes.workstationClient.setAPIKey.notCalled).to.be.true()
    expect(fakes.workstationClient.snapshot.notCalled).to.be.true()

    expect(fakes.notificationService.createNotification.callCount).to.equal(0)
  })

  it('fails if job is a workstation that does not have workstation api', async () => {
    const input = {
      jobDxid: httpsJob.dxid,
      name: 'SomeSnapshotName',
      terminate: false,
      code: 'code',
      key: 'key',
    }
    const userOpsCtx: UserOpsCtx = { em, log, user: userCtx }
    const invoke = async () => await new WorkstationSnapshotOperation(userOpsCtx).execute(input)

    await expect(invoke()).to.eventually.be.rejectedWith(InvalidStateError)

    expect(fakes.workstationClient.oauthAccess.notCalled).to.be.true()
    expect(fakes.workstationClient.setAPIKey.notCalled).to.be.true()
    expect(fakes.workstationClient.snapshot.notCalled).to.be.true()

    expect(fakes.notificationService.createNotification.callCount).to.equal(0)
  })

  it('fails if job is a workstation not in running state', async () => {
    httpsJobWithAPI.state = JOB_STATE.TERMINATED
    await em.flush()

    const input = {
      jobDxid: httpsJobWithAPI.dxid,
      name: 'SomeSnapshotName',
      terminate: false,
      code: 'code',
      key: 'key',
    }
    const userOpsCtx: UserOpsCtx = { em, log, user: userCtx }
    const invoke = async () => await new WorkstationSnapshotOperation(userOpsCtx).execute(input)
    await expect(invoke()).to.eventually.be.rejectedWith(InvalidStateError)

    expect(fakes.workstationClient.oauthAccess.notCalled).to.be.true()
    expect(fakes.workstationClient.setAPIKey.notCalled).to.be.true()
    expect(fakes.workstationClient.snapshot.notCalled).to.be.true()

    expect(fakes.notificationService.createNotification.callCount).to.equal(0)
  })
})
