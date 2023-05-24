import { expect } from 'chai'
import { EntityManager, Reference } from '@mikro-orm/core'
import { database } from '@pfda/https-apps-shared'
import {
  Job,
  SpaceMembership,
  User,
  Space,
  Comment,
  NotificationPreference
} from '@pfda/https-apps-shared/src/domain'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { EMAIL_CONFIG } from '@pfda/https-apps-shared/src/domain/email/email.config'
import { CommentAddedEmailHandler } from '@pfda/https-apps-shared/src/domain/email/templates/handlers'
import { UserOpsCtx } from '@pfda/https-apps-shared/src/types'
import { defaultLogger } from '@pfda/https-apps-shared/src/logger'
import { SPACE_MEMBERSHIP_ROLE } from '@pfda/https-apps-shared/src/domain/space-membership/space-membership.enum'

describe('member-change.handler', () => {
  let em: EntityManager
  let user: User
  let anotherUser: User
  let space: Space
  let comment: Comment
  let job: Job
  let ctx: UserOpsCtx
  let anotherUserMembership: SpaceMembership
  const emailConfig = EMAIL_CONFIG.newContentAdded

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em, { email: generate.random.email() })
    anotherUser = create.userHelper.create(em, { email: generate.random.email() })

    space = create.spacesHelper.create(em, { name: 'my-test-space' })
    comment = create.commentHelper.create(em, { user })
    job = create.jobHelper.create(em, { user })
    create.spacesHelper.addMember(em, { user, space })
    anotherUserMembership = create.spacesHelper.addMember(
      em,
      { user: anotherUser, space },
      { role: SPACE_MEMBERSHIP_ROLE.VIEWER },
    )
    await em.flush()

    ctx = {
      em: database.orm().em.fork(),
      log: defaultLogger,
      user: { id: user.id, accessToken: 'foo', dxuser: user.dxuser },
    }
  })

  context('setupContext()', () => {
    it('loads space event', async () => {
      const eventCommentAdded = create.spacesHelper.createEvent(
        em,
        { user, space },
        {
          ...generate.spaceEvent.commentAdded(),
          entityId: comment.id,
        },
      )
      await em.flush()
      const input = { spaceEventId: eventCommentAdded.id }
      const handler = new CommentAddedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      expect(handler.spaceEvent).to.exist()
      expect(handler.spaceEvent.space.getEntity()).to.exist()
      expect(handler.comment).to.exist()
      expect(handler.comment.user.getEntity()).to.exist()
      expect(handler.objectCommentsLink).to.exist()
      expect(handler.objectCommentsLink).includes(job.uid)
    })
  })

  context('determineReceivers()', () => {
    it('returns all space members except comment creator', async () => {
      const eventCommentAdded = create.spacesHelper.createEvent(
        em,
        { user, space },
        {
          ...generate.spaceEvent.commentAdded(),
          entityId: comment.id,
        },
      )
      await em.flush()
      const input = { spaceEventId: eventCommentAdded.id }
      const handler = new CommentAddedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(1)
      expect(receivers.map(u => u.id)).to.have.all.members([anotherUser.id])
    })

    it('applies users email settings', async () => {
      const eventCommentAdded = create.spacesHelper.createEvent(
        em,
        { user, space },
        {
          ...generate.spaceEvent.commentAdded(),
          entityId: comment.id,
        },
      )
      const settingsEntity = new NotificationPreference(anotherUser)
      settingsEntity.data = { reviewer_comment_activity: true }
      anotherUser.notificationPreference = Reference.create(settingsEntity)
      await em.flush()

      const input = { spaceEventId: eventCommentAdded.id }
      const handler = new CommentAddedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      const receivers = await handler.determineReceivers()
      // anotherUser gets filtered out
      expect(receivers).to.have.lengthOf(1)
    })
  })

  context('getNotificationKey()', () => {
    it('returns static notification key', async () => {
      const eventCommentAdded = create.spacesHelper.createEvent(
        em,
        { user, space },
        {
          ...generate.spaceEvent.commentAdded(),
          entityId: comment.id,
        },
      )
      await em.flush()
      const input = { spaceEventId: eventCommentAdded.id }
      const handler = new CommentAddedEmailHandler(emailConfig.emailId, input, ctx)
      const key = handler.getNotificationKey()
      expect(key).to.equal('comment_activity')
    })
  })
})
