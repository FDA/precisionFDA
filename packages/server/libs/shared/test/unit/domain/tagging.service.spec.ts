import { EntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import sinon from 'sinon'
import { TagRepository } from '@shared/domain/tag/tag.repository'
import { TaggingRepository } from '@shared/domain/tagging/tagging.repository'
import { TaggingService } from '@shared/domain/tagging/tagging.service'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'

describe('TaggingService', () => {
  const emTransactionalStub = sinon.stub()
  const emPersistStub = sinon.stub()
  const emPersistFlushStub = sinon.stub()
  const emRemoveStub = sinon.stub()

  const tagRepoFindOneStub = sinon.stub()
  const tagRepoCreateStub = sinon.stub()

  const taggingRepoFindForTaggableStub = sinon.stub()
  const taggingRepoFindOneStub = sinon.stub()
  const taggingRepoCountStub = sinon.stub()

  emPersistStub.callsFake(() => ({ flush: emPersistFlushStub }))

  const getTaggingService = (): TaggingService => {
    const taggingRepository = {
      findForTaggable: taggingRepoFindForTaggableStub,
      findOne: taggingRepoFindOneStub,
      count: taggingRepoCountStub,
    } as unknown as TaggingRepository

    const tagRepository = {
      findOne: tagRepoFindOneStub,
      create: tagRepoCreateStub,
    } as unknown as TagRepository

    const em = {
      transactional: emTransactionalStub,
      persist: emPersistStub,
      remove: emRemoveStub,
      getRepository: sinon.stub().callsFake((entity: unknown) => {
        const entityName = (entity as { name?: string })?.name
        if (entityName === 'Tag') return tagRepository
        if (entityName === 'Tagging') return taggingRepository
        return undefined
      }),
    } as unknown as EntityManager

    emTransactionalStub.callsFake(async callback => callback(em))

    return new TaggingService(em, taggingRepository, tagRepository)
  }

  beforeEach(() => {
    emTransactionalStub.reset()

    emPersistStub.reset()
    emPersistStub.callsFake(() => ({ flush: emPersistFlushStub }))

    emPersistFlushStub.reset()
    emPersistFlushStub.resolves()

    emRemoveStub.reset()
    emRemoveStub.returns(undefined)

    taggingRepoFindForTaggableStub.reset()
    taggingRepoFindForTaggableStub.throws()

    taggingRepoFindOneStub.reset()
    taggingRepoFindOneStub.throws()

    taggingRepoCountStub.reset()
    taggingRepoCountStub.throws()

    tagRepoFindOneStub.reset()
    tagRepoFindOneStub.throws()

    tagRepoCreateStub.reset()
    tagRepoCreateStub.callsFake((data: { name: string }) => ({ name: data.name }))
  })

  describe('#addTaggingForEntity', () => {
    const TAG_ID = 5
    const USER_ID = 7
    const TAGGABLE_ID = 68

    it('non existing tag and existing taggings', async () => {
      tagRepoFindOneStub.resolves(null)
      taggingRepoFindOneStub.resolves(null)
      emPersistStub.reset()
      emPersistStub.callsFake((entity: { id?: number }) => {
        if (!entity.id) {
          entity.id = TAG_ID
        }
        return { flush: emPersistFlushStub }
      })

      const service = getTaggingService()
      await service.addTaggingForEntity('tag', 'taggerType', USER_ID, TAGGABLE_ID, TAGGABLE_TYPE.NODE)

      expect(emTransactionalStub.notCalled).to.be.true()
      expect(tagRepoFindOneStub.calledOnce).to.be.true()
      expect(tagRepoCreateStub.calledOnceWithExactly({ name: 'tag' })).to.be.true()
      expect(emPersistStub.calledTwice).to.be.true()
      expect(emPersistStub.firstCall.args[0].name).to.eq('tag')
      expect(emPersistStub.secondCall.args[0].tagId).to.eq(TAG_ID)
      expect(emPersistStub.secondCall.args[0].taggableType).to.eq(TAGGABLE_TYPE.NODE)
      expect(emPersistStub.secondCall.args[0].taggableId).to.eq(TAGGABLE_ID)
      expect(emPersistStub.secondCall.args[0].taggerType).to.eq('taggerType')
      expect(emPersistStub.secondCall.args[0].taggerId).to.eq(USER_ID)
      expect(emPersistStub.secondCall.args[0].context).to.eq('tags')
      expect(emPersistFlushStub.callCount).to.eq(2)
    })

    it('existing tag and non existing taggings', async () => {
      tagRepoFindOneStub.resolves({ id: TAG_ID })
      taggingRepoFindOneStub.resolves(null)
      emPersistStub.reset()
      emPersistStub.callsFake(() => ({ flush: emPersistFlushStub }))

      const service = getTaggingService()
      await service.addTaggingForEntity('tag', 'taggerType', USER_ID, TAGGABLE_ID, TAGGABLE_TYPE.NODE)

      expect(emTransactionalStub.notCalled).to.be.true()
      expect(tagRepoFindOneStub.calledOnce).to.be.true()
      expect(tagRepoCreateStub.notCalled).to.be.true()
      expect(emPersistStub.calledOnce).to.be.true()
      expect(emPersistStub.firstCall.args[0].tagId).to.eq(TAG_ID)
      expect(emPersistStub.firstCall.args[0].taggableType).to.eq(TAGGABLE_TYPE.NODE)
      expect(emPersistStub.firstCall.args[0].taggableId).to.eq(TAGGABLE_ID)
      expect(emPersistStub.firstCall.args[0].taggerType).to.eq('taggerType')
      expect(emPersistStub.firstCall.args[0].taggerId).to.eq(USER_ID)
      expect(emPersistStub.firstCall.args[0].context).to.eq('tags')
      expect(emPersistFlushStub.calledOnce).to.be.true()
    })

    it('existing tag and existing taggings', async () => {
      tagRepoFindOneStub.resolves({ id: TAG_ID })
      taggingRepoFindOneStub.resolves({})

      const service = getTaggingService()
      await service.addTaggingForEntity('tag', 'taggerType', USER_ID, TAGGABLE_ID, TAGGABLE_TYPE.NODE)

      expect(emTransactionalStub.notCalled).to.be.true()
      expect(tagRepoFindOneStub.calledOnce).to.be.true()
      expect(tagRepoCreateStub.notCalled).to.be.true()
      expect(emPersistStub.notCalled).to.be.true()
      expect(emPersistFlushStub.notCalled).to.be.true()
    })
  })

  describe('#removeTaggings', () => {
    it('should remove taggings for entity with id and type', async () => {
      const tag = { id: 5 }
      const tagging = { tag, tagId: tag.id }
      taggingRepoFindForTaggableStub.withArgs(1, TAGGABLE_TYPE.NODE).resolves([tagging])
      taggingRepoCountStub.reset()
      taggingRepoCountStub.withArgs({ tagId: tag.id }).resolves(2)
      emRemoveStub.reset()

      const service = getTaggingService()
      const id = 1
      const type = TAGGABLE_TYPE.NODE

      await service.removeTaggings(id, type)

      expect(emTransactionalStub.calledOnce).to.be.true()
      expect(taggingRepoFindForTaggableStub.calledOnce).to.be.true()
      expect(emRemoveStub.calledOnce).to.be.true()
      expect(emRemoveStub.calledWith(tagging)).to.be.true()
    })

    it('should remove also tag', async () => {
      const tag = { id: 5 }
      const tagging = { tag, tagId: tag.id }
      taggingRepoFindForTaggableStub.withArgs(1, TAGGABLE_TYPE.NODE).resolves([tagging])
      taggingRepoCountStub.reset()
      taggingRepoCountStub.throws()
      taggingRepoCountStub.withArgs({ tagId: tag.id }).resolves(1)
      emRemoveStub.reset()

      const service = getTaggingService()
      const id = 1
      const type = TAGGABLE_TYPE.NODE

      await service.removeTaggings(id, type)

      expect(emTransactionalStub.calledOnce).to.be.true()
      expect(taggingRepoFindForTaggableStub.calledOnce).to.be.true()
      expect(taggingRepoFindForTaggableStub.calledWith(id, type)).to.be.true()
      expect(emRemoveStub.callCount).to.eq(2)
      expect(emRemoveStub.firstCall.calledWith(tag)).to.be.true()
      expect(emRemoveStub.secondCall.calledWith(tagging)).to.be.true()
    })
  })
})
