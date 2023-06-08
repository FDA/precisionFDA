import { expect } from 'chai'
import { EntityManager, Reference } from '@mikro-orm/core'
import { App, Job, User } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { EMAIL_CONFIG, EMAIL_TYPES } from '@pfda/https-apps-shared/src/domain/email/email.config'
import { JobFailedEmailHandler } from '@pfda/https-apps-shared/src/domain/email/templates/handlers'
import { OpsCtx } from '@pfda/https-apps-shared/src/types'
import { defaultLogger } from '@pfda/https-apps-shared/src/logger'
import { database } from '@pfda/https-apps-shared'
import { EmailNotification } from '@pfda/https-apps-shared/src/domain/email'

describe('job-failed.handler', () => {
  let em: EntityManager
  let user: User
  let anotherUser: User
  let app: App
  let job: Job
  let ctx: OpsCtx
  const config = EMAIL_CONFIG.jobFailed

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em, { email: generate.random.email() })
    anotherUser = create.userHelper.create(em, { email: generate.random.email() })

    app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
    job = create.jobHelper.create(em, { user, app },
      {
      scope: 'private',
      state: JOB_STATE.FAILED,
      describe: JSON.stringify({
        failureReason: 'FailureReason',
        failureMessage: 'failure message',
      })
    })
    const space = create.spacesHelper.create(em, { name: 'my-test-space' })
    create.spacesHelper.addMember(em, { user, space })
    create.spacesHelper.addMember(em, { user: anotherUser, space })
    await em.flush()

    ctx = {
      em: database.orm().em.fork(),
      log: defaultLogger,
      user: { id: user.id, accessToken: 'foo', dxuser: user.dxuser },
    }
  })

  context('setupContext()', () => {
    it('loads job and parses describe json', async () => {
      const input = { jobId: job.id }
      const handler = new JobFailedEmailHandler(config.emailId, input, ctx)
      await handler.setupContext()
      expect(handler.job).to.exist()
      expect(handler.job.failureReason).to.equal('FailureReason')
      expect(handler.job.failureMessage).to.equal('failure message')
    })
  })

  context('determineReceivers()', () => {
    it('returns job owner as receiver', async () => {
      const input = { jobId: job.id }
      const handler = new JobFailedEmailHandler(config.emailId, input, ctx)
      await handler.setupContext()
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(1)
      expect(receivers.map(r => r.id)).to.have.all.members([user.id])
    })
  })

  context('getNotificationKey()', () => {
    it('returns static value', () => {
      const input = { jobId: job.id }
      const handler = new JobFailedEmailHandler(config.emailId, input, ctx)
      const key = handler.getNotificationKey()
      expect(key).to.equal('job_failed')
    })
  })

  context('template()', () => {
    it('returns general template', async () => {
      const input = { jobId: job.id }
      const handler = new JobFailedEmailHandler(config.emailId, input, ctx)
      await handler.setupContext()
      const template = await handler.template(user)

      expect(template).to.have.property('emailType', EMAIL_TYPES.jobFailed)
      expect(template.body).to.include("FailureReason: failure message")
    })

    it('returns cost limit exceeded template', async () => {
      job.describe = JSON.stringify({
        failureReason: 'CostLimitExceeded',
        failureMessage: 'failure message',
      })
      await em.flush()

      const input = { jobId: job.id }
      const handler = new JobFailedEmailHandler(config.emailId, input, ctx)
      await handler.setupContext()
      const template = await handler.template(user)

      expect(template.body).to.include("limit being reached")
    })
  })
})
