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
  const userContext = new UserContext(userId, 'accessToken', 'dxuser', 'session_id')

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
        // @ts-ignore just for test purposes
        getMembership(user, space, SPACE_MEMBERSHIP_SIDE.HOST),
        // @ts-ignore just for test purposes
        getMembership(user2, space, SPACE_MEMBERSHIP_SIDE.HOST),
      ])

      const input = {
        input: {
          initUserId: userId,
          spaceId: space.id,
          activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.space_locked],
        },
        receiverUserIds: [],
        emailTypeId: EMAIL_TYPES.spaceChanged,
      } as EmailProcessInput<EMAIL_TYPES.spaceChanged>
      const emails = await emailPrepareService.prepareEmails(input)

      expect(emails.length).to.eq(1)
      expect(emails[0].emailType).to.eq(EMAIL_TYPES.spaceChanged)
      expect(emails[0].to).to.eq('john.doe@test.com')
      expect(emails[0].subject).to.eq('John Doe locked the space Space')
    })
  })

  const getMembership = (user: User, space: Space, side: SPACE_MEMBERSHIP_SIDE) => {
    return new SpaceMembership(user, space, side, SPACE_MEMBERSHIP_ROLE.ADMIN)
  }

  const getUser = (id: number) => {
    const orgStub = createStubInstance(Organization)
    const notificationPrefStub = createStubInstance(NotificationPreference)
    const expertStub = createStubInstance(Expert)

    const userStub = new User(orgStub, notificationPrefStub, expertStub)

    userStub.id = id
    userStub.email = 'john.doe@test.com'
    userStub.firstName = 'John'
    userStub.lastName = 'Doe'
    return userStub
  }
})
