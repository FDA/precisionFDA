import { EntityManager } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import {
  allowedFeatures,
  allowedInstanceTypes,
  DEFAULT_INSTANCE_TYPE,
  JOB_DB_ENTITY_TYPE,
  JOB_STATE,
} from '@shared/domain/job/job.enum'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { ErrorCodes } from '@shared/errors'
import { create, db, generate } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import { expect } from 'chai'
import supertest from 'supertest'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'

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
    create.sessionHelper.create(em, { user })
    await em.flush()
    // handle the stubs
    mocksReset()
  })

  it('response shape', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/apps/${app.uid}/run`)
      .set(getDefaultHeaderData(user))
      .send(generate.app.runAppInput())
      .expect(201)
    expect(body).to.have.property('id')
    const jobInDb = await em.findOne(Job, { uid: body.id })
    expect(jobInDb.describe).to.equal(null)
    expect(jobInDb.app.id).to.equal(app.id)
    var provenance = jobInDb?.provenance
    expect(provenance).to.deep.equal({
      [generate.job.jobId()]: {
        app_dxid: app.dxid,
        app_id: app.id,
        inputs: {
          duration: 30,
          feature: 'PYTHON_R',
        },
      },
    })
  })

  it('response shape - ttyd app (still user.private project)', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/apps/${app.uid}/run`)
      .set(getDefaultHeaderData(user))
      .send(generate.app.runTtydAppInput())
      .expect(201)
    const jobInDb = await em.findOne(Job, { uid: body.id })
    expect(jobInDb.project).to.equal(user.privateFilesProject)
    expect(jobInDb.entityType).to.equal(JOB_DB_ENTITY_TYPE.HTTPS)
    expect(jobInDb.state).to.equal(JOB_STATE.IDLE)
    expect(jobInDb.scope).to.equal(STATIC_SCOPE.PRIVATE)
    expect(jobInDb.state).to.equal(JOB_STATE.IDLE)
    expect(jobInDb.app.id).to.equal(app.id)
    expect(jobInDb.user.id).to.equal(user.id)
  })

  it('accepts params for jupyter app (uses all overrides and optionals)', async () => {
    const inputComplete = {
      ...generate.app.runAppInput(),
      instanceType: 'himem-2',
      jobLimit: 50,
      name: 'my-job-name',
      inputs: {
        duration: 60,
        feature: 'ML_IP',
        imagename: 'my-imagename',
        cmd: 'my-command-override',
      },
    }
    await supertest(testedApp.getHttpServer())
      .post(`/apps/${app.uid}/run`)
      .set(getDefaultHeaderData(user))
      .send(inputComplete)
      .expect(201)
    // all overrides took place
    const platformCall = fakes.client.jobCreateFake.getCall(0).args[0]
    expect(platformCall).to.have.property('name', inputComplete.name)
    expect(platformCall).to.have.property('costLimit', inputComplete.jobLimit)
    expect(platformCall).to.have.property('input').that.deep.equals({
      duration: inputComplete.inputs.duration,
      feature: allowedFeatures.ML_IP,
      imagename: inputComplete.inputs.imagename,
      cmd: inputComplete.inputs.cmd,
    })
    expect(platformCall)
      .to.have.property('systemRequirements')
      .that.deep.equals({
        '*': { instanceType: allowedInstanceTypes[inputComplete.instanceType] },
      })
  })

  it('accepts params for ttyd app', async () => {
    const ttydApp = create.appHelper.createHTTPS(
      em,
      { user },
      { spec: generate.app.ttydAppSpecData() },
    )
    await em.flush()
    const ttydAppInput = {
      ...generate.app.runTtydAppInput(),
      instanceType: 'himem-2',
      jobLimit: 25.25,
      name: 'my-ttyd',
      inputs: {},
    }
    await supertest(testedApp.getHttpServer())
      .post(`/apps/${ttydApp.uid}/run`)
      .set(getDefaultHeaderData(user))
      .send(ttydAppInput)
      .expect(201)

    const platformCall = fakes.client.jobCreateFake.getCall(0).args[0]
    expect(platformCall).to.have.property('name', ttydAppInput.name)
    expect(platformCall).to.have.property('costLimit', ttydAppInput.jobLimit)
    expect(platformCall).to.have.property('input').that.deep.equals({})
    expect(platformCall)
      .to.have.property('systemRequirements')
      .that.deep.equals({
        '*': { instanceType: allowedInstanceTypes[ttydAppInput.instanceType] },
      })
  })

  it('accepts snapshot file dxid', async () => {
    const ttydApp = create.appHelper.createHTTPS(
      em,
      { user },
      { spec: generate.app.ttydAppSpecData() },
    )
    const snapshotFile = create.filesHelper.create(em, { user })
    await em.flush()
    const ttydAppInput = {
      ...generate.app.runTtydAppInput(),
      instanceType: 'himem-2',
      jobLimit: 25.25,
      name: 'my-ttyd',
      inputs: {
        snapshot: snapshotFile.uid,
      },
    }
    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/apps/${ttydApp.uid}/run`)
      .set(getDefaultHeaderData(user))
      .send(ttydAppInput)
      .expect(201)

    const jobInDb = await em.findOneOrFail(Job, { uid: body.id })
    var provenanceInDb = jobInDb?.provenance
    expect(provenanceInDb).to.be.deep.equal({
      [generate.job.jobId()]: {
        app_dxid: ttydApp.dxid,
        app_id: ttydApp.id,
        inputs: { snapshot: snapshotFile.uid },
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

  it('accepts params for rshiny app', async () => {
    const rshinyApp = create.appHelper.createHTTPS(em, { user }, { ...generate.app.rshiny() })
    const gzipFile = create.filesHelper.create(em, { user })
    await em.flush()
    const input = {
      ...generate.app.runRshinyAppInput(),
      inputs: {
        app_gz: gzipFile.uid,
      },
    }
    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/apps/${rshinyApp.uid}/run`)
      .set(getDefaultHeaderData(user))
      .send(input)
      .expect(201)
    const platformCall = fakes.client.jobCreateFake.getCall(0).args[0]
    expect(platformCall)
      .to.have.property('input')
      .that.deep.equals({
        app_gz: { $dnanexus_link: { id: gzipFile.dxid, project: gzipFile.project } },
      })
    const jobInDb = await em.findOneOrFail(Job, { uid: body.id })
    expect(jobInDb).to.have.property('provenance')
    var provenanceInDb = jobInDb?.provenance
    expect(provenanceInDb).to.be.deep.equal({
      [generate.job.jobId()]: {
        app_dxid: rshinyApp.dxid,
        app_id: rshinyApp.id,
        inputs: { app_gz: gzipFile.uid },
      },
    })
    const inputFiles = await jobInDb.inputFiles.loadItems()
    expect(inputFiles).to.be.an('array').with.lengthOf(1)
    expect(inputFiles[0].id).to.equal(gzipFile.id)
  })

  it('accepts minimal input params (uses all defaults)', async () => {
    const inputComplete = {
      name: 'Name',
      scope: 'private',
      jobLimit: 50,
      inputs: {},
      instanceType: 'baseline-2',
    }
    await supertest(testedApp.getHttpServer())
      .post(`/apps/${app.uid}/run`)
      .set(getDefaultHeaderData(user))
      .send(inputComplete)
      .expect(201)
    // all defaults took place
    const platformCall = fakes.client.jobCreateFake.getCall(0).args[0]
    expect(platformCall).to.have.property('name').that.equals(inputComplete.name)
    expect(platformCall).to.have.property('input').that.deep.equals({
      duration: 240,
      feature: 'PYTHON_R',
    })
    expect(platformCall)
      .to.have.property('systemRequirements')
      .that.deep.equals({
        '*': { instanceType: DEFAULT_INSTANCE_TYPE },
      })
  })

  it('calls the platform API', async () => {
    await supertest(testedApp.getHttpServer())
      .post(`/apps/${app.uid}/run`)
      .set(getDefaultHeaderData(user))
      .send(generate.app.runAppInput())
      .expect(201)
    expect(fakes.client.jobCreateFake.calledOnce).to.be.true()
  })

  // todo: should test different project selection anyways

  context('error states', () => {
    it('throws 401 when user does not exist', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/apps/${app.uid}/run`)
        .set({
          ...getDefaultHeaderData({ ...user, id: user.id + 1 } as User),
        })
        .send(generate.app.runAppInput())
        .expect(401)
      expect(body.error).to.have.property('code', ErrorCodes.UNAUTHORIZED_REQUEST)
    })

    it('throws 404 when user does not have the project set', async () => {
      user.privateFilesProject = null
      await em.flush()
      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/apps/${app.uid}/run`)
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
        .post(`/apps/${anotherApp.uid}/run`)
        .set(getDefaultHeaderData(user))
        .send(generate.app.runAppInput())
      expect(body.error).to.have.property('code', ErrorCodes.APP_NOT_FOUND)
    })

    it('throws 404 if requested app does not follow the requirements', async () => {
      const nonExistentAppUid = 'app-000000000000000000000000-1'
      await em.flush()
      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/apps/${nonExistentAppUid}/run`)
        .set(getDefaultHeaderData(user))
        .send(generate.app.runAppInput())
        .expect(404)
      expect(body.error).to.have.property('code', ErrorCodes.APP_NOT_FOUND)
    })

    it('throws 404 when snapshot is provided but file does not exist', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/apps/${app.uid}/run`)
        .set(getDefaultHeaderData(user))
        .send({ ...generate.app.runAppInput(), inputs: { snapshot: generate.random.dxstr() } })
        .expect(404)
      expect(body.error).to.have.property('code', ErrorCodes.USER_FILE_NOT_FOUND)
    })
  })
})
