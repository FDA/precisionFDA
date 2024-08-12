import { EntityManager } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { ENTITY_TYPE } from '@shared/domain/app/app.enum'
import { Job } from '@shared/domain/job/job.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { User } from '@shared/domain/user/user.entity'
import { ErrorCodes } from '@shared/errors'
import { create, db, generate } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import { expect } from 'chai'
import supertest from 'supertest'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'

describe('PATCH /jobs/:id/terminate', () => {
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
    job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.IDLE })
    await em.flush()
    mocksReset()
  })

  it('response shape', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${job.dxid}/terminate`)
      .set(getDefaultHeaderData(user))
      .send({})
      .expect(200)
    expect(body).to.be.deep.equal({
      id: job.id,
      dxid: job.dxid,
      uid: job.uid,
      project: job.project,
      state: JOB_STATE.TERMINATING,
      name: job.name,
      scope: job.scope,
      entityType: ENTITY_TYPE.HTTPS,
      runData: {
        run_inputs: {},
        run_outputs: {},
        run_instance_type: 'baseline-8',
      },
      user: user.id,
      app: app.id,
      terminationEmailSent: false,
    })
  })

  it('calls the platform API', async () => {
    await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${job.dxid}/terminate`)
      .set(getDefaultHeaderData(user))
      .expect(200)
    expect(fakes.client.jobTerminateFake.calledOnce).to.be.true()
  })

  it('does not call platform API if the job is already finished', async () => {
    job.state = JOB_STATE.TERMINATED
    await em.flush()
    const { body } = await supertest(testedApp.getHttpServer())
      .patch(`/jobs/${job.dxid}/terminate`)
      .set(getDefaultHeaderData(user))
      .expect(422)
    expect(fakes.client.jobTerminateFake.notCalled).to.be.true()
    expect(body.error.message).to.equal('Job is already terminating or terminated')
  })

  context('error states', () => {
    it('throws 404 when the job does not exist', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/jobs/${generate.random.dxstr()}/terminate`)
        .set(getDefaultHeaderData(user))
        .expect(404)
      expect(body.error).to.have.property('code', ErrorCodes.JOB_NOT_FOUND)
    })

    it('throws 404 when the job type is NOT HTTPS', async () => {
      job.entityType = ENTITY_TYPE.NORMAL
      await em.flush()
      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/jobs/${generate.random.dxstr()}/terminate`)
        .set(getDefaultHeaderData(user))
        .expect(404)
      expect(body.error).to.have.property('code', ErrorCodes.JOB_NOT_FOUND)
    })
  })
})
