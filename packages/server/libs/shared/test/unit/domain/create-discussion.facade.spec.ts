import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { CreateDiscussionFacade } from 'apps/api/src/facade/discussion/create-discussion.facade'
import { expect } from 'chai'
import { stub } from 'sinon'
import { database } from '@shared/database'
import { DiscussionDTO } from '@shared/domain/discussion/dto/discussion.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { EntityScope } from '@shared/types/common'

describe('CreateDiscussionFacade', () => {
  let createDiscussionFacade: CreateDiscussionFacade

  const EMPTY_ATTACHMENTS = {
    files: [],
    folders: [],
    assets: [],
    apps: [],
    jobs: [],
    comparisons: [],
  }

  const createDiscussionStub = stub()
  const getDiscussionStub = stub()
  const createAttachmentsStub = stub()
  const getAccessibleByIdStub = stub()
  const createNewDiscussionNotificationTaskStub = stub()

  const discussionService = {
    createDiscussion: createDiscussionStub,
    getDiscussion: getDiscussionStub,
  } as unknown as DiscussionService
  const attachmentFacade = {
    createAttachments: createAttachmentsStub,
  } as unknown as AttachmentManagementFacade
  const spaceService = {
    getAccessibleById: getAccessibleByIdStub,
  } as unknown as SpaceService
  const mainQueueJobProducer = {
    createNewDiscussionNotificationTask: createNewDiscussionNotificationTaskStub,
  } as unknown as MainQueueJobProducer

  beforeEach(() => {
    const em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>

    createDiscussionFacade = new CreateDiscussionFacade(
      em,
      discussionService,
      attachmentFacade,
      spaceService,
      mainQueueJobProducer,
    )

    createDiscussionStub.reset()
    getDiscussionStub.reset()
    createAttachmentsStub.reset()
    getAccessibleByIdStub.reset()
    createNewDiscussionNotificationTaskStub.reset()
  })

  it('should call create discussion with public scope, create attachments and notify', async () => {
    const dto = {
      scope: 'public' as EntityScope,
      title: 'Test Discussion',
      content: 'This is a test discussion.',
      attachments: EMPTY_ATTACHMENTS,
      notify: [],
    }

    const newDiscussion = {
      id: 1,
      title: dto.title,
      content: dto.content,
      attachments: EMPTY_ATTACHMENTS,
      noteId: 1,
    } as unknown as DiscussionDTO

    createDiscussionStub.returns(newDiscussion)
    const result = await createDiscussionFacade.createDiscussion(dto)

    expect(createDiscussionStub.calledOnce).to.be.true()
    expect(createAttachmentsStub.calledOnce).to.be.true()
    expect(createNewDiscussionNotificationTaskStub.calledOnce).to.be.true()
    expect(createDiscussionStub.firstCall.args[0]).to.deep.equal(dto)
    expect(createAttachmentsStub.firstCall.args[0]).to.equal(newDiscussion.noteId)
    expect(createAttachmentsStub.firstCall.args[1]).to.equal(dto.attachments)
    expect(createNewDiscussionNotificationTaskStub.firstCall.args[0]).to.equal(newDiscussion.id)
    expect(result).to.deep.equal(newDiscussion)
  })

  it('should call a discussion with space scope, create attachments and notify', async () => {
    const dto = {
      scope: 'space-1' as EntityScope,
      title: 'Test Discussion',
      content: 'This is a test discussion.',
      attachments: EMPTY_ATTACHMENTS,
      notify: [],
    }

    const newDiscussion = {
      id: 1,
      title: dto.title,
      content: dto.content,
      attachments: EMPTY_ATTACHMENTS,
      noteId: 1,
    } as unknown as DiscussionDTO

    getAccessibleByIdStub.returns({
      id: 1,
      type: SPACE_TYPE.GROUPS,
    })

    createDiscussionStub.returns(newDiscussion)
    const result = await createDiscussionFacade.createDiscussion(dto)

    expect(createDiscussionStub.calledOnce).to.be.true()
    expect(createAttachmentsStub.calledOnce).to.be.true()
    expect(createNewDiscussionNotificationTaskStub.calledOnce).to.be.true()
    expect(createDiscussionStub.firstCall.args[0]).to.deep.equal(dto)
    expect(createAttachmentsStub.firstCall.args[0]).to.equal(newDiscussion.noteId)
    expect(createAttachmentsStub.firstCall.args[1]).to.equal(dto.attachments)
    expect(createNewDiscussionNotificationTaskStub.firstCall.args[0]).to.equal(newDiscussion.id)
    expect(result).to.deep.equal(newDiscussion)
  })

  it('should throw an error if the space is not accessible', async () => {
    const dto = {
      scope: 'space-1' as EntityScope,
      title: 'Test Discussion',
      content: 'This is a test discussion.',
      attachments: EMPTY_ATTACHMENTS,
      notify: [],
    }

    getAccessibleByIdStub.returns(null)

    try {
      await createDiscussionFacade.createDiscussion(dto)
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      expect(error.message).to.equal('Unable to create discussion: insufficient permissions to access the space.')
    }
  })

  it('should throw an error if the space has restricted discussions', async () => {
    const dto = {
      scope: 'space-1' as EntityScope,
      title: 'Test Discussion',
      content: 'This is a test discussion.',
      attachments: EMPTY_ATTACHMENTS,
      notify: [],
    }

    getAccessibleByIdStub.returns({
      id: 1,
      type: SPACE_TYPE.REVIEW,
      meta: { restricted_discussions: true },
    })

    try {
      await createDiscussionFacade.createDiscussion(dto)
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      expect(error.message).to.equal('Unable to create discussion: the space has restricted discussions.')
    }
  })

  it('should throw an error if the space is private', async () => {
    const dto = {
      scope: 'space-1' as EntityScope,
      title: 'Test Discussion',
      content: 'This is a test discussion.',
      attachments: EMPTY_ATTACHMENTS,
      notify: [],
    }

    getAccessibleByIdStub.returns({
      id: 1,
      type: SPACE_TYPE.PRIVATE_TYPE,
    })

    try {
      await createDiscussionFacade.createDiscussion(dto)
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      expect(error.message).to.equal('Unable to create discussion: the space has restricted discussions.')
    }
  })
})
