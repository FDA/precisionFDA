import { stub } from 'sinon'
import { SpaceActivationEmailHandler } from '@shared/domain/email/templates/handlers/space-activation.handler'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { EmailClient } from '@shared/services/email-client'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Organization } from '@shared/domain/org/organization.entity'
import { User } from '@shared/domain/user/user.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { expect } from 'chai'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { config } from '@shared/config'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'

describe('SpaceActivationHandler', () => {
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
    return new SpaceActivationEmailHandler(spaceMembershipRepo, emailClient)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()
  })

  describe('#sendEmail', () => {
    it('admin space type', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.email = 'test@email.com'
      const space = new Space()
      space.id = SPACE_ID
      space.name = 'space-name'
      space.type = SPACE_TYPE.ADMINISTRATOR

      const spaceMembership = new SpaceMembership(
        user,
        space,
        SPACE_MEMBERSHIP_SIDE.HOST,
        SPACE_MEMBERSHIP_ROLE.ADMIN,
      )
      spaceMembership.id = SPACE_MEMBERSHIP_ID

      spaceMembershipRepoFindOneOrFail
        .withArgs({ id: SPACE_MEMBERSHIP_ID }, { populate: ['user', 'spaces'] })
        .returns(spaceMembership)
      emailClientSendEmailStub.reset()

      const input = new ObjectIdInputDTO()
      input.id = SPACE_MEMBERSHIP_ID

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.eq(true)
      expect(emailClientSendEmailStub.firstCall.firstArg.emailType).to.eq(
        EMAIL_TYPES.spaceActivation,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.eq(
        `Action required to activate new space ${space.name}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `Space activation request for ${space.name} as creator`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `${config.api.railsHost}/spaces/${SPACE_ID}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        'To start adding data to this space, both creator and approver lead',
      )

      space.type = SPACE_TYPE.PRIVATE_TYPE
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.secondCall.firstArg.body).to.contain(
        'To start adding data to this space, both host and guest lead',
      )
    })
  })
})
