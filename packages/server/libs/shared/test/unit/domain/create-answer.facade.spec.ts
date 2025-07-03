import { stub } from 'sinon'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { expect } from 'chai'
import { CreateAnswerFacade } from 'apps/api/src/facade/discussion/create-answer.facade'
import { AnswerDTO } from '@shared/domain/discussion/dto/answer.dto'
import { database } from '@shared/database'
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'

describe('CreateAnswerFacade', () => {
  let createAnswerFacade: CreateAnswerFacade

  const EMPTY_ATTACHMENTS = {
    files: [],
    folders: [],
    assets: [],
    apps: [],
    jobs: [],
    comparisons: [],
  }

  const createAnswerStub = stub()
  const getDiscussionStub = stub()
  const createAttachmentsStub = stub()
  const createNewReplyNotificationTaskStub = stub()

  // Mock dependencies
  const discussionService = {
    createAnswer: createAnswerStub,
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

    createAnswerFacade = new CreateAnswerFacade(
      em,
      discussionService,
      attachmentFacade,
      mainQueueJobProducer,
    )

    createAnswerStub.reset()
    getDiscussionStub.reset()
    createAttachmentsStub.reset()
    createNewReplyNotificationTaskStub.reset()
  })

  it('should call create discussion with public scope, create attachments and notify', async () => {
    const dto = {
      discussionId: 1,
      title: 'Test Answer',
      content: 'This is a test answer.',
      attachments: EMPTY_ATTACHMENTS,
      notify: [],
    }

    const newAnswer = {
      id: 1,
      title: dto.title,
      content: dto.content,
      attachments: EMPTY_ATTACHMENTS,
      noteId: 1,
      discussionId: 1,
    } as unknown as AnswerDTO

    createAnswerStub.returns(newAnswer)
    const result = await createAnswerFacade.createAnswer(dto)

    expect(createAnswerStub.calledOnce).to.be.true()
    expect(createAttachmentsStub.calledOnce).to.be.true()
    expect(createNewReplyNotificationTaskStub.calledOnce).to.be.true()
    expect(createAnswerStub.firstCall.args[0]).to.deep.equal(dto)
    expect(createAttachmentsStub.firstCall.args[0]).to.equal(newAnswer.noteId)
    expect(createAttachmentsStub.firstCall.args[1]).to.equal(dto.attachments)
    expect(createNewReplyNotificationTaskStub.firstCall.args[0]).to.equal(newAnswer.id)
    expect(result).to.deep.equal(newAnswer)
  })
})
