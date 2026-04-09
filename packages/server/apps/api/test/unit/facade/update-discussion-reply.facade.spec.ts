import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { UpdateDiscussionReplyFacade } from 'apps/api/src/facade/discussion/update-reply.facade'
import { expect } from 'chai'
import { stub } from 'sinon'
import { database } from '@shared/database'
import { DiscussionReplyDTO } from '@shared/domain/discussion/dto/discussion-reply.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { SimpleUserDTO } from '@shared/domain/user/dto/simple-user.dto'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'

describe('UpdateDiscussionReplyFacade', () => {
  let updateDiscussionReplyFacade: UpdateDiscussionReplyFacade

  const EMPTY_ATTACHMENTS = {
    files: [],
    folders: [],
    assets: [],
    apps: [],
    jobs: [],
    comparisons: [],
  }

  const updateReplyStub = stub()
  const getDiscussionStub = stub()
  const updateAttachmentsStub = stub()

  const discussionService = {
    updateReply: updateReplyStub,
  } as unknown as DiscussionService
  const attachmentFacade = {
    updateAttachments: updateAttachmentsStub,
  } as unknown as AttachmentManagementFacade

  beforeEach(() => {
    const em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>

    updateDiscussionReplyFacade = new UpdateDiscussionReplyFacade(em, discussionService, attachmentFacade)

    updateReplyStub.reset()
    getDiscussionStub.reset()
    updateAttachmentsStub.reset()
  })

  it('should call update discussion, update attachments', async () => {
    const dto = {
      id: 1,
      title: 'Test Discussion',
      content: 'This is a test discussion.',
      attachments: EMPTY_ATTACHMENTS,
      type: DISCUSSION_REPLY_TYPE.ANSWER,
    }

    const simpleUser = {
      id: 1,
      dxuser: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
    } as unknown as SimpleUserDTO

    const answer = {
      id: 1,
      discussionId: 1,
      title: dto.title,
      content: dto.content,
      noteId: 1,
      user: simpleUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as DiscussionReplyDTO

    updateReplyStub.withArgs(1, dto).resolves(answer)

    const result = await updateDiscussionReplyFacade.updateReply(1, dto)

    expect(updateReplyStub.calledOnce).to.be.true()
    expect(updateAttachmentsStub.calledOnce).to.be.true()
    expect(updateReplyStub.firstCall.args[0]).to.equal(1)
    expect(updateReplyStub.firstCall.args[1]).to.deep.equal(dto)
    expect(updateAttachmentsStub.firstCall.args[0]).to.equal(answer.noteId)
    expect(updateAttachmentsStub.firstCall.args[1]).to.deep.equal(dto.attachments)
    expect(result).to.be.undefined()
  })

  it('should call update discussion without attachments', async () => {
    const dto = {
      id: 1,
      title: 'Test Discussion',
      content: 'This is a test discussion.',
      attachments: null,
      type: DISCUSSION_REPLY_TYPE.ANSWER,
    }

    const result = await updateDiscussionReplyFacade.updateReply(1, dto)

    expect(updateReplyStub.calledOnce).to.be.true()
    expect(updateAttachmentsStub.notCalled).to.be.true()
    expect(updateReplyStub.firstCall.args[0]).to.deep.equal(1)
    expect(updateReplyStub.firstCall.args[1]).to.deep.equal(dto)
    expect(result).to.be.undefined()
  })
})
