import { expect } from 'chai'
import { MemberChangedEmailHandler } from '@shared/domain/email/templates/handlers/member-change.handler'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { EmailClient } from '@shared/services/email-client'
import { stub } from 'sinon'
import { MemberChangedDTO } from '@shared/domain/email/dto/member-changed.dto'
import { NotFoundError } from '@shared/errors'
import { Space } from '@shared/domain/space/space.entity'
import { Organization } from '@shared/domain/org/org.entity'
import { User } from '@shared/domain/user/user.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { NotificationPreference } from '@shared/domain/notification-preference/notification-preference.entity'
import { Reference } from '@mikro-orm/core'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'

describe('MemberChangedEmailHandler', () => {
  const SPACE_ID = 15
  const USER_ID = 11
  const USER2_ID = 12
  const SPACE_MEMBERSHIP_ID = 20

  const emailClientSendEmailStub = stub()
  const spaceRepoFindOneOrFailStub = stub()
  const userRepoFindOneOrFailStub = stub()
  const spaceMembershipRepoFindOneOrFailStub = stub()
  const spaceMembershipRepoFindStub = stub()

  const em = {} as unknown as SqlEntityManager
  const spaceRepo = {
    findOneOrFail: spaceRepoFindOneOrFailStub,
  } as unknown as SpaceRepository
  const userRepo = {
    findOneOrFail: userRepoFindOneOrFailStub,
  } as unknown as UserRepository
  const spaceMembershipRepo = {
    findOneOrFail: spaceMembershipRepoFindOneOrFailStub,
    find: spaceMembershipRepoFindStub,
  } as unknown as SpaceMembershipRepository
  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = (): MemberChangedEmailHandler => {
    return new MemberChangedEmailHandler(em, spaceRepo, userRepo, spaceMembershipRepo, emailClient)
  }

  beforeEach(async () => {
    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()

    spaceRepoFindOneOrFailStub.reset()
    spaceRepoFindOneOrFailStub.throws()

    userRepoFindOneOrFailStub.reset()
    userRepoFindOneOrFailStub.throws()

    spaceMembershipRepoFindOneOrFailStub.reset()
    spaceMembershipRepoFindOneOrFailStub.throws()

    spaceMembershipRepoFindStub.reset()
    spaceMembershipRepoFindStub.throws()
  })

  describe('#sendEmail', () => {
    it('space not found', async () => {
      spaceRepoFindOneOrFailStub.throws(new Error('Space not found'))

      const handler = getHandler()
      const input = new MemberChangedDTO()
      input.spaceId = SPACE_ID
      input.activityType = 'membership_added'
      input.initUserId = USER_ID
      input.updatedMembershipId = SPACE_MEMBERSHIP_ID

      await expect(handler.sendEmail(input)).to.be.rejectedWith(
        NotFoundError,
        `Space id ${input.spaceId} not found`,
      )
    })

    it('user in space not found', async () => {
      userRepoFindOneOrFailStub.throws(new Error('User not found'))
      const space = new Space()
      spaceRepoFindOneOrFailStub.withArgs({ id: SPACE_ID }).returns(space)

      const handler = getHandler()
      const input = new MemberChangedDTO()
      input.spaceId = SPACE_ID
      input.activityType = 'membership_added'
      input.initUserId = USER_ID
      input.updatedMembershipId = SPACE_MEMBERSHIP_ID

      await expect(handler.sendEmail(input)).to.be.rejectedWith(
        NotFoundError,
        `User id ${input.initUserId} not found`,
      )
    })

    it('membership not found', async () => {
      const organization = new Organization()
      const user = new User(organization)
      userRepoFindOneOrFailStub.withArgs({ id: USER_ID }).returns(user)
      const space = new Space()
      spaceRepoFindOneOrFailStub.withArgs({ id: SPACE_ID }).returns(space)
      spaceMembershipRepoFindOneOrFailStub.throws(new Error('Membership not found'))

      const handler = getHandler()
      const input = new MemberChangedDTO()
      input.spaceId = SPACE_ID
      input.activityType = 'membership_added'
      input.initUserId = USER_ID
      input.updatedMembershipId = SPACE_MEMBERSHIP_ID

      await expect(handler.sendEmail(input)).to.be.rejectedWith(
        NotFoundError,
        `Space membership id ${input.updatedMembershipId} not found`,
      )
    })

    it('not corresponding action string', async () => {
      const organization = new Organization()
      const user = new User(organization)
      userRepoFindOneOrFailStub.withArgs({ id: USER_ID }).returns(user)
      const space = new Space()
      spaceRepoFindOneOrFailStub.withArgs({ id: SPACE_ID }).returns(space)
      const spaceMembership = new SpaceMembership(
        user,
        space,
        SPACE_MEMBERSHIP_SIDE.GUEST,
        SPACE_MEMBERSHIP_ROLE.LEAD,
      )
      spaceMembershipRepoFindOneOrFailStub
        .withArgs({ id: SPACE_MEMBERSHIP_ID })
        .returns(spaceMembership)

      const handler = getHandler()
      const input = new MemberChangedDTO()
      input.spaceId = SPACE_ID
      input.activityType = 'incorrect_activity'
      input.initUserId = USER_ID
      input.updatedMembershipId = SPACE_MEMBERSHIP_ID

      await expect(handler.sendEmail(input)).to.be.rejectedWith(
        NotFoundError,
        `SpaceEvent with activityType id ${input.activityType} does not
        correspond with action types for the email`,
      )
    })

    it('basic', async () => {
      const organization = new Organization()
      const user = new User(organization)
      user.id = USER_ID
      user.firstName = 'Hogn-Si'
      user.lastName = 'Ho'
      const adminUser = new User(organization)
      adminUser.id = USER2_ID
      adminUser.firstName = 'Bangla'
      adminUser.lastName = 'Dezo'
      adminUser.email = 'test@email.com'
      const notificationPref = new NotificationPreference(adminUser)
      notificationPref.data = {
        group_lead_member_added_to_space: true,
      }
      adminUser.notificationPreference = Reference.create(notificationPref)
      userRepoFindOneOrFailStub.withArgs({ id: USER_ID }).returns(user)
      userRepoFindOneOrFailStub.withArgs({ id: USER2_ID }).returns(adminUser)
      const space = new Space()
      space.id = SPACE_ID
      space.type = SPACE_TYPE.GROUPS
      spaceRepoFindOneOrFailStub.withArgs({ id: SPACE_ID }).returns(space)
      const spaceMembership = new SpaceMembership(
        user,
        space,
        SPACE_MEMBERSHIP_SIDE.GUEST,
        SPACE_MEMBERSHIP_ROLE.LEAD,
      )
      const adminSpaceMembership = new SpaceMembership(
        adminUser,
        space,
        SPACE_MEMBERSHIP_SIDE.GUEST,
        SPACE_MEMBERSHIP_ROLE.LEAD,
      )
      spaceMembershipRepoFindOneOrFailStub
        .withArgs({ id: SPACE_MEMBERSHIP_ID })
        .returns(spaceMembership)
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

      const handler = getHandler()
      const input = new MemberChangedDTO()
      input.spaceId = SPACE_ID
      input.activityType = 'membership_added'
      input.initUserId = user.id
      input.updatedMembershipId = SPACE_MEMBERSHIP_ID

      await handler.sendEmail(input)

      expect(emailClientSendEmailStub.calledOnce).to.eq(true)
      expect(emailClientSendEmailStub.firstCall.firstArg.emailType).to.eq(
        EMAIL_TYPES.memberChangedAddedRemoved,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.to).to.eq(adminUser.email)
      expect(emailClientSendEmailStub.firstCall.firstArg.subject).to.eq(
        `${user.firstName} ${user.lastName} added a new member`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `Hello ${adminUser.firstName}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `Space member ${user.firstName} ${user.lastName} added a new member`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain(
        `name: ${user.firstName} ${user.lastName}`,
      )
      expect(emailClientSendEmailStub.firstCall.firstArg.body).to.contain('role: LEAD')
    })
  })
})
