import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { CreateDiscussionReplyFacade } from 'apps/api/src/facade/discussion/create-discussion-reply.facade'
import { expect } from 'chai'
import { stub } from 'sinon'
import { database } from '@shared/database'
import { DiscussionReplyDTO } from '@shared/domain/discussion/dto/discussion-reply.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'

describe('CreateDiscussionReplyFacade', () => {
  let createDiscussionReplyFacade: CreateDiscussionReplyFacade

  const EMPTY_ATTACHMENTS = {
    files: [],
    folders: [],
    assets: [],
    apps: [],
    jobs: [],
    comparisons: [],
  }

  const createReplyStub = stub()
  const getDiscussionStub = stub()
  const createAttachmentsStub = stub()
  const createNewReplyNotificationTaskStub = stub()
  const createNewReplyUINotificationTaskStub = stub()
  const getCommentUiLinkStub = stub()
  const getAnswerUiLinkStub = stub()

  // Mock dependencies
  const discussionService = {
    createReply: createReplyStub,
    getDiscussion: getDiscussionStub,
    getCommentUiLink: getCommentUiLinkStub,
    getAnswerUiLink: getAnswerUiLinkStub,
  } as unknown as DiscussionService
  const attachmentFacade = {
    createAttachments: createAttachmentsStub,
  } as unknown as AttachmentManagementFacade
  const mainQueueJobProducer = {
    createNewReplyNotificationTask: createNewReplyNotificationTaskStub,
    createNewReplyUINotificationTask: createNewReplyUINotificationTaskStub,
  } as unknown as MainQueueJobProducer

  beforeEach(() => {
    const em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>

    createDiscussionReplyFacade = new CreateDiscussionReplyFacade(
      em,
      discussionService,
      attachmentFacade,
      mainQueueJobProducer,
    )

    createReplyStub.reset()
    getDiscussionStub.reset()
    createAttachmentsStub.reset()
    createNewReplyNotificationTaskStub.reset()
    createNewReplyUINotificationTaskStub.reset()
    getCommentUiLinkStub.reset()
    getAnswerUiLinkStub.reset()
  })

  it('should call create discussion with public scope, create attachments and notify', async () => {
    const dto = {
      title: 'Test Answer',
      content: 'This is a test answer.',
      attachments: EMPTY_ATTACHMENTS,
      notify: [],
      type: DISCUSSION_REPLY_TYPE.ANSWER,
    }

    const simpleUser = {
      id: 1,
      dxuser: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
    } as unknown as SimpleUserDTO

    const newAnswer = {
      id: 1,
      title: dto.title,
      content: dto.content,
      noteId: 1,
      discussionId: 1,
      user: simpleUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as DiscussionReplyDTO

    createReplyStub.withArgs(1, dto).resolves(newAnswer)
    const result = await createDiscussionReplyFacade.createReply(1, dto)

    expect(createReplyStub.calledOnce).to.be.true()
    expect(createAttachmentsStub.calledOnce).to.be.true()
    expect(createNewReplyNotificationTaskStub.calledOnce).to.be.true()
    expect(createReplyStub.firstCall.args[0]).to.equal(1)
    expect(createReplyStub.firstCall.args[1]).to.deep.equal(dto)
    expect(createAttachmentsStub.firstCall.args[0]).to.equal(newAnswer.noteId)
    expect(createAttachmentsStub.firstCall.args[1]).to.deep.equal(dto.attachments)
    expect(createNewReplyNotificationTaskStub.firstCall.args[0]).to.equal(newAnswer.id)
    expect(createNewReplyUINotificationTaskStub.notCalled).to.be.true()
    expect(result).to.deep.equal(newAnswer)
  })

  it('should call create discussion reply and notify space members for space scoped discussion', async () => {
    const dto = {
      title: 'Test Comment',
      content: 'This is a test comment.',
      attachments: EMPTY_ATTACHMENTS,
      notify: [],
      type: DISCUSSION_REPLY_TYPE.COMMENT,
    }

    const simpleUser = {
      id: 2,
      dxuser: 'spaceuser',
      firstName: 'Space',
      lastName: 'User',
      fullName: 'Space User',
    } as unknown as SimpleUserDTO

    const newComment = {
      id: 2,
      title: dto.title,
      content: dto.content,
      noteId: 2,
      discussionId: 2,
      scope: 'space-10',
      user: simpleUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as DiscussionReplyDTO

    const replyUrl = `http://pfda/discussions/${newComment.discussionId}/comments/${newComment.id}`

    createReplyStub.withArgs(2, dto).resolves(newComment)
    getCommentUiLinkStub.withArgs(newComment.id).resolves(replyUrl)

    const result = await createDiscussionReplyFacade.createReply(2, dto)

    expect(createReplyStub.calledOnce).to.be.true()
    expect(createAttachmentsStub.calledOnce).to.be.true()
    expect(createNewReplyNotificationTaskStub.calledOnce).to.be.true()
    expect(createNewReplyUINotificationTaskStub.calledOnce).to.be.true()
    expect(createReplyStub.firstCall.args[0]).to.equal(2)
    expect(createReplyStub.firstCall.args[1]).to.deep.equal(dto)
    expect(createAttachmentsStub.firstCall.args[0]).to.equal(newComment.noteId)
    expect(createAttachmentsStub.firstCall.args[1]).to.deep.equal(dto.attachments)
    expect(createNewReplyNotificationTaskStub.firstCall.args[0]).to.equal(newComment.id)
    expect(createNewReplyUINotificationTaskStub.firstCall.args[0]).to.equal(10)
    expect(createNewReplyUINotificationTaskStub.firstCall.args[1]).to.equal(dto.type)
    expect(createNewReplyUINotificationTaskStub.firstCall.args[2]).to.equal(replyUrl)
    expect(result).to.deep.equal(newComment)
  })
})
