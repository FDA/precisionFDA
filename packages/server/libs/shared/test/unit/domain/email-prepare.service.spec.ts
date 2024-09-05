import { EmailPrepareService } from '@shared/domain/email/templates/email-prepare.service'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { EMAIL_TYPES, EmailProcessInput } from '@shared/domain/email/email.config'
import { expect } from 'chai'
import { createStubInstance, stub } from 'sinon'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { Expert } from '@shared/domain/expert/expert.entity'
import { NotificationPreference } from '@shared/domain/notification-preference/notification-preference.entity'
import { Organization } from '@shared/domain/org/org.entity'
import { Space } from '@shared/domain/space/space.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'

describe('EmailPrepareService', () => {
  const userId = 10

  let emailPrepareService: EmailPrepareService
  const findOneOrFailStub = stub()
  const findStub = stub()
  const userContext = new UserContext(userId, 'accessToken', 'dxuser')

  const em = {
    findOneOrFail: findOneOrFailStub,
    find: findStub,
  } as unknown as SqlEntityManager

  beforeEach(async () => {
    emailPrepareService = new EmailPrepareService(em, userContext)
  })

  context('prepareEmails', () => {
    it('should return an array of emails - space changed', async () => {
      const user = getUser(userId)
      const user2 = getUser(101)
      const space = createStubInstance(Space)
      space.id = 3
      space.name = 'Space'
      findOneOrFailStub.callsFake((params) => {
        if (params.name === 'Space') {
          return space
        }
        return user2
      })

      findStub.returns([
        getMembership(user, space as any, SPACE_MEMBERSHIP_SIDE.HOST),
        getMembership(user2, space as any, SPACE_MEMBERSHIP_SIDE.HOST),
      ])

      const input = {
        input: {
          initUserId: userId,
          spaceId: space.id,
          activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.space_locked],
        },
        receiverUserIds: [],
        emailTypeId: EMAIL_TYPES.spaceChanged as any,
      } as unknown as EmailProcessInput
      const emails = await emailPrepareService.prepareEmails(input)

      expect(emails.length).to.eq(1)
      expect(emails[0].emailType).to.eq(EMAIL_TYPES.spaceChanged)
      expect(emails[0].to).to.eq('john.doe@test.com')
      expect(emails[0].subject).to.eq('John Doe locked the space Space')
    })
  })

  const getMembership = (user: User, space: Space, side: SPACE_MEMBERSHIP_SIDE) => {
    const membership = new SpaceMembership(user, space)
    membership.side = side
    membership.role = SPACE_MEMBERSHIP_ROLE.ADMIN
    return membership
  }

  const getUser = (id: number) => {
    const orgStub = createStubInstance(Organization)
    const notificationPrefStub = createStubInstance(NotificationPreference)
    const expertStub = createStubInstance(Expert)

    const userStub = new User(orgStub as any, notificationPrefStub as any, expertStub as any)

    userStub.id = id
    userStub.email = 'john.doe@test.com'
    userStub.firstName = 'John'
    userStub.lastName = 'Doe'
    return userStub
  }
})
