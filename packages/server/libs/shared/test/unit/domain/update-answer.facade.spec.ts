import { stub } from 'sinon'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { expect } from 'chai'
import { UpdateAnswerFacade } from 'apps/api/src/facade/discussion/update-answer.facade'
import { AnswerDTO } from '@shared/domain/discussion/dto/answer.dto'
import { database } from '@shared/database'
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'

describe('UpdateAnswerFacade', () => {
  let updateAnswerFacade: UpdateAnswerFacade

  const EMPTY_ATTACHMENTS = {
    files: [],
    folders: [],
    assets: [],
    apps: [],
    jobs: [],
    comparisons: [],
  }

  const updateAnswerStub = stub()
  const getDiscussionStub = stub()
  const updateAttachmentsStub = stub()

  const discussionService = {
    updateAnswer: updateAnswerStub,
  } as unknown as DiscussionService
  const attachmentFacade = {
    updateAttachments: updateAttachmentsStub,
  } as unknown as AttachmentManagementFacade

  beforeEach(() => {
    const em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>

    updateAnswerFacade = new UpdateAnswerFacade(em, discussionService, attachmentFacade)

    updateAnswerStub.reset()
    getDiscussionStub.reset()
    updateAttachmentsStub.reset()
  })

  it('should call update discussion, update attachments', async () => {
    const dto = {
      id: 1,
      title: 'Test Discussion',
      content: 'This is a test discussion.',
      attachments: EMPTY_ATTACHMENTS,
    }

    const answer = {
      id: 1,
      discussionId: 1,
      title: dto.title,
      content: dto.content,
      attachments: EMPTY_ATTACHMENTS,
      noteId: 1,
    } as unknown as AnswerDTO

    updateAnswerStub.resolves(answer)

    const result = await updateAnswerFacade.updateAnswer(1, dto)

    expect(updateAnswerStub.calledOnce).to.be.true
    expect(updateAttachmentsStub.calledOnce).to.be.true
    expect(updateAnswerStub.firstCall.args[0]).to.deep.equal(1)
    expect(updateAnswerStub.firstCall.args[1]).to.deep.equal(dto)
    expect(updateAttachmentsStub.firstCall.args[0]).to.equal(answer.noteId)
    expect(updateAttachmentsStub.firstCall.args[1]).to.equal(dto.attachments)
    expect(result).to.be.undefined
  })

  it('should call update discussion without attachments', async () => {
    const dto = {
      id: 1,
      title: 'Test Discussion',
      content: 'This is a test discussion.',
      attachments: null,
    }

    const result = await updateAnswerFacade.updateAnswer(1, dto)

    expect(updateAnswerStub.calledOnce).to.be.true
    expect(updateAttachmentsStub.notCalled).to.be.true
    expect(updateAnswerStub.firstCall.args[0]).to.deep.equal(1)
    expect(updateAnswerStub.firstCall.args[1]).to.deep.equal(dto)
    expect(result).to.be.undefined
  })
})
