import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import {
  NotificationPreference
} from '@shared/domain/notification-preference/notification-preference.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { EntityManager, Reference } from '@mikro-orm/core'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { create, generate, db } from '@shared/test'
import { EMAIL_CONFIG } from '@shared/domain/email/email.config'
import { JobFinishedEmailHandler } from '@shared/domain/email/templates/handlers/job-finished.handler'
import { UserOpsCtx } from '@shared/types'
import { defaultLogger } from '@shared/logger'

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

    ctx = {
      em: database.orm().em.fork(),
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
      const settingsEntity = new NotificationPreference(user)
      settingsEntity.data = { private_job_finished: false }
      user.notificationPreference = Reference.create(settingsEntity)
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
