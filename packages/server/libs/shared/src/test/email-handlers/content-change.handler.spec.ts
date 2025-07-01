import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { ContentChangedEmailHandler } from '@shared/domain/email/templates/handlers/content-change.handler'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { SpaceEventRepository } from '@shared/domain/space-event/space-event.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { EmailClient } from '@shared/services/email-client'
import { stub } from 'sinon'
import { expect } from 'chai'
import { Organization } from '@shared/domain/org/org.entity'
import {
  ENTITY_TYPE,
  SPACE_EVENT_ACTIVITY_TYPE,
  SPACE_EVENT_OBJECT_TYPE,
} from '@shared/domain/space-event/space-event.enum'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { ObjectIdInputDTO } from '@shared/domain/email/email.helper'

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
      const space = new Space()
      space.id = SPACE_ID
      const spaceEvent = new SpaceEvent(userCreator, space)
      spaceEvent.id = SPACE_EVENT_ID
      spaceEvent.objectType = SPACE_EVENT_OBJECT_TYPE.APP
      spaceEvent.entityType = ENTITY_TYPE.APP
      spaceEvent.activityType = SPACE_EVENT_ACTIVITY_TYPE.app_added
      const spaceMembership = new SpaceMembership(
        user,
        space,
        SPACE_MEMBERSHIP_SIDE.GUEST,
        SPACE_MEMBERSHIP_ROLE.LEAD,
      )

      spaceEventRepoFindOneOrFailStub
        .withArgs({ id: SPACE_EVENT_ID }, { populate: ['space'] })
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
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.eq(
        EMAIL_TYPES.newContentAdded,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.eq('Content changed')
      expect(emailClientSendEmailStub.firstCall.args[0].body).to.contain(
        `app added by ${userCreator.firstName} ${userCreator.lastName}`,
      )
    })
  })
})
