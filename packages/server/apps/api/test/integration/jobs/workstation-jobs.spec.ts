import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { WorkstationSnapshotOperation } from '@shared/domain/job/ops/workstation-snapshot'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { ErrorCodes } from '@shared/errors'
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import supertest from 'supertest'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { ENTITY_TYPE } from '@shared/domain/app/app.enum'
import { create, generate, db } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'
import { TASK_TYPE } from '@shared/queue/task.input'

describe('PATCH /jobs/:id/setAPIKey', () => {
  let em: EntityManager
  let user: User
  let app_v1_0: App
  let app_v1_1: App
  let job_v1_0: Job
  let job_v1_1: Job
  let space: Space
  let job_in_space: Job

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em)
    app_v1_0 = create.appHelper.createHTTPS(em, { user }, {
      spec: generate.app.ttydAppSpecData(),
      internal: generate.app.ttydAppInternalWithAPI('1.0.0')
    })
    app_v1_1 = create.appHelper.createHTTPS(em, { user },{
      spec: generate.app.ttydAppSpecData(),
      internal: generate.app.ttydAppInternalWithAPI('1.1.0')
    })
    job_v1_0 = create.jobHelper.create(em, { user, app: app_v1_0 }, { scope: 'private', state: JOB_STATE.RUNNING })
    job_v1_1 = create.jobHelper.create(em, { user, app: app_v1_1 }, { scope: 'private', state: JOB_STATE.RUNNING })

    space = create.spacesHelper.create(em, generate.space.group())
		create.spacesHelper.addMember(em, { user, space: space })
    await em.flush()

    // Space needs id before we assign its scope to job
    job_in_space = create.jobHelper.create(em, { user, app: app_v1_1 }, { scope: space.scope, state: JOB_STATE.RUNNING })
    await em.flush()
    mocksReset()
  })

  it('works for v1.0.0', async () => {
    const response = await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${job_v1_0.dxid}/setAPIKey`)
      .set(getDefaultHeaderData(user))
      .send({ key: 'hello world', code: 'code from auth server' })

    expect(response.statusCode).to.equal(200)
    expect(response.body).to.be.deep.equal({ 'result': 'success' })
    expect(fakes.workstationClient.oauthAccess.getCall(0).args).to.be.deep.equal(
      ['code from auth server']
    )
    expect(fakes.workstationClient.setAPIKey.calledOnce).to.be.true()
    expect(fakes.workstationClient.setAPIKey.getCall(0).args[0]).to.equal('hello world')
  })

  it('works for v1.1.0 without space', async () => {
    const response = await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${job_v1_1.dxid}/setAPIKey`)
      .set(getDefaultHeaderData(user))
      .send({ key: 'hello world', code: 'code from auth server' })

    expect(response.statusCode).to.equal(200)
    expect(response.body).to.be.deep.equal({ 'result': 'success' })
    expect(fakes.workstationClient.oauthAccess.getCall(0).args).to.be.deep.equal(
      ['code from auth server']
    )
    expect(fakes.workstationClient.setPFDAConfig.calledOnce).to.be.true()
    expect(fakes.workstationClient.setPFDAConfig.getCall(0).args[0]).to.deep.equal({
      Key: 'hello world',
      Server: 'rails-host:1234',
    })
  })

  it('works with space job', async () => {
    const response = await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${job_in_space.dxid}/setAPIKey`)
      .set(getDefaultHeaderData(user))
      .send({ key: 'hello world', code: 'code from auth server' })

    expect(response.statusCode).to.equal(200)
    expect(response.body).to.be.deep.equal({ 'result': 'success' })
    expect(fakes.workstationClient.oauthAccess.getCall(0).args).to.be.deep.equal(
      ['code from auth server']
    )
    expect(fakes.workstationClient.setPFDAConfig.calledOnce).to.be.true()
    expect(fakes.workstationClient.setPFDAConfig.getCall(0).args[0]).to.deep.equal({
      Key: 'hello world',
      Server: 'rails-host:1234',
      Scope: `space-${space.id}`,
    })
  })

  it('doesnt call the platform API if api key is empty', async () => {
    const response = await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${job_v1_1.dxid}/setAPIKey`)
      .set(getDefaultHeaderData(user))
      .send({})

    expect(response.statusCode).to.equal(400)
    expect(fakes.workstationClient.setAPIKey.notCalled).to.be.true()
  })

  it('does not call workstation API if the job is already finished', async () => {
    job_v1_1.state = JOB_STATE.TERMINATED
    await em.flush()
    const response = await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${job_v1_1.dxid}/setAPIKey`)
      .set(getDefaultHeaderData(user))
      .send({ key: 'hello world', code: 'code from auth server' })

    expect(response.statusCode).to.equal(422)
    expect(fakes.workstationClient.setAPIKey.notCalled).to.be.true()
    expect(response.body.error.message).to.equal('Job is not in running state')
  })

  it('throws 404 when the job does not exist', async () => {
    const response = await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${generate.random.dxstr()}/setAPIKey`)
      .set(getDefaultHeaderData(user))
      .send({ key: 'hello world', code: 'code from auth server' })

    expect(response.statusCode).to.equal(404)
    expect(response.body.error).to.have.property('code', ErrorCodes.JOB_NOT_FOUND)
  })

  it('throws error when the job type is NOT HTTPS', async () => {
    job_v1_1.entityType = ENTITY_TYPE.NORMAL
    await em.flush()
    const response = await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${job_v1_1.dxid}/setAPIKey`)
      .set(getDefaultHeaderData(user))
      .send({ key: 'hello world', code: 'code from auth server' })

    expect(response.statusCode).to.equal(422)
    expect(response.body.error).to.have.property('code', ErrorCodes.INVALID_STATE)
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
      internal: generate.app.ttydAppInternalWithAPI('1.1.0'),
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
    let response = await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${job.dxid}/snapshot`)
      .set(getDefaultHeaderData(user))
      .send(params)

    expect(response.statusCode).to.equal(200)
    expect(response.body.message).to.contain('Snapshot')

    const bullJob = fakes.bull.addFake.getCall(0).args[1]
    const bullJobOptions = fakes.bull.addFake.getCall(0).args[2]
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
    const response = await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${job.dxid}/snapshot`)
      .set(getDefaultHeaderData(user))
      .send(params)

    expect(response.statusCode).to.equal(200)
    expect(response.body.message).to.contain('Snapshot')
    expect(fakes.bull.addFake.calledOnce).to.be.true()

    const bullJob = fakes.bull.addFake.getCall(0).args[1]
    const bullJobOptions = fakes.bull.addFake.getCall(0).args[2]
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
    const response = await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${job.dxid}/snapshot`)
      .set(getDefaultHeaderData(user))
      .send(params)

    expect(response.statusCode).to.equal(422)
    expect(response.body.error.code).to.equal('E_INVALID_STATE')
    expect(response.body.error.message).to.include('already exists in queue')
    expect(fakes.bull.addFake.notCalled).to.be.true()
  })

  it('doesnt call the platform API if api key is empty', async () => {
    const response = await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${job.dxid}/snapshot`)
      .set(getDefaultHeaderData(user))
      .send({})

    expect(response.statusCode).to.equal(400)
    expect(fakes.bull.addFake.notCalled).to.be.true()
  })

  it('does not call workstation API if the job is not in running state', async () => {
    const nonRunningStates = [JOB_STATE.IDLE, JOB_STATE.FAILED, JOB_STATE.TERMINATING, JOB_STATE.TERMINATED]
    for (const state of nonRunningStates) {
      job.state = state
      await em.flush()
      const response = await supertest(testedApp.getHttpServer())
        .patch(`/jobs/${job.dxid}/snapshot`)
        .set(getDefaultHeaderData(user))
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
    const response = await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${generate.random.dxstr()}/snapshot`)
      .set(getDefaultHeaderData(user))
      .send({
        key: 'hello world',
        code: 'code from auth server',
        name: 'MySnapshot',
      })

    expect(response.statusCode).to.equal(404)
    expect(response.body.error).to.have.property('code', ErrorCodes.JOB_NOT_FOUND)
    expect(fakes.bull.addFake.notCalled).to.be.true()
  })

  it('throws error when the job type is not HTTPS', async () => {
    job.entityType = ENTITY_TYPE.NORMAL
    await em.flush()
    const response = await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${job.dxid}/snapshot`)
      .set(getDefaultHeaderData(user))
      .send({
        key: 'hello world',
        code: 'code from auth server',
        name: 'MySnapshot',
      })

    expect(response.statusCode).to.equal(422)
    expect(response.body.error).to.have.property('code', ErrorCodes.INVALID_STATE)
    expect(fakes.bull.addFake.notCalled).to.be.true()
  })
})
