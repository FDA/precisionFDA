import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import supertest from 'supertest'
import { App, Job, User } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { ENTITY_TYPE } from '@pfda/https-apps-shared/src/domain/app/app.enum'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { errors, database } from '@pfda/https-apps-shared'
import { getServer } from '../../../src/server'
import { getDefaultQueryData } from '../../utils/expect-helper'
import { TASK_TYPE } from 'shared/src/queue/task.input'
import { WorkstationSnapshotOperation } from 'shared/src/domain/job'

describe('PATCH /jobs/:id/setAPIKey', () => {
  let em: EntityManager
  let user: User
  let app: App
  let job: Job

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em)
    app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
    job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.RUNNING })

    await em.flush()
    mocksReset()
  })

  it('works', async () => {
    const response = await supertest(getServer())
      .patch(`/jobs/${job.dxid}/setAPIKey`)
      .query({ ...getDefaultQueryData(user) })
      .send({ key: 'hello world', code: 'code from auth server' })

    expect(response.statusCode).to.equal(200)
    expect(response.body).to.be.deep.equal({ 'result': 'success' })
    expect(fakes.workstationClient.oauthAccess.getCall(0).args).to.be.deep.equal(
      ['code from auth server']
    )
    expect(fakes.workstationClient.setAPIKey.calledOnce).to.be.true()
    expect(fakes.workstationClient.setAPIKey.getCall(0).args[0]).to.equal('hello world')
  })

  it('doesnt call the platform API if api key is empty', async () => {
    const response = await supertest(getServer())
      .patch(`/jobs/${job.dxid}/setAPIKey`)
      .query({ ...getDefaultQueryData(user) })
      .send({})

    expect(response.statusCode).to.equal(400)
    expect(fakes.workstationClient.setAPIKey.notCalled).to.be.true()
  })

  it('does not call workstation API if the job is already finished', async () => {
    job.state = JOB_STATE.TERMINATED
    await em.flush()
    const response = await supertest(getServer())
      .patch(`/jobs/${job.dxid}/setAPIKey`)
      .query({ ...getDefaultQueryData(user) })
      .send({ key: 'hello world', code: 'code from auth server' })

    expect(response.statusCode).to.equal(422)
    expect(fakes.workstationClient.setAPIKey.notCalled).to.be.true()
    expect(response.body.error.message).to.equal('Job is not in running state')
  })

  it('throws 404 when the job does not exist', async () => {
    const response = await supertest(getServer())
      .patch(`/jobs/${generate.random.dxstr()}/setAPIKey`)
      .query({ ...getDefaultQueryData(user) })
      .send({ key: 'hello world', code: 'code from auth server' })

    expect(response.statusCode).to.equal(404)
    expect(response.body.error).to.have.property('code', errors.ErrorCodes.JOB_NOT_FOUND)
  })

  it('throws error when the job type is NOT HTTPS', async () => {
    job.entityType = ENTITY_TYPE.NORMAL
    await em.flush()
    const response = await supertest(getServer())
      .patch(`/jobs/${job.dxid}/setAPIKey`)
      .query({ ...getDefaultQueryData(user) })
      .send({ key: 'hello world', code: 'code from auth server' })

    expect(response.statusCode).to.equal(422)
    expect(response.body.error).to.have.property('code', errors.ErrorCodes.INVALID_STATE)
  })
})


describe('PATCH /jobs/:id/snapshot', () => {
  let em: EntityManager
  let user: User
  let app: App
  let job: Job

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em)
    app = create.appHelper.createHTTPS(em, { user }, {
      spec: generate.app.ttydAppSpecData(),
      internal: generate.app.ttydAppWithAPIInternal()
    })
    job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.RUNNING })

    await em.flush()
    mocksReset()
  })

  it('works without terminate flag', async () => {
    const params = {
      key: 'hello world',
      code: 'code from auth server',
      name: 'MySnapshot',
    }
    let response = await supertest(getServer())
      .patch(`/jobs/${job.dxid}/snapshot`)
      .query({ ...getDefaultQueryData(user) })
      .send(params)

    expect(response.statusCode).to.equal(200)
    expect(response.body.message).to.contain('Snapshot')

    const bullJob = fakes.bull.addFake.getCall(0).args[0]
    const bullJobOptions = fakes.bull.addFake.getCall(0).args[1]
    expect(bullJob.type).to.equal(TASK_TYPE.WORKSTATION_SNAPSHOT)
    expect(bullJob.payload).to.deep.include({
      ...params,
      jobDxid: job.dxid
    })
    expect(bullJobOptions.jobId).to.equal(WorkstationSnapshotOperation.getBullJobId(job.dxid))
  })

  it('works with terminate flag', async () => {
    const params = {
      key: 'hello world',
      code: 'code from auth server',
      name: 'MySnapshot',
      terminate: true,
    }
    const response = await supertest(getServer())
      .patch(`/jobs/${job.dxid}/snapshot`)
      .query({ ...getDefaultQueryData(user) })
      .send(params)

    expect(response.statusCode).to.equal(200)
    expect(response.body.message).to.contain('Snapshot')
    expect(fakes.bull.addFake.calledOnce).to.be.true()

    const bullJob = fakes.bull.addFake.getCall(0).args[0]
    const bullJobOptions = fakes.bull.addFake.getCall(0).args[1]
    expect(bullJob.type).to.equal(TASK_TYPE.WORKSTATION_SNAPSHOT)
    expect(bullJob.payload).to.deep.include({
      ...params,
      jobDxid: job.dxid
    })
    expect(bullJobOptions.jobId).to.equal(WorkstationSnapshotOperation.getBullJobId(job.dxid))
  })

  it('does not queue an operation if one is already present', async () => {
    fakes.bull.getJobFake.callsFake(() => {
      // For now just needs to something non null to simulate the operation is already present
      // but in the future a Bull.Job mock would be nice
      return {}
    })

    const params = {
      key: 'hello world',
      code: 'code from auth server',
      name: 'MySnapshot',
      terminate: true,
    }
    const response = await supertest(getServer())
      .patch(`/jobs/${job.dxid}/snapshot`)
      .query({ ...getDefaultQueryData(user) })
      .send(params)

    expect(response.statusCode).to.equal(422)
    expect(response.body.error.code).to.equal('E_INVALID_STATE')
    expect(response.body.error.message).to.include('already exists in queue')
    expect(fakes.bull.addFake.notCalled).to.be.true()
  })

  it('doesnt call the platform API if api key is empty', async () => {
    const response = await supertest(getServer())
      .patch(`/jobs/${job.dxid}/snapshot`)
      .query({ ...getDefaultQueryData(user) })
      .send({})

    expect(response.statusCode).to.equal(400)
    expect(fakes.bull.addFake.notCalled).to.be.true()
  })

  it('does not call workstation API if the job is not in running state', async () => {
    const nonRunningStates = [JOB_STATE.IDLE, JOB_STATE.FAILED, JOB_STATE.TERMINATING, JOB_STATE.TERMINATED]
    for (const state of nonRunningStates) {
      job.state = state
      await em.flush()
      const response = await supertest(getServer())
        .patch(`/jobs/${job.dxid}/snapshot`)
        .query({ ...getDefaultQueryData(user) })
        .send({
          key: 'hello world',
          code: 'code from auth server',
          name: 'MySnapshot',
        })
  
      expect(fakes.bull.addFake.notCalled).to.be.true()
      expect(response.body.error.message).to.include('is not in running state')
    }
  })

  it('throws 404 when the job does not exist', async () => {
    const response = await supertest(getServer())
      .patch(`/jobs/${generate.random.dxstr()}/snapshot`)
      .query({ ...getDefaultQueryData(user) })
      .send({
        key: 'hello world',
        code: 'code from auth server',
        name: 'MySnapshot',
      })

    expect(response.statusCode).to.equal(404)
    expect(response.body.error).to.have.property('code', errors.ErrorCodes.JOB_NOT_FOUND)
    expect(fakes.bull.addFake.notCalled).to.be.true()
  })

  it('throws error when the job type is not HTTPS', async () => {
    job.entityType = ENTITY_TYPE.NORMAL
    await em.flush()
    const response = await supertest(getServer())
      .patch(`/jobs/${job.dxid}/snapshot`)
      .query({ ...getDefaultQueryData(user) })
      .send({
        key: 'hello world',
        code: 'code from auth server',
        name: 'MySnapshot',
      })

    expect(response.statusCode).to.equal(422)
    expect(response.body.error).to.have.property('code', errors.ErrorCodes.INVALID_STATE)
    expect(fakes.bull.addFake.notCalled).to.be.true()
  })
})
