import { stub } from 'sinon'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { expect } from 'chai'
import { DiscussionDTO } from '@shared/domain/discussion/dto/discussion.dto'
import { UpdateDiscussionFacade } from 'apps/api/src/facade/discussion/update-discussion.facade'
import { database } from '@shared/database'
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'

describe('UpdateDiscussionFacade', () => {
  let updateDiscussionFacade: UpdateDiscussionFacade

  const EMPTY_ATTACHMENTS = {
    files: [],
    folders: [],
    assets: [],
    apps: [],
    jobs: [],
    comparisons: [],
  }

  const updateDiscussionStub = stub()
  const getDiscussionStub = stub()
  const updateAttachmentsStub = stub()

  const discussionService = {
    updateDiscussion: updateDiscussionStub,
    getDiscussion: getDiscussionStub,
  } as unknown as DiscussionService
  const attachmentFacade = {
    updateAttachments: updateAttachmentsStub,
  } as unknown as AttachmentManagementFacade

  beforeEach(() => {
    const em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>

    updateDiscussionFacade = new UpdateDiscussionFacade(em, discussionService, attachmentFacade)

    updateDiscussionStub.reset()
    getDiscussionStub.reset()
    updateAttachmentsStub.reset()
  })

  it('should call update discussion, update attachments', async () => {
    const dto = {
      title: 'Test Discussion',
      content: 'This is a test discussion.',
      attachments: EMPTY_ATTACHMENTS,
    }

    const discussion = {
      id: 1,
      title: dto.title,
      content: dto.content,
      attachments: EMPTY_ATTACHMENTS,
      noteId: 1,
    } as unknown as DiscussionDTO

    updateDiscussionStub.resolves(discussion)

    const result = await updateDiscussionFacade.updateDiscussion(1, dto)

    expect(updateDiscussionStub.calledOnce).to.be.true
    expect(updateAttachmentsStub.calledOnce).to.be.true
    expect(updateDiscussionStub.firstCall.args[0]).to.deep.equal(1)
    expect(updateDiscussionStub.firstCall.args[1]).to.deep.equal(dto)
    expect(updateAttachmentsStub.firstCall.args[0]).to.equal(discussion.noteId)
    expect(updateAttachmentsStub.firstCall.args[1]).to.equal(dto.attachments)
    expect(result).to.be.undefined
  })

  it('should call update discussion without attachments', async () => {
    const dto = {
      title: 'Test Discussion',
      content: 'This is a test discussion.',
      attachments: null,
    }

    const discussion = {
      id: 1,
      title: dto.title,
      content: dto.content,
      attachments: [],
      noteId: 1,
    } as unknown as DiscussionDTO

    updateDiscussionStub.resolves(discussion)

    const result = await updateDiscussionFacade.updateDiscussion(1, dto)

    expect(updateDiscussionStub.calledOnce).to.be.true
    expect(updateAttachmentsStub.notCalled).to.be.true
    expect(updateDiscussionStub.firstCall.args[0]).to.deep.equal(1)
    expect(updateDiscussionStub.firstCall.args[1]).to.deep.equal(dto)
    expect(result).to.be.undefined
  })
})
