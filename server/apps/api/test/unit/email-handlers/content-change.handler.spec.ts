import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import {
  NotificationPreference
} from '@shared/domain/notification-preference/notification-preference.entity'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { EntityManager, Reference } from '@mikro-orm/core'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { create, generate, db } from '@shared/test'
import { EMAIL_CONFIG } from '@shared/domain/email/email.config'
import { ContentChangedEmailHandler } from '@shared/domain/email/templates/handlers/content-change.handler'
import { UserOpsCtx } from '@shared/types'
import { defaultLogger } from '@shared/logger'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { PARENT_TYPE } from '@shared/domain/space-event/space-event.enum'

describe('content-change.handler', () => {
  let em: EntityManager
  let user: User
  let anotherUser: User
  let app: App
  let job: Job
  let ctx: UserOpsCtx
  let space: Space
  let spaceEventJobAdded: SpaceEvent
  let anotherUserMembership: SpaceMembership
  const config = EMAIL_CONFIG.newContentAdded

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em, { email: generate.random.email() })
    anotherUser = create.userHelper.create(em, { email: generate.random.email() })

    app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
    job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.IDLE })
    space = create.spacesHelper.create(em, { name: 'my-test-space' })
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
      em: database.orm().em.fork(),
      log: defaultLogger,
      user: { id: user.id, accessToken: 'foo', dxuser: user.dxuser },
    }
  })

  context('determineReceivers()', () => {
    it('other users from the space', async () => {
      const input = { spaceEventId: spaceEventJobAdded.id }
      const handler = new ContentChangedEmailHandler(config.emailId, input, ctx)
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(1)
      expect(receivers.map(r => r.id)).to.have.all.members([anotherUser.id])
    })

    it('other users from the space with active membership', async () => {
      anotherUserMembership.active = false
      await em.flush()

      const input = { spaceEventId: spaceEventJobAdded.id }
      const handler = new ContentChangedEmailHandler(config.emailId, input, ctx)
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(0)
    })

    it('based on user settings', async () => {
      // the key prefix has to match anotherUsers role in the space
      const settings = { reviewer_comment_activity: true } as const
      const settingsEntity = new NotificationPreference(anotherUser)
      settingsEntity.data = settings
      anotherUser.notificationPreference = Reference.create(settingsEntity)
      await em.flush()

      const input = { spaceEventId: spaceEventJobAdded.id }
      const handler = new ContentChangedEmailHandler(config.emailId, input, ctx)
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(1)
    })

    it('notifications default value = true', async () => {
      const input = { spaceEventId: spaceEventJobAdded.id }
      const handler = new ContentChangedEmailHandler(config.emailId, input, ctx)
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(1)
      expect(receivers.map(r => r.id)).to.have.all.members([anotherUser.id])
    })

    it('prefix has to match users space role', async () => {
      // the key prefix has to match anotherUsers role in the space
      const settings = {
        all_content_added_or_deleted: true,
        admin_content_added_or_deleted: false,
      } as const
      const settingsEntity = new NotificationPreference(anotherUser)
      anotherUserMembership.role = SPACE_MEMBERSHIP_ROLE.ADMIN
      settingsEntity.data = settings
      anotherUser.notificationPreference = Reference.create(settingsEntity)
      await em.flush()

      const input = { spaceEventId: spaceEventJobAdded.id }
      const handler = new ContentChangedEmailHandler(config.emailId, input, ctx)
      const receivers = await handler.determineReceivers()
      // admin_content_added_or_deleted: false is applied
      expect(receivers).to.have.lengthOf(0)
    })
  })

  context('getNotificationKey()', () => {
    it('returns static value', () => {
      const input = { spaceEventId: spaceEventJobAdded.id }
      const handler = new ContentChangedEmailHandler(config.emailId, input, ctx)
      const key = handler.getNotificationKey()
      expect(key).to.equal('content_added_or_deleted')
    })
  })

  context('getTemplateContent()', () => {
    it('content shape', async () => {
      const input = { spaceEventId: spaceEventJobAdded.id }
      const handler = new ContentChangedEmailHandler(config.emailId, input, ctx)
      const content = await handler.getTemplateContent()

      expect(content).to.be.deep.equal({
        entityType: PARENT_TYPE.JOB,
        space: { name: space.name, id: space.id },
        user: { fullName: user.fullName },
        action: 'added',
        objectType: 'job',
      })
    })
  })
})
