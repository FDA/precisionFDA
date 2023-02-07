import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/core'
import supertest from 'supertest'
import { App, Job, SpaceEvent, User } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { database } from '@pfda/https-apps-shared'
import { EMAIL_CONFIG } from '@pfda/https-apps-shared/src/domain/email/email.config'
import { getServer } from '../../../src/server'
import { getDefaultQueryData } from '../../utils/expect-helper'

describe('POST /emails/:id/send', () => {
  let em: EntityManager
  let user: User
  let anotherUser: User
  let app: App
  let job: Job
  let spaceEventJobAdded: SpaceEvent

  const EMAIL_ID_JOB_FINISHED = EMAIL_CONFIG.jobFinished.emailId
  const EMAIL_ID_SPACE_CONTENT = EMAIL_CONFIG.newContentAdded.emailId

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em, { email: generate.random.email() })
    anotherUser = create.userHelper.create(em, { email: generate.random.email() })

    app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
    job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.IDLE })
    const space = create.spacesHelper.create(em, { name: 'my-test-space' })
    create.spacesHelper.addMember(em, { user, space })
    create.spacesHelper.addMember(em, { user: anotherUser, space })
    await em.flush()
    spaceEventJobAdded = create.spacesHelper.createEvent(em, { user, space }, { entityId: job.id })
    await em.flush()

    mocksReset()
  })

  it('response shape & mocks call shape (JOB_FINISHED email) - is now deprecated', async () => {
    const { body } = await supertest(getServer())
      .post(`/emails/${EMAIL_ID_JOB_FINISHED}/send`)
      .query({ ...getDefaultQueryData(user) })
      .send({ input: { jobId: job.id } })
      .expect(200)
    expect(body).to.be.true()
    const [taskInput] = fakes.queue.createEmailSendTaskFake.getCall(0).args

    expect(taskInput).to.have.property('to', user.email)
    expect(taskInput).to.have.property('subject', `Execution ${job.name} finished`)
    expect(taskInput).to.have.property('body').that.is.a('string')
  })

  it('response shape & mocks call shape (JOB_FAILED email)', async () => {
    const emailId = EMAIL_CONFIG.jobFailed.emailId
    const failureReason = 'FailureReason'
    const failureMessage = 'failure message'

    job.state = JOB_STATE.FAILED
    job.describe = JSON.stringify({
      failureReason: failureReason,
      failureMessage: failureMessage,
    })
    await em.flush()

    const { body } = await supertest(getServer())
      .post(`/emails/${emailId}/send`)
      .query({ ...getDefaultQueryData(user) })
      .send({ input: { jobId: job.id } })
      .expect(200)

    expect(body).to.be.true()
    const [taskInput] = fakes.queue.createEmailSendTaskFake.getCall(0).args

    expect(taskInput).to.have.property('to', user.email)
    expect(taskInput).to.have.property('subject', `Execution "${job.name}" failed`)
    expect(taskInput.body).to.include(`${failureReason}: ${failureMessage}`)
  })

  it('mocks call shape (SPACE_CONTENT_CHANGE email)', async () => {
    const { body } = await supertest(getServer())
      .post(`/emails/${EMAIL_ID_SPACE_CONTENT}/send`)
      .query({ ...getDefaultQueryData(user) })
      .send({ input: { spaceEventId: spaceEventJobAdded.id } })
      .expect(200)
    expect(body).to.be.true()
    expect(fakes.queue.createEmailSendTaskFake.calledOnce).to.be.true()
    // user - the owner is filtered out
    const [taskInput] = fakes.queue.createEmailSendTaskFake.getCall(0).args
    expect(taskInput).to.have.property('to', anotherUser.email)
    expect(taskInput).to.have.property('subject', 'Content changed')
    expect(taskInput).to.have.property('body').that.is.a('string')
  })

  context('errors', () => {
    it('requires default input field', async () => {
      await supertest(getServer())
        .post(`/emails/${EMAIL_ID_JOB_FINISHED}/send`)
        .query({ ...getDefaultQueryData(user) })
        .send({ payload: { jobId: job.id } })
        .expect(400)
    })

    it('requires input content based on email type (JOB_FINISHED)', async () => {
      await supertest(getServer())
        .post(`/emails/${EMAIL_ID_JOB_FINISHED}/send`)
        .query({ ...getDefaultQueryData(user) })
        .send({ input: { jobIdFoo: job.id } })
        .expect(400)
    })

    it('requires input content based on email type (SPACE_CONTENT_CHANGE)', async () => {
      await supertest(getServer())
        .post(`/emails/${EMAIL_ID_SPACE_CONTENT}/send`)
        .query({ ...getDefaultQueryData(user) })
        .send({ input: { spaceEventIdFoo: job.id } })
        .expect(400)
    })
  })
})
