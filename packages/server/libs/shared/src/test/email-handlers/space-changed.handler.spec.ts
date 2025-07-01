import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { SpaceChangedEmailHandler } from '@shared/domain/email/templates/handlers/space-change.handler'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { EmailClient } from '@shared/services/email-client'
import { stub } from 'sinon'
import { SpaceChangedDTO } from '@shared/domain/email/dto/space-changed.dto'
import { NotFoundError } from '@shared/errors'
import { Organization } from '@shared/domain/org/org.entity'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { config } from '@shared/config'

describe('SpaceChangedEmailHandler', () => {
  const SPACE_ID = 15
  const USER_ID = 10
  const ADMIN_USER_ID = 20
  const SPACE_MEMBERSHIP_ID = 22

  const emailClientSendEmailStub = stub()
  const spaceRepoFindOneOrFailStub = stub()
  const userRepoFindOneOrFailStub = stub()
  const spaceMembershipRepoFindStub = stub()

  const em = {} as unknown as SqlEntityManager
  const spaceRepo = {
    findOneOrFail: spaceRepoFindOneOrFailStub,
  } as unknown as SpaceRepository
  const userRepo = {
    findOneOrFail: userRepoFindOneOrFailStub,
  } as unknown as UserRepository
  const spaceMembershipRepo = {
    find: spaceMembershipRepoFindStub,
  } as unknown as SpaceMembershipRepository
  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = () => {
    return new SpaceChangedEmailHandler(em, spaceRepo, userRepo, spaceMembershipRepo, emailClient)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()

    spaceRepoFindOneOrFailStub.reset()
    spaceRepoFindOneOrFailStub.throws()

    userRepoFindOneOrFailStub.reset()
    userRepoFindOneOrFailStub.throws()

    spaceMembershipRepoFindStub.reset()
    spaceMembershipRepoFindStub.throws()
  })

  describe('#sendEmail', () => {
    it('space not found', async () => {
      spaceRepoFindOneOrFailStub.resolves(null)

      const input = new SpaceChangedDTO()
      input.spaceId = SPACE_ID
      input.activityType = 'space_locked'
      input.initUserId = USER_ID
      input.spaceMembershipId = SPACE_MEMBERSHIP_ID

      const handler = getHandler()
      await expect(handler.sendEmail(input)).to.be.rejectedWith(
        NotFoundError,
        `Space id ${input.spaceId} not found`,
      )
    })

    it('user not found', async () => {
      const space = new Space()
      spaceRepoFindOneOrFailStub.withArgs({ id: SPACE_ID }).resolves(space)
      userRepoFindOneOrFailStub.resolves(null)

      const input = new SpaceChangedDTO()
      input.spaceId = SPACE_ID
      input.activityType = 'space_locked'
      input.initUserId = USER_ID
      input.spaceMembershipId = SPACE_MEMBERSHIP_ID

      const handler = getHandler()
      await expect(handler.sendEmail(input)).to.be.rejectedWith(
        NotFoundError,
        `User id ${USER_ID} not found`,
      )
    })

    it('basic', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.id = USER_ID
      user.firstName = 'Antti'
      user.lastName = 'Pärle'
      const adminUser = new User(organization)
      adminUser.id = ADMIN_USER_ID
      adminUser.email = 'test@email.com'
      adminUser.firstName = 'Magika'
      const space = new Space()
      space.id = SPACE_ID
      space.name = 'space-name'
      const spaceMembership = new SpaceMembership(
        user,
        space,
        SPACE_MEMBERSHIP_SIDE.HOST,
        SPACE_MEMBERSHIP_ROLE.LEAD,
      )
      const adminSpaceMembership = new SpaceMembership(
        adminUser,
        space,
        SPACE_MEMBERSHIP_SIDE.HOST,
        SPACE_MEMBERSHIP_ROLE.LEAD,
      )

      spaceRepoFindOneOrFailStub.withArgs({ id: SPACE_ID }).returns(space)
      userRepoFindOneOrFailStub.withArgs({ id: USER_ID }).returns(user)
      spaceMembershipRepoFindStub
        .withArgs(
          {
            spaces: SPACE_ID,
            active: true,
          },
          { populate: ['user.notificationPreference'] },
        )
        .returns([spaceMembership, adminSpaceMembership])
      emailClientSendEmailStub.reset()

      const input = new SpaceChangedDTO()
      input.spaceId = SPACE_ID
      input.activityType = 'space_locked'
      input.initUserId = USER_ID
      input.spaceMembershipId = SPACE_MEMBERSHIP_ID

      const handler = getHandler()
      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.eq(true)
      expect(emailClientSendEmailStub.firstCall.firstArg.emailType).to.eq(EMAIL_TYPES.spaceChanged)
      expect(emailClientSendEmailStub.firstCall.firstArg.to).to.eq(adminUser.email)
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.eq(
        `${user.firstName} ${user.lastName} locked the space ${space.name}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `Hello ${adminUser.firstName}!`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `The space ${space.name} was locked`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `${config.api.railsHost}/spaces/${space.id}`,
      )
    })
  })
})
