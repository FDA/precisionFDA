import { expect } from 'chai'
import { EntityManager, Reference } from '@mikro-orm/core'
import { App, Job, User } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { EMAIL_CONFIG } from '@pfda/https-apps-shared/src/domain/email/email.config'
import { JobFinishedEmailHandler } from '@pfda/https-apps-shared/src/domain/email/templates/handlers'
import { UserOpsCtx } from '@pfda/https-apps-shared/src/types'
import { defaultLogger } from '@pfda/https-apps-shared/src/logger'
import { database } from '@pfda/https-apps-shared'
import { EmailNotification } from '@pfda/https-apps-shared/src/domain/email'

describe('job-finished.handler', () => {
  let em: EntityManager
  let user: User
  let anotherUser: User
  let app: App
  let job: Job
  let ctx: UserOpsCtx
  const config = EMAIL_CONFIG.jobFinished

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em
    em.clear()
    user = create.userHelper.create(em, { email: generate.random.email() })
    anotherUser = create.userHelper.create(em, { email: generate.random.email() })

    app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
    job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.IDLE })
    const space = create.spacesHelper.create(em, { name: 'my-test-space' })
    create.spacesHelper.addMember(em, { user, space })
    create.spacesHelper.addMember(em, { user: anotherUser, space })
    await em.flush()

    ctx = {
      em: database.orm().em.fork(true),
      log: defaultLogger,
      user: { id: user.id, accessToken: 'foo', dxuser: user.dxuser },
    }
  })

  context('setupContext()', () => {
    it('loads job', async () => {
      const input = { jobId: job.id }
      const handler = new JobFinishedEmailHandler(config.emailId, input, ctx)
      await handler.setupContext()
      expect(handler.job).to.exist()
    })
  })

  context('determineReceivers()', () => {
    it('returns job owner as receiver', async () => {
      const input = { jobId: job.id }
      const handler = new JobFinishedEmailHandler(config.emailId, input, ctx)
      await handler.setupContext()
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(1)
      expect(receivers.map(r => r.id)).to.have.all.members([user.id])
    })

    it('applies owners notification settings', async () => {
      const settingsEntity = new EmailNotification({ user })
      settingsEntity.data = { private_job_finished: false }
      user.emailNotificationSettings = Reference.create(settingsEntity)
      await em.flush()
      const input = { jobId: job.id }
      const handler = new JobFinishedEmailHandler(config.emailId, input, ctx)
      await handler.setupContext()
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(0)
    })
  })

  context('getNotificationKey()', () => {
    it('returns static value', () => {
      const input = { jobId: job.id }
      const handler = new JobFinishedEmailHandler(config.emailId, input, ctx)
      const key = handler.getNotificationKey()
      expect(key).to.equal('job_finished')
    })
  })
})
