import { Ref } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { createStubInstance, stub } from 'sinon'
import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { SpaceEventDTO } from '@shared/domain/space-event/dto/space-event.dto'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { SPACE_EVENT_ACTIVITY_TYPE, SPACE_EVENT_OBJECT_TYPE } from '@shared/domain/space-event/space-event.enum'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { getEnumKeyByValue } from '@shared/utils/enum-utils'

describe('SpaceEvent service tests', () => {
  const USER_ID = 1
  const USER = {
    id: USER_ID,
  }
  const DEFAULT_USER_CTX: UserContext = {
    ...USER,
    accessToken: 'accessToken',
    dxuser: 'dxuser',
    loadEntity: async () => null,
  }

  const spaceRepoFindOneStub = stub()

  const spaceMembershipRepoGetMembershipStub = stub()

  const sendEmailStub = stub()

  const userRepoFindOneStub = stub()

  const emPersistAndFlushStub = stub()

  const spaceRepo = {
    findOne: spaceRepoFindOneStub,
  } as unknown as SpaceRepository

  const spaceMembershipRepo = {
    getMembership: spaceMembershipRepoGetMembershipStub,
  } as unknown as SpaceMembershipRepository

  const emailService = {
    sendEmail: sendEmailStub,
  } as unknown as EmailService

  const em = {
    persistAndFlush: emPersistAndFlushStub,
  } as unknown as SqlEntityManager

  beforeEach(() => {
    spaceRepoFindOneStub.reset()
    spaceRepoFindOneStub.throws()

    userRepoFindOneStub.reset()
    userRepoFindOneStub.throws()

    spaceMembershipRepoGetMembershipStub.reset()
    spaceMembershipRepoGetMembershipStub.throws()

    sendEmailStub.reset()
    sendEmailStub.throws()

    emPersistAndFlushStub.reset()
    emPersistAndFlushStub.throws()
  })

  describe('#createSpaceEvent', () => {
    it('should create space event', async () => {
      const space = createStubInstance(Space)
      spaceRepoFindOneStub.resolves(space)
      const user = createStubInstance(User)
      userRepoFindOneStub.resolves(user)
      emPersistAndFlushStub.reset()

      const input: SpaceEventDTO = {
        spaceId: 1,
        userId: USER_ID,
        activityType: SPACE_EVENT_ACTIVITY_TYPE.space_deleted,
        entity: {
          type: 'userFile',
          value: {
            id: 1,
          } as unknown as UserFile,
        },
        membership: {
          id: 1,
          side: SPACE_MEMBERSHIP_SIDE.GUEST,
          role: SPACE_MEMBERSHIP_ROLE.LEAD,
        } as SpaceMembership,
      }

      const USER_CTX: UserContext = {
        ...USER,
        accessToken: 'accessToken',
        dxuser: 'dxuser',
        loadEntity: async () => user,
      }

      const result = await getInstance(USER_CTX).createSpaceEvent(input)

      expect(result.activityType).to.eq(SPACE_EVENT_ACTIVITY_TYPE.space_deleted)
      expect(result.side).to.eq(SPACE_MEMBERSHIP_SIDE.GUEST)
      expect(result.role).to.eq(SPACE_MEMBERSHIP_ROLE.LEAD)
      expect(result.entityId).to.eq(1)
      expect(result.entityType).to.eq('Node')
      expect(result.objectType).to.eq(SPACE_EVENT_OBJECT_TYPE.FILE)
      expect(JSON.parse(result.data)).to.deep.equal({
        type: 'userFile',
        value: { id: 1 },
        ignoreUserIds: [],
      })

      expect(emPersistAndFlushStub.calledOnce).to.be.true()
      expect(emPersistAndFlushStub.calledWith(result)).to.be.true()
      expect(sendEmailStub.called).to.be.false()
    })
  })

  describe('#sendNotificationForEvent', () => {
    it('should send notification for event - content types', async () => {
      const spaceEvent = createStubInstance(SpaceEvent)
      spaceEvent.id = 10
      spaceEvent.activityType = SPACE_EVENT_ACTIVITY_TYPE.file_added
      sendEmailStub.reset()

      await getInstance(DEFAULT_USER_CTX).sendNotificationForEvent(spaceEvent)

      expect(sendEmailStub.calledOnce).to.be.true()
      expect(sendEmailStub.firstCall.firstArg.type).to.eq(EMAIL_TYPES.newContentAdded)
      expect(sendEmailStub.firstCall.firstArg.input.id).to.eq(10)
      expect(sendEmailStub.firstCall.firstArg.receiverUserIds).to.deep.eq([])
    })

    it('should send notification for event - comment types', async () => {
      const spaceEvent = createStubInstance(SpaceEvent)
      spaceEvent.id = 10
      spaceEvent.activityType = SPACE_EVENT_ACTIVITY_TYPE.comment_added
      sendEmailStub.reset()

      await getInstance(DEFAULT_USER_CTX).sendNotificationForEvent(spaceEvent)

      expect(sendEmailStub.calledOnce).to.be.true()
      expect(sendEmailStub.firstCall.firstArg.type).to.eq(EMAIL_TYPES.commentAdded)
      expect(sendEmailStub.firstCall.firstArg.input.id).to.eq(10)
      expect(sendEmailStub.firstCall.firstArg.receiverUserIds).to.deep.eq([])
    })

    it('should send notification for event - space types', async () => {
      const spaceEvent = createStubInstance(SpaceEvent)
      spaceEvent.id = 10
      spaceEvent.activityType = SPACE_EVENT_ACTIVITY_TYPE.space_locked
      spaceEvent.user = {
        id: 11,
      } as unknown as Ref<User>
      spaceEvent.space = {
        id: 12,
      } as unknown as Ref<Space>

      sendEmailStub.reset()

      await getInstance(DEFAULT_USER_CTX).sendNotificationForEvent(spaceEvent)

      expect(sendEmailStub.calledOnce).to.be.true()
      expect(sendEmailStub.firstCall.firstArg.type).to.eq(EMAIL_TYPES.spaceChanged)
      expect(sendEmailStub.firstCall.firstArg.input.initUserId).to.eq(11)
      expect(sendEmailStub.firstCall.firstArg.input.spaceId).to.eq(12)
      expect(sendEmailStub.firstCall.firstArg.receiverUserIds).to.deep.eq([])
    })

    it('should send notification for event - membership types', async () => {
      const spaceEvent = createStubInstance(SpaceEvent)
      spaceEvent.id = 10
      spaceEvent.activityType = SPACE_EVENT_ACTIVITY_TYPE.membership_added
      spaceEvent.user = {
        id: 11,
      } as unknown as Ref<User>
      spaceEvent.space = {
        id: 12,
      } as unknown as Ref<Space>
      spaceEvent.entityId = 13
      spaceEvent.role = SPACE_MEMBERSHIP_ROLE.LEAD

      sendEmailStub.reset()

      await getInstance(DEFAULT_USER_CTX).sendNotificationForEvent(spaceEvent)

      expect(sendEmailStub.calledOnce).to.be.true()
      expect(sendEmailStub.firstCall.firstArg.type).to.eq(EMAIL_TYPES.memberChangedAddedRemoved)
      expect(sendEmailStub.firstCall.firstArg.input.initUserId).to.eq(11)
      expect(sendEmailStub.firstCall.firstArg.input.spaceId).to.eq(12)
      expect(sendEmailStub.firstCall.firstArg.input.updatedMembershipId).to.eq(13)
      expect(sendEmailStub.firstCall.firstArg.input.newMembershipRole).to.eq(
        getEnumKeyByValue(SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_ROLE.LEAD),
      )
      expect(sendEmailStub.firstCall.args[0].receiverUserIds).to.deep.eq([])
    })
  })

  function getInstance(userContext: UserContext): SpaceEventService {
    return new SpaceEventService(userContext, em, spaceRepo, spaceMembershipRepo, emailService)
  }
})
