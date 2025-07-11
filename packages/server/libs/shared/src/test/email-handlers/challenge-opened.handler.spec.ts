import { SqlEntityManager } from '@mikro-orm/mysql'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { EmailClient } from '@shared/services/email-client'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import { ChallengeOpenedEmailHandler } from '@shared/domain/email/templates/handlers/challenge-opened.handler'
import { stub } from 'sinon'
import { ChallengeOpenedDTO } from '@shared/domain/email/dto/challenge-opened.dto'
import { expect } from 'chai'
import { InternalError } from '@shared/errors'
import { User } from '@shared/domain/user/user.entity'
import { Organization } from '@shared/domain/org/org.entity'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { pfdaNoReplyUser } from '@shared/domain/email/email.helper'
import { NotificationPreference } from '@shared/domain/notification-preference/notification-preference.entity'
import { Reference } from '@mikro-orm/core'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'

describe('ChallengeOpenedEmailHandler', () => {
  const CHALLENGE_ID = 1
  const SPACE_ID = 2

  const challengeRepoFindOneOrFailStub = stub()
  const userRepoFindActiveStub = stub()
  const spaceMembershipRepoFindStub = stub()
  const emailClientSendEmailStub = stub()

  const entityManager = {} as unknown as SqlEntityManager
  const challengeRepo = {
    findOneOrFail: challengeRepoFindOneOrFailStub,
  } as unknown as ChallengeRepository
  const userRepo = {
    findActive: userRepoFindActiveStub,
  } as unknown as UserRepository
  const spaceMembershipRepo = {
    find: spaceMembershipRepoFindStub,
  } as unknown as SpaceMembershipRepository
  const emailClient = {
    sendEmail: emailClientSendEmailStub,
  } as unknown as EmailClient

  const getHandler = (): ChallengeOpenedEmailHandler => {
    return new ChallengeOpenedEmailHandler(
      entityManager,
      challengeRepo,
      userRepo,
      spaceMembershipRepo,
      emailClient,
    )
  }

  beforeEach(async () => {
    challengeRepoFindOneOrFailStub.reset()
    challengeRepoFindOneOrFailStub.throws()

    userRepoFindActiveStub.reset()
    userRepoFindActiveStub.throws()

    spaceMembershipRepoFindStub.reset()
    spaceMembershipRepoFindStub.throws()

    emailClientSendEmailStub.reset()
    emailClientSendEmailStub.throws()
  })

  describe('#sendEmail', () => {
    it('not in space and not public', async () => {
      const challenge = {
        isPublic: (): boolean => false,
        isInSpace: (): boolean => false,
        scope: 'unsupported-scope',
      }
      const input = new ChallengeOpenedDTO()
      input.challengeId = CHALLENGE_ID

      challengeRepoFindOneOrFailStub.withArgs({ id: CHALLENGE_ID }).resolves(challenge)
      const handler = getHandler()

      await expect(handler.sendEmail(input)).to.be.rejectedWith(
        InternalError,
        `Scope name ${challenge.scope} is not processable`,
      )
    })

    it('public', async () => {
      const challenge = {
        id: CHALLENGE_ID,
        name: 'challenge-name',
        isPublic: (): boolean => true,
        isInSpace: (): boolean => false,
      }
      const organization = new Organization()
      const user1 = new User(organization)
      user1.email = 'user@email.com'
      const notificationPref = new NotificationPreference(user1)
      notificationPref.data = {
        private_challenge_opened: true,
      }

      user1.notificationPreference = Reference.create(notificationPref)
      const input = new ChallengeOpenedDTO()
      input.challengeId = CHALLENGE_ID

      challengeRepoFindOneOrFailStub.withArgs({ id: CHALLENGE_ID }).resolves(challenge)
      userRepoFindActiveStub
        .withArgs({ populate: ['notificationPreference'] as never[] })
        .resolves([user1])
      emailClientSendEmailStub.reset()
      const handler = getHandler()

      await handler.sendEmail(input)

      expect(userRepoFindActiveStub.calledOnce).to.be.true()
      expect(userRepoFindActiveStub.firstCall.args).to.deep.equal([
        { populate: ['notificationPreference'] },
      ])
      expect(spaceMembershipRepoFindStub.called).to.be.false()
      expect(emailClientSendEmailStub.calledTwice).to.be.true()

      expect(emailClientSendEmailStub.firstCall.args[0].to).to.equal(user1.email)
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.equal(
        EMAIL_TYPES.challengeOpened,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.equal(
        `New challenge ${challenge.name}`,
      )
      expect(emailClientSendEmailStub.secondCall.args[0].to).to.equal(pfdaNoReplyUser.email)
      expect(emailClientSendEmailStub.args[0][0].body).to.contain(challenge.name)
    })

    it('in a space', async () => {
      const challenge = {
        id: CHALLENGE_ID,
        name: 'challenge-name',
        isPublic: (): boolean => false,
        isInSpace: (): boolean => true,
        getSpaceId: (): number => SPACE_ID,
      }
      const organization = new Organization()
      const user1 = new User(organization)
      user1.email = 'user@email.com'
      const notificationPref = new NotificationPreference(user1)
      notificationPref.data = {
        group_lead_member_added_to_space: true,
      }
      user1.notificationPreference = Reference.create(notificationPref)
      const input = new ChallengeOpenedDTO()
      input.challengeId = CHALLENGE_ID
      const space = new Space()
      space.type = SPACE_TYPE.GROUPS
      const spaceMembership = new SpaceMembership(
        user1,
        space,
        SPACE_MEMBERSHIP_SIDE.GUEST,
        SPACE_MEMBERSHIP_ROLE.ADMIN,
      )
      spaceMembershipRepoFindStub
        .withArgs({ spaces: SPACE_ID, active: true })
        .resolves([spaceMembership])
      challengeRepoFindOneOrFailStub.withArgs({ id: CHALLENGE_ID }).resolves(challenge)
      emailClientSendEmailStub.reset()

      const handler = getHandler()

      await handler.sendEmail(input)

      expect(userRepoFindActiveStub.calledOnce).to.be.false()
      expect(spaceMembershipRepoFindStub.called).to.be.true()
      expect(emailClientSendEmailStub.calledTwice).to.be.true()
      expect(emailClientSendEmailStub.firstCall.args[0].to).to.equal(user1.email)
      expect(emailClientSendEmailStub.firstCall.args[0].emailType).to.equal(
        EMAIL_TYPES.challengeOpened,
      )
      expect(emailClientSendEmailStub.firstCall.args[0].subject).to.equal(
        `New challenge ${challenge.name}`,
      )
      expect(emailClientSendEmailStub.secondCall.args[0].to).to.equal(pfdaNoReplyUser.email)
      expect(emailClientSendEmailStub.args[0][0].body).to.contain(challenge.name)
    })
  })
})
