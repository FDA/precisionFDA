import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/mysql'
import { errors, database, app as appDomain } from '@pfda/https-apps-shared'
import supertest from 'supertest'
import { App, User } from '@pfda/https-apps-shared/src/domain'
import {
  JOB_STATE,
  JOB_DB_ENTITY_TYPE,
  DEFAULT_INSTANCE_TYPE,
} from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { api } from '../../../src/server'
import { dropData } from '../../utils/db'
import * as create from '../../utils/create'
import * as generate from '../../utils/generate'
import { fakes } from '../../utils/mocks'
import { getDefaultQueryData, stripEntityDates } from '../../utils/expect-helper'

describe('POST /apps/:id/run', () => {
  let em: EntityManager
  let user: User
  let app: App

  beforeEach(async () => {
    await dropData(database.connection())
    // create DB mocks
    em = database.orm().em
    em.clear()
    user = create.userHelper.create(em)
    app = create.appHelper.create(em, { user }, { spec: generate.app.jupyterAppSpecData() })
    await em.flush()
    // handle the stubs
    fakes.client.jobCreateFake.resetHistory()
    fakes.queue.createJobSyncTaskFake.resetHistory()
  })

  it('response shape', async () => {
    const { body } = await supertest(api.getServer())
      .post(`/apps/${app.dxid}/run`)
      .query({ ...getDefaultQueryData(user) })
      .send(generate.app.runAppInput())
      .expect(201)
    expect(stripEntityDates(body)).to.deep.equal({
      id: 1,
      app: app.id,
      appSeriesId: null,
      name: app.title,
      dxid: generate.job.jobId(),
      uid: `${generate.job.jobId()}-1`,
      entityType: JOB_DB_ENTITY_TYPE.HTTPS,
      user: user.id,
      taggings: [],
      // default app type
      project: user.jupyterProject,
      state: JOB_STATE.IDLE,
      scope: 'public',
      provenance: {
        [generate.job.jobId()]: {
          app_dxid: app.dxid,
          app_id: app.id,
          inputs: {},
        },
      },
      runData: {
        run_instance_type: DEFAULT_INSTANCE_TYPE,
        run_inputs: {
          duration: generate.app.runAppInput().input.duration,
          feature: 'PYTHON_R', // default from the specs
        },
        run_outputs: {},
      },
    })
  })

  it('response shape - ttyd app', async () => {
    const { body } = await supertest(api.getServer())
      .post(`/apps/${app.dxid}/run`)
      .query({ ...getDefaultQueryData(user) })
      .send(generate.app.runTtydAppInput())
      .expect(201)
    expect(stripEntityDates(body)).to.deep.equal({
      id: 1,
      app: app.id,
      appSeriesId: null,
      name: app.title,
      dxid: generate.job.jobId(),
      uid: `${generate.job.jobId()}-1`,
      entityType: JOB_DB_ENTITY_TYPE.HTTPS,
      user: user.id,
      taggings: [],
      // default app type
      project: user.ttydProject,
      state: JOB_STATE.IDLE,
      scope: 'public',
      // todo:
      // provenance: {},
      runData: {
        run_instance_type: DEFAULT_INSTANCE_TYPE,
        run_inputs: {},
        run_outputs: {},
      },
    })
  })

  it('accepts snapshot file dxid', async () => {
    const snapshotFile = create.filesHelper.create(em, { user })
    await em.flush()
    const input = {
      ...generate.app.runAppInput(),
      input: {
        snapshot: snapshotFile.dxid,
      },
    }
    const { body } = await supertest(api.getServer())
      .post(`/apps/${app.dxid}/run`)
      .query({ ...getDefaultQueryData(user) })
      .send(input)
      .expect(201)
    expect(body)
      .to.have.property('provenance')
      .that.is.deep.equal({
        [generate.job.jobId()]: {
          app_dxid: app.dxid,
          app_id: app.id,
          inputs: { snapshot: snapshotFile.dxid },
        },
      })
    const jobFileRows = await em.createQueryBuilder('job_inputs').select('*').execute()
    expect(jobFileRows).to.be.an('array').with.lengthOf(1)
    expect(jobFileRows[0]).to.have.property('job_id', body.id)
    expect(jobFileRows[0]).to.have.property('user_file_id', snapshotFile.id)
  })

  // todo: tests job files creation!

  // todo: test all default values and overrides
  it('calls the platform API', async () => {
    await supertest(api.getServer())
      .post(`/apps/${app.dxid}/run`)
      .query({ ...getDefaultQueryData(user) })
      .send(generate.app.runAppInput())
      .expect(201)
    expect(fakes.client.jobCreateFake.calledOnce).to.be.true()
  })

  it('calls queue helper', async () => {
    const { body } = await supertest(api.getServer())
      .post(`/apps/${app.dxid}/run`)
      .query({ ...getDefaultQueryData(user) })
      .send(generate.app.runAppInput())
      .expect(201)
    expect(fakes.queue.createJobSyncTaskFake.calledOnce).to.be.true()
    const fakeCallArgs = fakes.queue.createJobSyncTaskFake.getCall(0).args
    expect(fakeCallArgs[0]).to.deep.equal({
      dxid: body.dxid,
    })
    expect(fakeCallArgs[1]).to.deep.equal({
      id: user.id,
      accessToken: 'fake-token',
      dxuser: user.dxuser,
    })
  })

  it('uses correct project reference based on app type', async () => {
    const { body } = await supertest(api.getServer())
      .post(`/apps/${app.dxid}/run`)
      .query({ ...getDefaultQueryData(user) })
      .send({
        ...generate.app.runAppInput(),
        httpsAppType: appDomain.enums.APP_HTTPS_SUBTYPE.TTYD,
      })
      .expect(201)
    expect(body).to.have.property('project', user.ttydProject)
    const fakeCallArgs = fakes.client.jobCreateFake.getCall(0).args[0]
    expect(fakeCallArgs).to.have.property('project', user.ttydProject)
  })

  context('error states', () => {
    it('throws 404 when user does not exist', async () => {
      const { body } = await supertest(api.getServer())
        .post(`/apps/${app.dxid}/run`)
        .query({
          ...getDefaultQueryData(user),
          id: user.id + 1,
        })
        .send(generate.app.runAppInput())
        .expect(404)
      expect(body).to.have.property('code', errors.ErrorCodes.USER_NOT_FOUND)
    })

    it('throws 401 when user does not own the app', async () => {
      const anotherUser = create.userHelper.create(em)
      const anotherApp = create.appHelper.create(em, { user: anotherUser })
      await em.flush()
      const { body } = await supertest(api.getServer())
        .post(`/apps/${anotherApp.dxid}/run`)
        .query({
          ...getDefaultQueryData(user),
        })
        .send(generate.app.runAppInput())
        .expect(404)
      expect(body).to.have.property('code', errors.ErrorCodes.APP_NOT_FOUND)
    })

    it('throws 404 when snapshot is provided but file does not exist', async () => {
      const { body } = await supertest(api.getServer())
        .post(`/apps/${app.dxid}/run`)
        .query({
          ...getDefaultQueryData(user),
        })
        .send({ ...generate.app.runAppInput(), input: { snapshot: generate.random.dxstr() } })
        .expect(404)
      expect(body).to.have.property('code', errors.ErrorCodes.USER_FILE_NOT_FOUND)
    })
  })
})
