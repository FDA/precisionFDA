import { config } from '@shared/config'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { EntityManager } from '@mikro-orm/core'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { create, generate, db } from '@shared/test'
import { EMAIL_CONFIG } from '@shared/domain/email/email.config'
import { MemberChangedEmailHandler } from '@shared/domain/email/templates/handlers/member-change.handler'
import { UserOpsCtx } from '@shared/types'
import { defaultLogger } from '@shared/logger'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'

describe('member-change.handler', () => {
  let em: EntityManager
  let user: User
  let anotherUser: User
  let app: App
  let job: Job
  let space: Space
  let ctx: UserOpsCtx
  let anotherUserMembership: SpaceMembership
  const emailConfig = EMAIL_CONFIG.memberChangedAddedRemoved

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

    ctx = {
      em: database.orm().em.fork(),
      log: defaultLogger,
      user: { id: user.id, accessToken: 'foo', dxuser: user.dxuser },
    }
  })

  context('setupContext()', () => {
    it('setups the handler', async () => {
      // the event does not exist in the DB when this email handler is called
      // transaction issue in the rails app...
      // THIS IS WHAT THE EVENT SHOULD LOOK LIKE
      // create.spacesHelper.createEvent(
      //   em,
      //   { user, space },
      //   {
      //     entityId: anotherUserMembership.id,
      //     entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
      //     activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_added,
      //     objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
      //     // matches spaceMembership.role
      //     role: SPACE_MEMBERSHIP_ROLE.VIEWER,
      //   },
      // )
      // user id 1 added user id 2 to the space
      // input simulates data in the shape they are in the rails app
      const input = {
        updatedMembershipId: anotherUserMembership.id,
        initUserId: user.id,
        spaceId: space.id,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.membership_added],
        newMembershipRole: SPACE_MEMBERSHIP_ROLE[SPACE_MEMBERSHIP_ROLE.VIEWER].toLowerCase(),
      }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      expect(handler.space).to.exist()
      expect(handler.user).to.exist()
      expect(handler.updatedMembership).to.exist()
      expect(handler.updatedMembership.user.getEntity()).to.exist()
    })
  })

  context('determineReceivers()', () => {
    it('other users from the space (admin or leads)', async () => {
      anotherUserMembership.role = SPACE_MEMBERSHIP_ROLE.LEAD
      // THIS IS WHAT THE EVENT SHOULD LOOK LIKE
      // const spaceEventMemberAdded = create.spacesHelper.createEvent(
      //   em,
      //   { user, space },
      //   {
      //     entityId: anotherUserMembership.id,
      //     entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
      //     activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_added,
      //     objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
      //     // matches spaceMembership.role
      //     role: SPACE_MEMBERSHIP_ROLE.VIEWER,
      //   },
      // )
      await em.flush()
      // user id 1 added user id 2 to the space
      const input = {
        updatedMembershipId: anotherUserMembership.id,
        initUserId: user.id,
        spaceId: space.id,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.membership_added],
        newMembershipRole: SPACE_MEMBERSHIP_ROLE[SPACE_MEMBERSHIP_ROLE.VIEWER].toLowerCase(),
      }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(1)
      expect(receivers.map(r => r.id)).to.have.all.members([anotherUser.id])
    })

    it('if other user is challenge bot, it is filter out', async () => {
      anotherUser.dxuser = config.platform.challengeBotUser
      // THIS IS WHAT THE EVENT SHOULD LOOK LIKE
      // const spaceEventMemberAdded = create.spacesHelper.createEvent(
      //   em,
      //   { user, space },
      //   {
      //     entityId: anotherUserMembership.id,
      //     entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
      //     activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_added,
      //     objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
      //     // matches spaceMembership.role
      //     role: SPACE_MEMBERSHIP_ROLE.VIEWER,
      //   },
      // )
      await em.flush()

      const input = {
        updatedMembershipId: anotherUserMembership.id,
        initUserId: user.id,
        spaceId: space.id,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.membership_added],
        newMembershipRole: SPACE_MEMBERSHIP_ROLE[SPACE_MEMBERSHIP_ROLE.VIEWER].toLowerCase(),
      }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(0)
    })

    it('member added notification does not exist for VIEWER, CONTRIBUTOR', async () => {
      const anotherLeadUser = create.userHelper.create(em, { email: generate.random.email() })
      create.spacesHelper.addMember(
        em,
        { user: anotherLeadUser, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD },
      )
      // THIS IS WHAT THE EVENT SHOULD LOOK LIKE
      // const spaceEventMemberAdded = create.spacesHelper.createEvent(
      //   em,
      //   { user, space },
      //   {
      //     entityId: anotherUserMembership.id,
      //     entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
      //     activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_added,
      //     objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
      //     // matches spaceMembership.role
      //     role: SPACE_MEMBERSHIP_ROLE.VIEWER,
      //   },
      // )
      await em.flush()
      const input = {
        updatedMembershipId: anotherUserMembership.id,
        initUserId: user.id,
        spaceId: space.id,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.membership_added],
        newMembershipRole: SPACE_MEMBERSHIP_ROLE[SPACE_MEMBERSHIP_ROLE.VIEWER].toLowerCase(),
      }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      const receivers = await handler.determineReceivers()

      expect(receivers).to.have.lengthOf(1)
      expect(receivers.map(r => r.id)).to.have.all.members([anotherLeadUser.id])
    })
  })

  context('getNotificationKey()', () => {
    it('based on space event type (member added)', async () => {
      // THIS IS WHAT THE EVENT SHOULD LOOK LIKE
      // const spaceEventMemberAdded = create.spacesHelper.createEvent(
      //   em,
      //   { user, space },
      //   {
      //     entityId: anotherUserMembership.id,
      //     entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
      //     activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_added,
      //     objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
      //     // matches spaceMembership.role
      //     role: SPACE_MEMBERSHIP_ROLE.VIEWER,
      //   },
      // )
      // user id 1 added user id 2 to the space
      const input = {
        updatedMembershipId: anotherUserMembership.id,
        initUserId: user.id,
        spaceId: space.id,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.membership_added],
        newMembershipRole: SPACE_MEMBERSHIP_ROLE[SPACE_MEMBERSHIP_ROLE.VIEWER].toLowerCase(),
      }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      const key = handler.getNotificationKey()
      expect(key).to.equal('member_added_to_space')
    })

    it('based on space event type (member changed)', async () => {
      // someone changed member role from something to VIEWER
      // THIS IS WHAT THE EVENT SHOULD LOOK LIKE
      // const spaceEventMemberChanged = create.spacesHelper.createEvent(
      //   em,
      //   { user, space },
      //   {
      //     entityId: anotherUserMembership.id,
      //     entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
      //     activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_changed,
      //     objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
      //     // matches spaceMembership.role
      //     role: SPACE_MEMBERSHIP_ROLE.VIEWER,
      //   },
      // )
      // user id 1 added user id 2 to the space
      const input = {
        updatedMembershipId: anotherUserMembership.id,
        initUserId: user.id,
        spaceId: space.id,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.membership_changed],
        newMembershipRole: SPACE_MEMBERSHIP_ROLE[SPACE_MEMBERSHIP_ROLE.VIEWER].toLowerCase(),
      }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      const key = handler.getNotificationKey()
      expect(key).to.equal('membership_changed')
    })
    // todo: complete list of space event actions

    it('throws if spaceEvent.activityType is unknown', async () => {
      const input = {
        updatedMembershipId: anotherUserMembership.id,
        initUserId: user.id,
        spaceId: space.id,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.space_locked],
        newMembershipRole: SPACE_MEMBERSHIP_ROLE[SPACE_MEMBERSHIP_ROLE.VIEWER].toLowerCase(),
      }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      expect(() => handler.getNotificationKey()).to.throw()
    })
  })

  context('getTemplateContent()', () => {
    it('content shape', async () => {
      // THIS IS WHAT THE EVENT SHOULD LOOK LIKE
      // const spaceEventMemberAdded = create.spacesHelper.createEvent(
      //   em,
      //   { user, space },
      //   {
      //     entityId: anotherUserMembership.id,
      //     entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
      //     activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_added,
      //     objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
      //     // matches spaceMembership.role
      //     role: SPACE_MEMBERSHIP_ROLE.VIEWER,
      //   },
      // )
      // user id 1 added user id 2 to the space
      const input = {
        updatedMembershipId: anotherUserMembership.id,
        initUserId: user.id,
        spaceId: space.id,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.membership_added],
        newMembershipRole: SPACE_MEMBERSHIP_ROLE[SPACE_MEMBERSHIP_ROLE.VIEWER].toLowerCase(),
      }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      const content = await handler.getTemplateContent()

      expect(content).to.be.deep.equal({
        initiator: { fullName: user.fullName },
        newMember: {
          fullName: anotherUser.fullName,
          role: SPACE_MEMBERSHIP_ROLE[anotherUserMembership.role].toLowerCase(),
        },
        action: 'added a new member',
        space: { name: space.name, id: space.id },
      })
    })

    it('action based on event activityType', async () => {
      // THIS IS WHAT THE EVENT SHOULD LOOK LIKE
      // const spaceEventMemberAdded = create.spacesHelper.createEvent(
      //   em,
      //   { user, space },
      //   {
      //     entityId: anotherUserMembership.id,
      //     entityType: PARENT_TYPE.SPACE_MEMBERSHIP,
      //     activityType: SPACE_EVENT_ACTIVITY_TYPE.membership_changed,
      //     objectType: SPACE_EVENT_OBJECT_TYPE.MEMBERSHIP,
      //     // matches spaceMembership.role
      //     role: SPACE_MEMBERSHIP_ROLE.VIEWER,
      //   },
      // )
      // user id 1 added user id 2 to the space
      const input = {
        updatedMembershipId: anotherUserMembership.id,
        initUserId: user.id,
        spaceId: space.id,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.membership_changed],
        newMembershipRole: SPACE_MEMBERSHIP_ROLE[SPACE_MEMBERSHIP_ROLE.VIEWER].toLowerCase(),
      }
      const handler = new MemberChangedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      const content = await handler.getTemplateContent()

      expect(content).to.have.property('action', 'changed role of member')
    })
  })
})
