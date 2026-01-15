import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { SpaceMemberNotificationFacade } from '@shared/facade/space-member-notification/space-member-notification.facade'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('SpaceMemberNotificationFacade', () => {
  const getSpaceMembersStub = stub()
  const createNotificationStub = stub()

  const userContext = {
    id: 1,
    dxuser: 'test.user',
  } as unknown as UserContext
  const spaceService = {
    getSpaceMembers: getSpaceMembersStub,
  } as unknown as SpaceService
  const notificationService = {
    createNotification: createNotificationStub,
  } as unknown as NotificationService

  beforeEach(() => {
    getSpaceMembersStub.reset()
    createNotificationStub.reset()
    createNotificationStub.resolves()
  })

  context('notifyNewDiscussionReply', () => {
    it('should notify all space members except the author', async () => {
      const facade = getInstance()
      const spaceId = 1
      const replyUrl = 'http://pfda/discussions/123/comments/456'
      const discussionType = DISCUSSION_REPLY_TYPE.COMMENT

      getSpaceMembersStub
        .withArgs(spaceId)
        .resolves([{ user: { id: userContext.id } }, { user: { id: 20 } }, { user: { id: 30 } }])

      await facade.notifyNewDiscussionReply(spaceId, discussionType, replyUrl)

      expect(createNotificationStub.calledTwice).to.be.true()
      expect(createNotificationStub.getCall(0).args[0]).to.deep.eq({
        message: `A new reply has been added`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.DISCUSSION_REPLY_ADDED,
        userId: 20,
        meta: {
          linkTitle: `View ${discussionType}`,
          linkUrl: replyUrl,
        },
        sessionId: null,
      })
      expect(createNotificationStub.getCall(1).args[0]).to.deep.eq({
        message: `A new reply has been added`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.DISCUSSION_REPLY_ADDED,
        userId: 30,
        meta: {
          linkTitle: `View ${discussionType}`,
          linkUrl: replyUrl,
        },
        sessionId: null,
      })
    })
  })

  function getInstance(): SpaceMemberNotificationFacade {
    return new SpaceMemberNotificationFacade(userContext, spaceService, notificationService)
  }
})
