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

describe('PATCH /jobs/:id/terminate', () => {
  let em: EntityManager
  let user: User
  let app: App
  let job: Job

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em
    em.clear()
    user = create.userHelper.create(em)
    app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
    job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.IDLE })
    await em.flush()
    mocksReset()
  })

  it('response shape', async () => {
    const { body } = await supertest(getServer())
      .patch(`/jobs/${job.dxid}/terminate`)
      .query({ ...getDefaultQueryData(user) })
      .send({})
      .expect(200)
    expect(body).to.be.deep.equal({
      id: job.id,
      dxid: job.dxid,
      project: job.project,
      state: JOB_STATE.TERMINATING,
      name: job.name,
      scope: job.scope,
      entityType: ENTITY_TYPE.HTTPS,
      user: user.id,
      app: app.id,
      terminationEmailSent: false
    })
  })

  it('calls the platform API', async () => {
    await supertest(getServer())
      .patch(`/jobs/${job.dxid}/terminate`)
      .query({ ...getDefaultQueryData(user) })
      .expect(200)
    expect(fakes.client.jobTerminateFake.calledOnce).to.be.true()
  })

  it('does not call platform API if the job is already finished', async () => {
    job.state = JOB_STATE.TERMINATED
    await em.flush()
    const { body } = await supertest(getServer())
      .patch(`/jobs/${job.dxid}/terminate`)
      .query({ ...getDefaultQueryData(user) })
      .expect(422)
    expect(fakes.client.jobTerminateFake.notCalled).to.be.true()
    expect(body.error.message).to.equal('Job is already terminating or terminated')
  })

  context('error states', () => {
    it('throws 404 when the job does not exist', async () => {
      const { body } = await supertest(getServer())
        .patch(`/jobs/${generate.random.dxstr()}/terminate`)
        .query({ ...getDefaultQueryData(user) })
        .expect(404)
      expect(body.error).to.have.property('code', errors.ErrorCodes.JOB_NOT_FOUND)
    })

    it('throws 404 when the job type is NOT HTTPS', async () => {
      job.entityType = ENTITY_TYPE.NORMAL
      await em.flush()
      const { body } = await supertest(getServer())
        .patch(`/jobs/${generate.random.dxstr()}/terminate`)
        .query({ ...getDefaultQueryData(user) })
        .expect(404)
      expect(body.error).to.have.property('code', errors.ErrorCodes.JOB_NOT_FOUND)
    })
  })
})
