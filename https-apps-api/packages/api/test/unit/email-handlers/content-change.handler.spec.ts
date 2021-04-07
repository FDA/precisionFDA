import { expect } from 'chai'
import { EntityManager, Reference } from '@mikro-orm/core'
import { App, Job, SpaceMembership, SpaceEvent, User } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { create, generate, db } from '@pfda/https-apps-shared/src/utils/test'
import { database } from '@pfda/https-apps-shared'
import { EMAIL_CONFIG } from '@pfda/https-apps-shared/src/domain/email/email.config'
import { ContentChangedEmailHandler } from '@pfda/https-apps-shared/src/domain/email/templates/handlers'
import { OpsCtx } from '@pfda/https-apps-shared/src/types'
import { defaultLogger } from '@pfda/https-apps-shared/src/logger'
import { EmailNotification } from '@pfda/https-apps-shared/src/domain/email'
import { SPACE_MEMBERSHIP_ROLE } from '@pfda/https-apps-shared/src/domain/space-membership/space-membership.enum'

describe('content-change.handler', () => {
  let em: EntityManager
  let user: User
  let anotherUser: User
  let app: App
  let job: Job
  let ctx: OpsCtx
  let spaceEventJobAdded: SpaceEvent
  let anotherUserMembership: SpaceMembership
  const config = EMAIL_CONFIG.newContentAdded

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
    anotherUserMembership = create.spacesHelper.addMember(
      em,
      { user: anotherUser, space },
      { role: SPACE_MEMBERSHIP_ROLE.VIEWER },
    )
    await em.flush()
    spaceEventJobAdded = create.spacesHelper.createEvent(em, { user, space }, { entityId: job.id })
    await em.flush()

    ctx = {
      em: database.orm().em.fork(true),
      log: defaultLogger,
      user: { id: user.id, accessToken: 'foo', dxuser: user.dxuser },
    }
  })

  it('determineReceivers() - other users from the space', async () => {
    const input = { spaceEventId: spaceEventJobAdded.id }
    const handler = new ContentChangedEmailHandler(config.emailId, input, ctx)
    const receivers = await handler.determineReceivers()
    expect(receivers).to.have.lengthOf(1)
    expect(receivers.map(r => r.id)).to.have.all.members([anotherUser.id])
  })

  it('determineReceivers() - other users from the space with active membership', async () => {
    anotherUserMembership.active = false
    await em.flush()

    const input = { spaceEventId: spaceEventJobAdded.id }
    const handler = new ContentChangedEmailHandler(config.emailId, input, ctx)
    const receivers = await handler.determineReceivers()
    expect(receivers).to.have.lengthOf(0)
  })

  it('determineReceivers() - based on user settings', async () => {
    // the key prefix has to match anotherUsers role in the space
    const settings = { all_content_added_or_deleted: false } as const
    const settingsEntity = new EmailNotification({ user: anotherUser })
    settingsEntity.data = settings
    anotherUser.emailNotificationSettings = Reference.create(settingsEntity)
    await em.flush()

    const input = { spaceEventId: spaceEventJobAdded.id }
    const handler = new ContentChangedEmailHandler(config.emailId, input, ctx)
    const receivers = await handler.determineReceivers()
    expect(receivers).to.have.lengthOf(0)
  })

  it('determineReceivers() - notifications default value = true', async () => {
    const input = { spaceEventId: spaceEventJobAdded.id }
    const handler = new ContentChangedEmailHandler(config.emailId, input, ctx)
    const receivers = await handler.determineReceivers()
    expect(receivers).to.have.lengthOf(1)
    expect(receivers.map(r => r.id)).to.have.all.members([anotherUser.id])
  })

  it('determineReceivers() - prefix has to match users space role', async () => {
    // the key prefix has to match anotherUsers role in the space
    const settings = {
      all_content_added_or_deleted: true,
      admin_content_added_or_deleted: false,
    } as const
    const settingsEntity = new EmailNotification({ user: anotherUser })
    anotherUserMembership.role = SPACE_MEMBERSHIP_ROLE.ADMIN
    settingsEntity.data = settings
    anotherUser.emailNotificationSettings = Reference.create(settingsEntity)
    await em.flush()

    const input = { spaceEventId: spaceEventJobAdded.id }
    const handler = new ContentChangedEmailHandler(config.emailId, input, ctx)
    const receivers = await handler.determineReceivers()
    // admin_content_added_or_deleted: false is applied
    expect(receivers).to.have.lengthOf(0)
  })

  it('getNotificationKey() - returns static value', () => {
    const input = { spaceEventId: spaceEventJobAdded.id }
    const handler = new ContentChangedEmailHandler(config.emailId, input, ctx)
    const key = handler.getNotificationKey()
    expect(key).to.equal('content_added_or_deleted')
  })

  // todo: getTemplateContent tests
})
