import { expect } from 'chai'
import { stub } from 'sinon'
import { config } from '@shared/config'
import { InvitationToSpaceDTO } from '@shared/domain/email/dto/invitation-to-space.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { SpaceInvitationHandler } from '@shared/domain/email/templates/handlers/space-invitation.handler'
import { Organization } from '@shared/domain/org/organization.entity'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { EmailClient } from '@shared/services/email-client'

describe('SpaceInvitationHandler', () => {
  const ADMIN_ID = 123
  const USER_ID = 456
  const SPACE_MEMBERSHIP_ID = 10
  const SPACE_ID = 99

  const emailClientSendEmailStub = stub()
  const spaceMembershipRepoFindOneOrFailStub = stub()
  const userRepoFindOneOrFailStub = stub()

  const userRepo = {
    findOneOrFail: userRepoFindOneOrFailStub,
  } as unknown as UserRepository
  const spaceMembershipRepo = {
    findOneOrFail: spaceMembershipRepoFindOneOrFailStub,
  } as unknown as SpaceMembershipRepository
  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = () => {
    return new SpaceInvitationHandler(userRepo, spaceMembershipRepo, emailClient)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()

    spaceMembershipRepoFindOneOrFailStub.reset()
    spaceMembershipRepoFindOneOrFailStub.throws()

    userRepoFindOneOrFailStub.reset()
    userRepoFindOneOrFailStub.throws()
  })

  describe('#sendEmail', () => {
    it('basic', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.id = USER_ID
      user.email = 'user@email.com'
      const adminUser = new User(organization)
      adminUser.firstName = 'Šáh'
      adminUser.lastName = 'Munato'
      adminUser.email = 'admin@email.com'
      const space = new Space()
      space.id = SPACE_ID
      space.name = 'Test Space'
      const spaceMembership = new SpaceMembership(user, space, SPACE_MEMBERSHIP_SIDE.HOST, SPACE_MEMBERSHIP_ROLE.ADMIN)

      userRepoFindOneOrFailStub.withArgs({ id: ADMIN_ID }).returns(adminUser)
      spaceMembershipRepoFindOneOrFailStub
        .withArgs({ id: SPACE_MEMBERSHIP_ID }, { populate: ['spaces', 'user'] })
        .returns(spaceMembership)
      emailClientSendEmailStub.reset()

      const input = new InvitationToSpaceDTO()
      input.membershipId = SPACE_MEMBERSHIP_ID
      input.adminId = ADMIN_ID

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.eq(true)
      expect(emailClientSendEmailStub.firstCall.firstArg.emailType).to.eq(EMAIL_TYPES.spaceInvitation)
      expect(emailClientSendEmailStub.firstCall.firstArg.to).to.eq(user.email)
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.eq(
        `${adminUser.firstName} ${adminUser.lastName} added you to the space "${space.name}"`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(`${space.name}`)
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(`${config.api.railsHost}/spaces/${space.id}`)
    })
  })
})
