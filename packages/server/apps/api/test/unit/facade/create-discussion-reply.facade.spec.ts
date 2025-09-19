import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { DiscussionReplyDTO } from '@shared/domain/discussion/dto/discussion-reply.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { CreateDiscussionReplyFacade } from 'apps/api/src/facade/discussion/create-discussion-reply.facade'
import { expect } from 'chai'
import { stub } from 'sinon'

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

  // Mock dependencies
  const discussionService = {
    createReply: createReplyStub,
    getDiscussion: getDiscussionStub,
  } as unknown as DiscussionService
  const attachmentFacade = {
    createAttachments: createAttachmentsStub,
  } as unknown as AttachmentManagementFacade
  const mainQueueJobProducer = {
    createNewReplyNotificationTask: createNewReplyNotificationTaskStub,
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
    expect(result).to.deep.equal(newAnswer)
  })
})
