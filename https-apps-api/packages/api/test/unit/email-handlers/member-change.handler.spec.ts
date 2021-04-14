import { expect } from 'chai'
import { EntityManager, Reference } from '@mikro-orm/core'
import { config, database } from '@pfda/https-apps-shared'
import { App, Job, SpaceMembership, User, Space } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { EMAIL_CONFIG } from '@pfda/https-apps-shared/src/domain/email/email.config'
import { MemberChangedEmailHandler } from '@pfda/https-apps-shared/src/domain/email/templates/handlers'
import { OpsCtx } from '@pfda/https-apps-shared/src/types'
import { defaultLogger } from '@pfda/https-apps-shared/src/logger'
import { SPACE_MEMBERSHIP_ROLE } from '@pfda/https-apps-shared/src/domain/space-membership/space-membership.enum'
import {
  PARENT_TYPE,
  SPACE_EVENT_ACTIVITY_TYPE,
  SPACE_EVENT_OBJECT_TYPE,
} from '@pfda/https-apps-shared/src/domain/space-event/space-event.enum'
import { EmailNotification } from '@pfda/https-apps-shared/src/domain/email'

describe('member-change.handler', () => {
  let em: EntityManager
  let user: User
  let anotherUser: User
  let app: App
  let job: Job
  let space: Space
  let ctx: OpsCtx
  let anotherUserMembership: SpaceMembership
  const emailConfig = EMAIL_CONFIG.newContentAdded

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em
    em.clear()
    user = create.userHelper.create(em, { email: generate.random.email() })
    anotherUser = create.userHelper.create(em, { email: generate.random.email() })

    app = create.appHelper.create(em, { user }, { spec: generate.app.jupyterAppSpecData() })
    job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.IDLE })
    space = create.spacesHelper.create(em, { name: 'my-test-space' })
    create.spacesHelper.addMember(em, { user, space })
    anotherUserMembership = create.spacesHelper.addMember(
      em,
      { user: anotherUser, space },
      { role: SPACE_MEMBERSHIP_ROLE.VIEWER },
    )
    await em.flush()

    ctx = {
      em: database.orm().em.fork(true),
      log: defaultLogger,
      user: { id: user.id, accessToken: 'foo', dxuser: user.dxuser },
    }
  })

  context('setupContext()', () => {
    it('sets spaceEvent to the handler', async () => {
      const spaceEventMemberAdded = create.spacesHelper.createEvent(
        em,
        { user, space },
        {
          entityId: anotherUserMembership.id,
          entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_added,
          objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
          // matches spaceMembership.role
          role: SPACE_MEMBERSHIP_ROLE.VIEWER,
        },
      )
      await em.flush()
      // user id 1 added user id 2 to the space
      const input = { spaceEventId: spaceEventMemberAdded.id }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      expect(handler.spaceEvent).to.exist()
      expect(handler.spaceEvent).to.have.property('id', spaceEventMemberAdded.id)
    })
  })

  context('determineReceivers()', () => {
    it('other users from the space', async () => {
      const spaceEventMemberAdded = create.spacesHelper.createEvent(
        em,
        { user, space },
        {
          entityId: anotherUserMembership.id,
          entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_added,
          objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
          // matches spaceMembership.role
          role: SPACE_MEMBERSHIP_ROLE.VIEWER,
        },
      )
      await em.flush()
      // user id 1 added user id 2 to the space
      const input = { spaceEventId: spaceEventMemberAdded.id }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(1)
      expect(receivers.map(r => r.id)).to.have.all.members([anotherUser.id])
    })

    it('if other user is challenge bot, it is filter out', async () => {
      anotherUser.dxuser = config.users.challengeBotDxUser
      const spaceEventMemberAdded = create.spacesHelper.createEvent(
        em,
        { user, space },
        {
          entityId: anotherUserMembership.id,
          entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_added,
          objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
          // matches spaceMembership.role
          role: SPACE_MEMBERSHIP_ROLE.VIEWER,
        },
      )
      await em.flush()

      const input = { spaceEventId: spaceEventMemberAdded.id }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(0)
    })

    it('based on user settings', async () => {
      const spaceEventMemberAdded = create.spacesHelper.createEvent(
        em,
        { user, space },
        {
          entityId: anotherUserMembership.id,
          entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_changed,
          objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
          // matches spaceMembership.role
          role: SPACE_MEMBERSHIP_ROLE.VIEWER,
        },
      )
      await em.flush()
      // the key prefix has to match anotherUser's membership role in the space
      const settings = {
        all_membership_changed: false,
      } as const
      const settingsEntity = new EmailNotification({ user: anotherUser })
      settingsEntity.data = settings
      anotherUser.emailNotificationSettings = Reference.create(settingsEntity)
      await em.flush()

      const input = { spaceEventId: spaceEventMemberAdded.id }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      const receivers = await handler.determineReceivers()
      // all_membership_changed: false is applied
      expect(receivers).to.have.lengthOf(0)
    })

    it('member added notification does not exist for VIEWER, CONTRIBUTOR', async () => {
      const anotherLeadUser = create.userHelper.create(em, { email: generate.random.email() })
      create.spacesHelper.addMember(
        em,
        { user: anotherLeadUser, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD },
      )
      const spaceEventMemberAdded = create.spacesHelper.createEvent(
        em,
        { user, space },
        {
          entityId: anotherUserMembership.id,
          entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_added,
          objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
          // matches spaceMembership.role
          role: SPACE_MEMBERSHIP_ROLE.VIEWER,
        },
      )
      await em.flush()
      const input = { spaceEventId: spaceEventMemberAdded.id }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      const receivers = await handler.determineReceivers()

      expect(receivers).to.have.lengthOf(1)
      expect(receivers.map(r => r.id)).to.have.all.members([anotherLeadUser.id])
    })
  })

  context('getNotificationKey()', () => {
    it('based on space event type (member added)', async () => {
      const spaceEventMemberAdded = create.spacesHelper.createEvent(
        em,
        { user, space },
        {
          entityId: anotherUserMembership.id,
          entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_added,
          objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
          // matches spaceMembership.role
          role: SPACE_MEMBERSHIP_ROLE.VIEWER,
        },
      )
      await em.flush()
      // user id 1 added user id 2 to the space
      const input = { spaceEventId: spaceEventMemberAdded.id }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      const key = handler.getNotificationKey(spaceEventMemberAdded)
      expect(key).to.equal('member_added_or_removed_from_space')
    })

    it('based on space event type (member changed)', async () => {
      // someone changed member role from something to VIEWER
      const spaceEventMemberChanged = create.spacesHelper.createEvent(
        em,
        { user, space },
        {
          entityId: anotherUserMembership.id,
          entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_changed,
          objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
          // matches spaceMembership.role
          role: SPACE_MEMBERSHIP_ROLE.VIEWER,
        },
      )
      await em.flush()
      // user id 1 added user id 2 to the space
      const input = { spaceEventId: spaceEventMemberChanged.id }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      const key = handler.getNotificationKey(spaceEventMemberChanged)
      expect(key).to.equal('membership_changed')
    })
    // todo: complete list of space event actions

    it('throws if spaceEvent.activityType is unknown', async () => {
      // someone changed member role from something to VIEWER
      const spaceEventChanged = create.spacesHelper.createEvent(
        em,
        { user, space },
        {
          entityId: anotherUserMembership.id,
          entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
          // invalid activity_type
          activityType: SPACE_EVENT_ACTIVITY_TYPE.space_locked,
          objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
          // matches spaceMembership.role
          role: SPACE_MEMBERSHIP_ROLE.VIEWER,
        },
      )
      await em.flush()
      // user id 1 added user id 2 to the space
      const input = { spaceEventId: spaceEventChanged.id }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      expect(() => handler.getNotificationKey(spaceEventChanged)).to.throw()
    })
  })

  context('getTemplateContent()', () => {
    it('content shape', async () => {
      const spaceEventMemberAdded = create.spacesHelper.createEvent(
        em,
        { user, space },
        {
          entityId: anotherUserMembership.id,
          entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_added,
          objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
          // matches spaceMembership.role
          role: SPACE_MEMBERSHIP_ROLE.VIEWER,
        },
      )
      await em.flush()
      // user id 1 added user id 2 to the space
      const input = { spaceEventId: spaceEventMemberAdded.id }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      const content = await handler.getTemplateContent()

      expect(content).to.be.deep.equal({
        initiator: { fullName: user.fullName },
        newMember: {
          fullName: anotherUser.fullName,
          role: SPACE_MEMBERSHIP_ROLE[anotherUserMembership.role],
        },
        action: 'added a new member',
        space: { name: space.name },
      })
    })

    it('action based on event activityType', async () => {
      const spaceEventMemberAdded = create.spacesHelper.createEvent(
        em,
        { user, space },
        {
          entityId: anotherUserMembership.id,
          entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_changed,
          objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
          // matches spaceMembership.role
          role: SPACE_MEMBERSHIP_ROLE.VIEWER,
        },
      )
      await em.flush()
      // user id 1 added user id 2 to the space
      const input = { spaceEventId: spaceEventMemberAdded.id }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      const content = await handler.getTemplateContent()

      expect(content).to.have.property('action', 'changed role of member')
    })
  })
})
