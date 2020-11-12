import { expect } from 'chai'
import { DateTime } from 'luxon'
import { repeat } from 'ramda'
import { EntityManager } from '@mikro-orm/core'
import { database, errors } from '@pfda/https-apps-shared'
import { App, User, Job } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import supertest from 'supertest'
import { api } from '../../../src/server'
import { dropData } from '../../utils/db'
import * as create from '../../utils/create'
import { fakes } from '../../utils/mocks'
import { getDefaultQueryData, stripEntityDates } from '../../utils/expect-helper'

describe('GET /jobs/:id', () => {
  let em: EntityManager
  let job: Job
  let user: User
  let app: App

  beforeEach(async () => {
    await dropData(database.connection())
    // create DB mocks
    em = database.orm().em
    user = create.userHelper.create(em)
    app = create.appHelper.create(em, { user })
    job = create.jobHelper.create(em, { user, app }, { state: JOB_STATE.DONE })
    await em.flush()

    fakes.client.jobDescribeFake.resetHistory()
    fakes.queue.addToQueueFake.resetHistory()
  })

  it('response shape', async () => {
    const { body } = await supertest(api.getServer())
      .get(`/jobs/${job.dxid}`)
      .query({
        ...getDefaultQueryData(user),
      })
      .expect(200)
    // the best would be to remove them
    expect(stripEntityDates(body)).to.deep.equal({
      id: job.id,
      dxid: job.dxid,
      project: job.project,
      runData: job.runData,
      // provenance: null,
      // describe: job.describe,
      state: job.state,
      name: job.name,
      scope: job.scope,
      uid: job.uid,
      userId: user.id,
      appId: app.id,
    })
    // test timestamps separately, just to make sure timezones are ok
    expect(body).to.include.keys(['createdAt'])
    expect(
      DateTime.fromISO(body.createdAt).hasSame(DateTime.fromJSDate(job.createdAt), 'hour'),
    ).to.be.true()
    // todo: keep it or leave it out?
    // expect(body).to.include.keys(['createdAt', 'updatedAt'])
    // expect(
    //   DateTime.fromISO(body.updatedAt).hasSame(DateTime.fromJSDate(job.updatedAt), 'hour'),
    // ).to.be.true()
  })

  it('will not call the platform client if the job is in terminated state', async () => {
    const jobDescribeFake = fakes.client.jobDescribeFake
    const { body } = await supertest(api.getServer())
      .get(`/jobs/${job.dxid}`)
      .query({
        ...getDefaultQueryData(user),
      })
      .expect(200)
    expect(body).to.have.property('dxid', job.dxid)
    expect(jobDescribeFake.notCalled).to.be.true()
  })

  it('will call the platform client if the job is still active', async () => {
    const jobDescribeFake = fakes.client.jobDescribeFake
    const activeJob = create.jobHelper.create(em, { user, app }, { state: JOB_STATE.IDLE })
    await em.flush()

    const { body } = await supertest(api.getServer())
      .get(`/jobs/${activeJob.dxid}`)
      .query({
        ...getDefaultQueryData(user),
      })
      .expect(200)
    expect(body).to.have.property('dxid', activeJob.dxid)
    expect(jobDescribeFake.calledOnce).to.be.true()
  })

  it('updates DB state when changes in state are discovered', async () => {
    const jobDescribeFake = fakes.client.jobDescribeFake
    const anotherJob = create.jobHelper.create(em, { user, app }, { state: JOB_STATE.IDLE })
    await em.flush()
    const platformResponse = {
      id: anotherJob.dxid,
      state: JOB_STATE.TERMINATED,
      anotherValue: 'foo',
    }
    jobDescribeFake.returns(platformResponse)

    const { body } = await supertest(api.getServer())
      .get(`/jobs/${anotherJob.dxid}`)
      .query({
        ...getDefaultQueryData(user),
      })
      .expect(200)
    expect(jobDescribeFake.calledOnce).to.be.true()
    expect(body).to.have.property('dxid', anotherJob.dxid)
    expect(body).to.have.property('state', JOB_STATE.TERMINATED)
    // check the db values
    // we need a new IdentityMap -> the API call changed the mapped entity
    // if we used original em, it would serve the result from cache
    const afterCallEm = em.fork()
    const anotherJobDb = await afterCallEm.findOne(Job, anotherJob.id)
    expect(anotherJobDb).to.have.property('describe', JSON.stringify(platformResponse))
  })

  context('error states', () => {
    it('returns 400 when query data is not provided', async () => {
      const { body } = await supertest(api.getServer()).get(`/jobs/${job.dxid}`).expect(400)
      expect(body).to.have.property('code', errors.ErrorCodes.USER_CONTEXT_QUERY_INVALID)
      expect(body.props).to.have.property('validationErrors')
    })

    it('returns 400 when jobId is invalid', async () => {
      const longString = repeat('a', 65).join('')
      const { body } = await supertest(api.getServer())
        .get(`/jobs/${longString}`)
        .query({
          ...getDefaultQueryData(user),
        })
        .expect(400)
      expect(body).to.have.property('code', errors.ErrorCodes.VALIDATION)
      expect(body.props).to.have.property('validationErrors')
    })

    it('returns 404 when job does not belong to the given user', async () => {
      const { body } = await supertest(api.getServer())
        .get(`/jobs/${job.dxid}`)
        .query({
          ...getDefaultQueryData(user),
          id: user.id + 1,
        })
        .expect(404)
      expect(body).to.have.property('code', errors.ErrorCodes.JOB_NOT_FOUND)
    })

    it.skip('returns 404 when job does not belong to the given app', async () => {
      const { body } = await supertest(api.getServer())
        .get(`/apps/${(app.id + 1).toString()}/jobs/${job.dxid}`)
        .query({
          ...getDefaultQueryData(user),
        })
        .expect(404)
      expect(body).to.have.property('code', errors.ErrorCodes.JOB_NOT_FOUND)
    })
  })
})
