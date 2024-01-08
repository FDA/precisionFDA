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
import { SpaceChangedEmailHandler } from '@shared/domain/email/templates/handlers/space-change.handler'
import { UserOpsCtx } from '@shared/types'
import { defaultLogger } from '@shared/logger'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'

describe('space-change.handler', () => {
  let em: EntityManager
  let user: User
  let anotherUser: User
  let anotherUserLead: User
  let app: App
  let job: Job
  let space: Space
  let spaceMembership: SpaceMembership
  let addedSpaceMembership: SpaceMembership
  let ctx: UserOpsCtx
  const emailConfig = EMAIL_CONFIG.spaceChanged

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.create(em, { email: generate.random.email() })
    anotherUser = create.userHelper.create(em, { email: generate.random.email() })
    anotherUserLead = create.userHelper.create(em, { email: generate.random.chance.email() })

    app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
    job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.IDLE })
    space = create.spacesHelper.create(em, { name: 'my-test-space' })
    spaceMembership = create.spacesHelper.addMember(em, { user, space })
    addedSpaceMembership = create.spacesHelper.addMember(
      em,
      { user: anotherUser, space },
      { role: SPACE_MEMBERSHIP_ROLE.VIEWER, side: SPACE_MEMBERSHIP_SIDE.GUEST },
    )
    create.spacesHelper.addMember(
      em,
      { user: anotherUserLead, space },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD },
    )
    await em.flush()

    ctx = {
      em: database.orm().em.fork(),
      log: defaultLogger,
      user: { id: user.id, accessToken: 'foo', dxuser: user.dxuser },
    }
  })

  context('getTemplateContent()', () => {
    it('content shape', async () => {
      // THIS IS WHAT THE EVENT SHOULD LOOK LIKE
      // const spaceEventSpaceLocked = create.spacesHelper.createEvent(
      //   em,
      //   { user, space },
      //   {
      //     entityId: space.id,
      //     entityType: PARENT_TYPE.SPACE,
      //     activityType: SPACE_EVENT_ACTIVITY_TYPE.space_locked,
      //     objectType: SPACE_EVENT_OBJECT_TYPE.SPACE,
      //     // dunno what is this supposed to match
      //     role: SPACE_MEMBERSHIP_ROLE.ADMIN,
      //   },
      // )
      // user id 1 added user id 2 to the space
      const input = {
        initUserId: user.id,
        spaceId: space.id,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.space_locked],
      }
      const handler = new SpaceChangedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      const content = await handler.getTemplateContent()
      expect(content).to.be.deep.equal({
        initiator: { fullName: user.fullName },
        action: 'locked',
        space: { name: space.name, id: space.id },
        receiversSides: {},
        spaceMembership: { side: spaceMembership.side },
        spaceMembershipSide: SPACE_MEMBERSHIP_SIDE[spaceMembership.side],
        receiverMembershipSide: {},
      })
    })
  })

  context('determineReceivers()', () => {
    it('returns other users who are leads/admins', async () => {
      // THIS IS WHAT THE EVENT SHOULD LOOK LIKE
      // const spaceEventSpaceLocked = create.spacesHelper.createEvent(
      //   em,
      //   { user, space },
      //   {
      //     entityId: space.id,
      //     entityType: PARENT_TYPE.SPACE,
      //     activityType: SPACE_EVENT_ACTIVITY_TYPE.space_locked,
      //     objectType: SPACE_EVENT_OBJECT_TYPE.SPACE,
      //     // dunno what is this supposed to match
      //     role: SPACE_MEMBERSHIP_ROLE.ADMIN,
      //   },
      // )
      // user id 1 added user id 2 to the space
      const input = {
        initUserId: user.id,
        spaceId: space.id,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.space_locked],
      }
      const handler = new SpaceChangedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      const receivers = await handler.determineReceivers()
      expect(receivers).to.have.lengthOf(1)
      expect(receivers.map(r => r.id)).to.have.all.members([anotherUserLead.id])
    })
  })

  context('setupContext()', () => {
    it('setups the handler', async () => {
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
      // await em.flush()
      // // user id 1 added user id 2 to the space
      const input = {
        initUserId: user.id,
        spaceId: space.id,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.space_locked],
      }
      const handler = new SpaceChangedEmailHandler(emailConfig.emailId, input, ctx)
      await handler.setupContext()
      expect(handler.space).to.exist()
      expect(handler.user).to.exist()
    })
  })
})
