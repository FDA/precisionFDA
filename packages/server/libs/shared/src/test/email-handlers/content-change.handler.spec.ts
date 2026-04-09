import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { stub } from 'sinon'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { ContentChangedEmailHandler } from '@shared/domain/email/templates/handlers/content-change.handler'
import { NotificationPreference } from '@shared/domain/notification-preference/notification-preference.entity'
import { Organization } from '@shared/domain/org/organization.entity'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import {
  ENTITY_TYPE,
  SPACE_EVENT_ACTIVITY_TYPE,
  SPACE_EVENT_OBJECT_TYPE,
} from '@shared/domain/space-event/space-event.enum'
import { SpaceEventRepository } from '@shared/domain/space-event/space-event.repository'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { User } from '@shared/domain/user/user.entity'
import { EmailClient } from '@shared/services/email-client'

describe('ContentChangedEmailHandler', () => {
  const SPACE_EVENT_ID = 10
  const SPACE_ID = 15
  const EVENT_CREATOR_ID = 789

  const emailClientSendEmailStub = stub()
  const spaceEventRepoFindOneOrFailStub = stub()
  const spaceMembershipRepoFindStub = stub()

  const em = {} as unknown as SqlEntityManager
  const spaceEventRepo = {
    findOneOrFail: spaceEventRepoFindOneOrFailStub,
  } as unknown as SpaceEventRepository
  const spaceMembershipRepo = {
    find: spaceMembershipRepoFindStub,
  } as unknown as SpaceMembershipRepository
  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = () => {
    return new ContentChangedEmailHandler(em, spaceEventRepo, spaceMembershipRepo, emailClient)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()

    spaceEventRepoFindOneOrFailStub.reset()
    spaceEventRepoFindOneOrFailStub.throws()

    spaceMembershipRepoFindStub.reset()
    spaceMembershipRepoFindStub.throws()
  })

  describe('#sendEmail', () => {
    it('basic', async () => {
      const organization = new Organization()
      const user = new User(organization)
      const userCreator = new User(organization)
      userCreator.firstName = 'Antonio'
      userCreator.lastName = 'Seruti'
      userCreator.email = 'test@email.com'
      userCreator.id = EVENT_CREATOR_ID
      const notificationPref = new NotificationPreference(user)
      notificationPref.data = {
        group_lead_content_added_or_deleted: true,
      }

      user.notificationPreference = Reference.create(notificationPref)
      const space = new Space()
      space.id = SPACE_ID
      space.type = SPACE_TYPE.GROUPS
      const spaceEvent = new SpaceEvent(userCreator, space)
      spaceEvent.id = SPACE_EVENT_ID
      spaceEvent.objectType = SPACE_EVENT_OBJECT_TYPE.APP
      spaceEvent.entityType = ENTITY_TYPE.APP
      spaceEvent.activityType = SPACE_EVENT_ACTIVITY_TYPE.app_added
      const spaceMembership = new SpaceMembership(user, space, SPACE_MEMBERSHIP_SIDE.GUEST, SPACE_MEMBERSHIP_ROLE.LEAD)

      spaceEventRepoFindOneOrFailStub
        .withArgs(
          { id: SPACE_EVENT_ID },
          { populate: ['space', 'space.spaceMemberships', 'space.spaceMemberships.user'] },
        )
        .resolves(spaceEvent)
      spaceMembershipRepoFindStub
        .withArgs(
          {
            spaces: SPACE_ID,
            active: true,
          },
          { populate: ['user.notificationPreference'] },
        )
        .resolves([spaceMembership])
      const input = new ObjectIdInputDTO()
      input.id = SPACE_EVENT_ID
      emailClientSendEmailStub.reset()

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.eq(true)
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.eq(EMAIL_TYPES.newContentAdded)
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.eq('Content changed')
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain(
        `app added by ${userCreator.firstName} ${userCreator.lastName}`,
      )
    })
  })
})
