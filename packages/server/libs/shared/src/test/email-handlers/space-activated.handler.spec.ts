import { stub } from 'sinon'
import { SpaceActivatedHandler } from '@shared/domain/email/templates/handlers/space-activated.handler'
import { User } from '@shared/domain/user/user.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { EmailClient } from '@shared/services/email-client'
import { Organization } from '@shared/domain/org/org.entity'
import { Space } from '@shared/domain/space/space.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { expect } from 'chai'
import { ObjectIdInputDTO } from '@shared/domain/email/email.helper'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { config } from '@shared/config'

describe('SpaceActivatedHandler', () => {
  const SPACE_MEMBERSHIP_ID = 10
  const SPACE_ID = 15

  const emailClientSendEmailStub = stub()
  const spaceMembershipRepoFindOneOrFail = stub()

  const spaceMembershipRepo = {
    findOneOrFail: spaceMembershipRepoFindOneOrFail,
  } as unknown as SpaceMembershipRepository
  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = () => {
    return new SpaceActivatedHandler(spaceMembershipRepo, emailClient)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()
  })

  describe('#sendEmail', async () => {
    it('basic', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.firstName = 'Sou'
      user.lastName = 'Čet'
      user.email = 'test@email.com'
      const space = new Space()
      space.id = SPACE_ID
      space.name = 'Test Space'
      const spaceMembership = new SpaceMembership(
        user,
        space,
        SPACE_MEMBERSHIP_SIDE.HOST,
        SPACE_MEMBERSHIP_ROLE.LEAD,
      )

      spaceMembershipRepoFindOneOrFail
        .withArgs({ id: SPACE_MEMBERSHIP_ID }, { populate: ['user', 'spaces'] })
        .returns(spaceMembership)
      emailClientSendEmailStub.reset()

      const input = new ObjectIdInputDTO()
      input.id = SPACE_MEMBERSHIP_ID

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.be.true()
      expect(emailClientSendEmailStub.firstCall.firstArg.emailType).to.eq(
        EMAIL_TYPES.spaceActivated,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.eq('Space Activated')
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `Dear ${user.firstName} ${user.lastName}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `${config.api.railsHost}/spaces/${space.id}`,
      )
    })
  })
})
