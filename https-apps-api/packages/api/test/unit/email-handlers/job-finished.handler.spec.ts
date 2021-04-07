import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/core'
import { App, Job, User } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { create, generate, db } from '@pfda/https-apps-shared/src/utils/test'
import { database } from '@pfda/https-apps-shared'
import { EMAIL_CONFIG } from '@pfda/https-apps-shared/src/domain/email/email.config'
import { JobFinishedEmailHandler } from '@pfda/https-apps-shared/src/domain/email/templates/handlers'
import { OpsCtx } from '@pfda/https-apps-shared/src/types'
import { defaultLogger } from 'shared/src/logger'

describe('job-finished.handler', () => {
  let em: EntityManager
  let user: User
  let anotherUser: User
  let app: App
  let job: Job
  let ctx: OpsCtx
  // let spaceEventJobAdded: SpaceEvent
  const config = EMAIL_CONFIG.jobFinished

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em
    em.clear()
    user = create.userHelper.create(em, { email: generate.random.email() })
    anotherUser = create.userHelper.create(em, { email: generate.random.email() })

    app = create.appHelper.create(em, { user }, { spec: generate.app.jupyterAppSpecData() })
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

  it('determineReceivers() - returns job owner as receiver', async () => {
    const input = { jobId: job.id }
    const handler = new JobFinishedEmailHandler(config.emailId, input, ctx)
    const receivers = await handler.determineReceivers()
    expect(receivers).to.have.lengthOf(1)
    expect(receivers.map(r => r.id)).to.have.all.members([user.id])
  })

  it('getNotificationKey() - returns static value', () => {
    const input = { jobId: job.id }
    const handler = new JobFinishedEmailHandler(config.emailId, input, ctx)
    const key = handler.getNotificationKey()
    expect(key).to.equal('job_finished')
  })
})
