import { createStubInstance, stub } from 'sinon'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserRepository } from '@shared/domain/user/user.repository'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { SpaceEventInput } from '@shared/domain/space-event/space-event.input'
import {
  SPACE_EVENT_ACTIVITY_TYPE,
  SPACE_EVENT_OBJECT_TYPE,
} from '@shared/domain/space-event/space-event.enum'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { Ref } from '@mikro-orm/core'
import { EmailFacade } from '@shared/domain/email/email.facade'

describe('SpaceEvent service tests', () => {
  const USER_ID = 1
  const USER = {
    id: USER_ID,
  }
  const USER_CTX: UserCtx = { ...USER, accessToken: 'accessToken', dxuser: 'dxuser' }

  const spaceRepoFindOneStub = stub()

  const spaceMembershipRepoGetMembershipStub = stub()

  const prepareEmailStub = stub()

  const sendEmailStub = stub()

  const userRepoFindOneStub = stub()

  const emPersistAndFlushStub = stub()

  const spaceRepo = {
    findOne: spaceRepoFindOneStub,
  } as unknown as SpaceRepository

  const userRepo = {
    findOne: userRepoFindOneStub,
  } as unknown as UserRepository

  const spaceMembershipRepo = {
    getMembership: spaceMembershipRepoGetMembershipStub,
  } as unknown as SpaceMembershipRepository

  const emailFacade = {
    sendEmail: sendEmailStub,
  } as unknown as EmailFacade

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
      prepareEmailStub.returns([{ email: 'email' }])

      const input: SpaceEventInput = {
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

      const result = await getInstance().createSpaceEvent(input)

      expect(result.activityType).to.eq(SPACE_EVENT_ACTIVITY_TYPE.space_deleted)
      expect(result.side).to.eq(SPACE_MEMBERSHIP_SIDE.GUEST)
      expect(result.role).to.eq(SPACE_MEMBERSHIP_ROLE.LEAD)
      expect(result.entityId).to.eq(1)
      expect(result.entityType).to.eq('Node')
      expect(result.objectType).to.eq(SPACE_EVENT_OBJECT_TYPE.FILE)
      expect(result.data).to.be.undefined

      expect(emPersistAndFlushStub.calledOnce).to.be.true
      expect(emPersistAndFlushStub.calledWith(result)).to.be.true
      expect(prepareEmailStub.calledOnce).to.be.true
      expect(sendEmailStub.calledOnce).to.be.true
      expect(sendEmailStub.calledWith({ email: 'email' })).to.be.true
    })
  })

  describe('#sendNotificationForEvent', () => {
    it('should send notification for event - content types', async () => {
      const spaceEvent = createStubInstance(SpaceEvent)
      spaceEvent.id = 10
      spaceEvent.activityType = SPACE_EVENT_ACTIVITY_TYPE.file_added
      prepareEmailStub.returns([
        {
          emailTypeId: EMAIL_TYPES.newContentAdded,
          input: { spaceEventId: spaceEvent.id },
          receiverUserIds: [],
        },
      ])
      sendEmailStub.reset()

      await getInstance().sendNotificationForEvent(spaceEvent)

      expect(sendEmailStub.calledOnce).to.be.true
      expect(sendEmailStub.firstCall.args[0].emailTypeId).to.eq(EMAIL_TYPES.newContentAdded)
      expect(sendEmailStub.firstCall.args[0].input.spaceEventId).to.eq(10)
      expect(sendEmailStub.firstCall.args[0].receiverUserIds).to.deep.eq([])
    })

    it('should send notification for event - comment types', async () => {
      const spaceEvent = createStubInstance(SpaceEvent)
      spaceEvent.id = 10
      spaceEvent.activityType = SPACE_EVENT_ACTIVITY_TYPE.comment_added
      prepareEmailStub.returns([
        {
          emailTypeId: EMAIL_TYPES.commentAdded,
          input: { spaceEventId: spaceEvent.id },
          receiverUserIds: [],
        },
      ])
      sendEmailStub.reset()

      await getInstance().sendNotificationForEvent(spaceEvent)

      expect(sendEmailStub.calledOnce).to.be.true
      expect(sendEmailStub.firstCall.args[0].emailTypeId).to.eq(EMAIL_TYPES.commentAdded)
      expect(sendEmailStub.firstCall.args[0].input.spaceEventId).to.eq(10)
      expect(sendEmailStub.firstCall.args[0].receiverUserIds).to.deep.eq([])
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

      prepareEmailStub.returns([
        {
          emailTypeId: EMAIL_TYPES.spaceChanged,
          input: {
            initUserId: spaceEvent.user.id,
            spaceId: spaceEvent.space.id,
            activityType: spaceEvent.activityType,
          },
          receiverUserIds: [],
        },
      ])
      sendEmailStub.reset()

      await getInstance().sendNotificationForEvent(spaceEvent)

      expect(sendEmailStub.calledOnce).to.be.true
      expect(sendEmailStub.firstCall.args[0].emailTypeId).to.eq(EMAIL_TYPES.spaceChanged)
      expect(sendEmailStub.firstCall.args[0].input.initUserId).to.eq(11)
      expect(sendEmailStub.firstCall.args[0].input.spaceId).to.eq(12)
      expect(sendEmailStub.firstCall.args[0].receiverUserIds).to.deep.eq([])
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

      prepareEmailStub.returns([
        {
          emailTypeId: EMAIL_TYPES.memberChangedAddedRemoved,
          input: {
            initUserId: spaceEvent.user.id,
            spaceId: spaceEvent.space.id,
            updatedMembershipId: spaceEvent.entityId,
            activityType: spaceEvent.activityType,
            newMembershipRole: spaceEvent.role,
          },
          receiverUserIds: [],
        },
      ])
      sendEmailStub.reset()

      await getInstance().sendNotificationForEvent(spaceEvent)

      expect(sendEmailStub.calledOnce).to.be.true
      expect(sendEmailStub.firstCall.args[0].emailTypeId).to.eq(EMAIL_TYPES.memberChangedAddedRemoved)
      expect(sendEmailStub.firstCall.args[0].input.initUserId).to.eq(11)
      expect(sendEmailStub.firstCall.args[0].input.spaceId).to.eq(12)
      expect(sendEmailStub.firstCall.args[0].input.updatedMembershipId).to.eq(13)
      expect(sendEmailStub.firstCall.args[0].input.newMembershipRole).to.eq(
        SPACE_MEMBERSHIP_ROLE.LEAD,
      )
      expect(sendEmailStub.firstCall.args[0].receiverUserIds).to.deep.eq([])
    })
  })

  function getInstance() {
    return new SpaceEventService(
      USER_CTX,
      em,
      spaceRepo,
      userRepo,
      spaceMembershipRepo,
      emailFacade,
    )
  }
})
