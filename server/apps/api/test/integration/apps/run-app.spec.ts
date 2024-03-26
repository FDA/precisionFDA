import { USER_CONTEXT_HTTP_HEADERS } from '@shared/config/consts'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { User } from '@shared/domain/user/user.entity'
import { ErrorCodes } from '@shared/errors'
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import supertest from 'supertest'
import {
  JOB_STATE,
  JOB_DB_ENTITY_TYPE,
  DEFAULT_INSTANCE_TYPE,
  allowedFeatures,
  allowedInstanceTypes,
} from '@shared/domain/job/job.enum'
import { create, generate, db } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import { testedApp } from '../../index'
import { getDefaultHeaderData, stripEntityDates } from '../../utils/expect-helper'

describe('POST /apps/:id/run', () => {
  let em: EntityManager
  let user: User
  let app: App

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork() as EntityManager
    em.clear()
    user = create.userHelper.create(em)
    app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
    await em.flush()
    // handle the stubs
    mocksReset()
  })

  it('response shape', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/apps/${app.dxid}/run`)
      .set(getDefaultHeaderData(user))
      .send(generate.app.runAppInput())
      .expect(201)
    expect(body).to.deep.include({
      id: 1,
      name: app.title,
      dxid: generate.job.jobId(),
      entityType: JOB_DB_ENTITY_TYPE.HTTPS,
      project: user.privateFilesProject,
      state: JOB_STATE.IDLE,
      scope: 'private',
    })
    expect(body.app).to.deep.include({
      dxid: app.dxid,
      title: app.title,
      scope: app.scope,
    })
    expect(body.user).to.deep.include({
      dxuser: user.dxuser,
    })
  })

  it('builds json fields in the db', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/apps/${app.dxid}/run`)
      .set(getDefaultHeaderData(user))
      .send(generate.app.runAppInput())
      .expect(201)
    const jobInDb = await em.findOne(Job, body.id)
    expect(jobInDb).to.have.property('uid', `${generate.job.jobId()}-1`)
    expect(jobInDb).to.have.property('describe', '{}')
    var provenance = jobInDb?.provenance
    expect(provenance).to.deep.equal(
      {
        [generate.job.jobId()]: {
          app_dxid: app.dxid,
          app_id: app.id,
          inputs: {},
        },
      },
    )
  })

  it('response shape - ttyd app (still user.private project)', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/apps/${app.dxid}/run`)
      .set(getDefaultHeaderData(user))
      .send(generate.app.runTtydAppInput())
      .expect(201)
    expect(stripEntityDates(body)).to.deep.include({
      id: 1,
      name: app.title,
      dxid: generate.job.jobId(),
      entityType: JOB_DB_ENTITY_TYPE.HTTPS,
      // default app type
      project: user.privateFilesProject,
      state: JOB_STATE.IDLE,
      scope: 'private',
    })
    expect(body.app).to.deep.include({
      dxid: app.dxid,
      title: app.title,
      scope: app.scope,
    })
    expect(body.user).to.deep.include({
      dxuser: user.dxuser,
    })
  })

  it('accepts snapshot file dxid', async () => {
    const snapshotFile = create.filesHelper.create(em, { user })
    await em.flush()
    const input = {
      ...generate.app.runAppInput(),
      input: {
        snapshot: snapshotFile.uid,
      },
    }
    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/apps/${app.dxid}/run`)
      .set(getDefaultHeaderData(user))
      .send(input)
      .expect(201)
    const jobInDb = await em.findOneOrFail(Job, { id: body.id })
    var provenanceInDb = jobInDb?.provenance
    expect(provenanceInDb).to.be.deep.equal({
      [generate.job.jobId()]: {
        app_dxid: app.dxid,
        app_id: app.id,
        inputs: { snapshot: snapshotFile.dxid },
      },
    })

    const inputFiles = await jobInDb.inputFiles.loadItems()
    expect(inputFiles).to.be.an('array').with.lengthOf(1)
    expect(inputFiles[0].id).to.equal(snapshotFile.id)
    // correct API call shape
    const platformCall = fakes.client.jobCreateFake.getCall(0).args[0]
    expect(platformCall).to.have.property('input')
    expect(platformCall.input)
      .to.have.property('snapshot')
      .that.deep.equals({
        $dnanexus_link: { id: snapshotFile.dxid, project: snapshotFile.project },
      })
  })

  it('accepts params for jupyter app (uses all overrides and optionals)', async () => {
    const inputComplete = {
      ...generate.app.runAppInput(),
      instanceType: 'himem-2',
      jobLimit: 50,
      name: 'my-job-name',
      input: {
        duration: 60,
        feature: 'ML_IP',
        imagename: 'my-imagename',
        cmd: 'my-command-override',
      },
    }
    await supertest(testedApp.getHttpServer())
      .post(`/apps/${app.dxid}/run`)
      .set(getDefaultHeaderData(user))
      .send(inputComplete)
      .expect(201)
    // all overrides took place
    const platformCall = fakes.client.jobCreateFake.getCall(0).args[0]
    expect(platformCall).to.have.property('name', inputComplete.name)
    expect(platformCall).to.have.property('costLimit', inputComplete.jobLimit)
    expect(platformCall).to.have.property('input').that.deep.equals({
      duration: inputComplete.input.duration,
      feature: allowedFeatures.ML_IP,
      imagename: inputComplete.input.imagename,
      cmd: inputComplete.input.cmd,
    })
    expect(platformCall)
      .to.have.property('systemRequirements')
      .that.deep.equals({
        '*': { instanceType: allowedInstanceTypes[inputComplete.instanceType] },
      })
  })

  it('accepts params for ttyd app', async () => {
    const ttydApp = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.ttydAppSpecData() })
    await em.flush()
    const ttydAppInput = {
      ...generate.app.runTtydAppInput(),
      instanceType: 'himem-2',
      jobLimit: 25.25,
      name: 'my-ttyd',
      input: {
        port: 8081,
      },
    }
    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/apps/${ttydApp.dxid}/run`)
      .set(getDefaultHeaderData(user))
      .send(ttydAppInput)
      .expect(201)

    const platformCall = fakes.client.jobCreateFake.getCall(0).args[0]
    expect(platformCall).to.have.property('name', ttydAppInput.name)
    expect(platformCall).to.have.property('costLimit', ttydAppInput.jobLimit)
    expect(platformCall).to.have.property('input').that.deep.equals({
      port: ttydAppInput.input.port,
    })
    expect(platformCall)
      .to.have.property('systemRequirements')
      .that.deep.equals({
        '*': { instanceType: allowedInstanceTypes[ttydAppInput.instanceType] },
      })
  })

  it('accepts params for rshiny app', async () => {
    const rshinyApp = create.appHelper.createHTTPS(em, { user }, { ...generate.app.rshiny() })
    const gzipFile = create.filesHelper.create(em, { user })
    await em.flush()
    const input = {
      ...generate.app.runRshinyAppInput(),
      input: {
        app_gz: gzipFile.uid,
      },
    }
    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/apps/${rshinyApp.dxid}/run`)
      .set(getDefaultHeaderData(user))
      .send(input)
      .expect(201)
    const platformCall = fakes.client.jobCreateFake.getCall(0).args[0]
    expect(platformCall)
      .to.have.property('input')
      .that.deep.equals({
        app_gz: { $dnanexus_link: { id: gzipFile.dxid, project: gzipFile.project } },
      })
    const jobInDb = await em.findOneOrFail(Job, { id: body.id })
    expect(jobInDb).to.have.property('provenance')
    var provenanceInDb = jobInDb?.provenance
    expect(provenanceInDb).to.be.deep.equal({
      [generate.job.jobId()]: {
        app_dxid: rshinyApp.dxid,
        app_id: rshinyApp.id,
        inputs: { app_gz: gzipFile.dxid },
      },
    })
    const inputFiles = await jobInDb.inputFiles.loadItems()
    expect(inputFiles).to.be.an('array').with.lengthOf(1)
    expect(inputFiles[0].id).to.equal(gzipFile.id)
  })

  it('accepts minimal input params (uses all defaults)', async () => {
    const inputComplete = {
      scope: 'private',
      jobLimit: 50,
      input: {},
    }
    await supertest(testedApp.getHttpServer())
      .post(`/apps/${app.dxid}/run`)
      .set(getDefaultHeaderData(user))
      .send(inputComplete)
      .expect(201)
    // all defaults took place
    const platformCall = fakes.client.jobCreateFake.getCall(0).args[0]
    expect(platformCall).to.have.property('name').that.is.undefined()
    expect(platformCall).to.have.property('input').that.deep.equals({})
    expect(platformCall)
      .to.have.property('systemRequirements')
      .that.deep.equals({
        '*': { instanceType: DEFAULT_INSTANCE_TYPE },
      })
  })

  it('calls the platform API', async () => {
    await supertest(testedApp.getHttpServer())
      .post(`/apps/${app.dxid}/run`)
      .set(getDefaultHeaderData(user))
      .send(generate.app.runAppInput())
      .expect(201)
    expect(fakes.client.jobCreateFake.calledOnce).to.be.true()
  })

  it('calls queue helper', async () => {
    const args = []
    fakes.queue.createSyncJobStatusTaskFake.callsFake((...a) => {
      a[1] = { ...a[1] }
      args.push(a)
    })

    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/apps/${app.dxid}/run`)
      .set(getDefaultHeaderData(user))
      .send(generate.app.runAppInput())
      .expect(201)
    expect(fakes.queue.createSyncJobStatusTaskFake.calledOnce).to.be.true()
    const fakeCallArgs = args[0]
    expect(fakeCallArgs[0]).to.deep.equal({
      dxid: body.dxid,
    })
    expect(fakeCallArgs[1]).to.deep.equal({
      id: user.id,
      accessToken: 'fake-token',
      dxuser: user.dxuser,
    })
  })

  // todo: should test different project selection anyways

  context('error states', () => {
    it('throws 404 when user does not exist', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/apps/${app.dxid}/run`)
        .set({
          ...getDefaultHeaderData(user),
          [USER_CONTEXT_HTTP_HEADERS.id]: user.id + 1,
        })
        .send(generate.app.runAppInput())
        .expect(404)
      expect(body.error).to.have.property('code', ErrorCodes.USER_NOT_FOUND)
    })

    it('throws 404 when user does not have the project set', async () => {
      user.privateFilesProject = null
      await em.flush()
      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/apps/${app.dxid}/run`)
        .set(getDefaultHeaderData(user))
        .query({ id: user.id })
        .send(generate.app.runAppInput())
        .expect(404)
      expect(body.error).to.have.property('code', ErrorCodes.PROJECT_NOT_FOUND)
    })

    // deprecated, admin owns the apps
    it.skip('throws 401 when user does not own the app', async () => {
      const anotherUser = create.userHelper.create(em)
      const anotherApp = create.appHelper.createHTTPS(em, { user: anotherUser })
      await em.flush()
      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/apps/${anotherApp.dxid}/run`)
       .set(getDefaultHeaderData(user))
        .send(generate.app.runAppInput())
      expect(body.error).to.have.property('code', ErrorCodes.APP_NOT_FOUND)
    })

    it('throws 404 if requested app does not follow the requirements', async () => {
      const anotherApp = create.appHelper.createHTTPS(em, { user }, { scope: 'private' })
      await em.flush()
      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/apps/${anotherApp.dxid}/run`)
       .set(getDefaultHeaderData(user))
        .send(generate.app.runAppInput())
        .expect(404)
      expect(body.error).to.have.property('code', ErrorCodes.APP_NOT_FOUND)
    })

    it('throws 404 when snapshot is provided but file does not exist', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/apps/${app.dxid}/run`)
       .set(getDefaultHeaderData(user))
        .send({ ...generate.app.runAppInput(), input: { snapshot: generate.random.dxstr() } })
        .expect(404)
      expect(body.error).to.have.property('code', ErrorCodes.USER_FILE_NOT_FOUND)
    })
  })
})
