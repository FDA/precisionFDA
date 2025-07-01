import sinon from 'sinon'
import { expect } from 'chai'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { TaggingService } from '@shared/domain/tagging/tagging.service'
import { TaggingRepository } from '@shared/domain/tagging/tagging.repository'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'
import { TagRepository } from '@shared/domain/tag/tag.repository'

describe('TaggingService', () => {
  const tagRepoFindOneStub = sinon.stub()
  const taggingRepoFindForTaggableStub = sinon.stub()
  const taggingRepoFindOneStub = sinon.stub()
  const taggingRepoCountStub = sinon.stub()
  const emTransactionalStub = sinon.stub()
  const emRemoveStub = sinon.stub()
  const emPersistAndFlushStub = sinon.stub()
  const emPersistStub = sinon.stub()

  const em = {
    transactional: emTransactionalStub,
    remove: emRemoveStub,
    persistAndFlush: emPersistAndFlushStub,
    persist: emPersistStub,
  } as unknown as SqlEntityManager

  emTransactionalStub.callsFake(async (callback) => {
    return callback(em)
  })

  const getTaggingService = () => {
    const taggingRepository = {
      findForTaggable: taggingRepoFindForTaggableStub,
      findOne: taggingRepoFindOneStub,
      count: taggingRepoCountStub,
    } as unknown as TaggingRepository
    const tagRepository = {
      findOne: tagRepoFindOneStub,
    } as unknown as TagRepository

    return new TaggingService(em, taggingRepository, tagRepository)
  }

  beforeEach(() => {
    taggingRepoFindForTaggableStub.reset()
    taggingRepoFindForTaggableStub.throws()

    taggingRepoFindOneStub.reset()
    taggingRepoFindOneStub.throws()

    taggingRepoCountStub.reset()
    taggingRepoCountStub.throws()

    emRemoveStub.reset()
    emRemoveStub.throws()

    tagRepoFindOneStub.reset()
    tagRepoFindOneStub.throws()

    emPersistAndFlushStub.reset()
    emPersistAndFlushStub.throws()

    emPersistStub.reset()
    emPersistStub.throws()

    emTransactionalStub.reset()
    emTransactionalStub.callsFake((cb) => cb(em))
  })

  describe('#addTaggingForEntity', () => {
    const TAG_ID = 5
    const USER_ID = 7
    const TAGGABLE_ID = 68

    it('non existing tag and existing taggings', async () => {
      tagRepoFindOneStub.resolves(null)
      taggingRepoFindOneStub.resolves(null)
      emPersistAndFlushStub.reset()
      emPersistAndFlushStub.callsFake((entity) => {
        entity.id = TAG_ID
      })
      emPersistStub.reset()

      const service = getTaggingService()
      await service.addTaggingForEntity(
        'tag',
        'taggerType',
        USER_ID,
        TAGGABLE_ID,
        TAGGABLE_TYPE.NODE,
      )

      expect(emTransactionalStub.calledOnce).to.be.true()
      expect(tagRepoFindOneStub.calledOnce).to.be.true()
      expect(emPersistAndFlushStub.calledOnce).to.be.true()
      expect(emPersistAndFlushStub.firstCall.args[0].name).to.eq('tag')
      expect(emPersistStub.calledOnce).to.be.true()
      expect(emPersistStub.firstCall.args[0].tagId).to.eq(TAG_ID)
      expect(emPersistStub.firstCall.args[0].taggableType).to.eq(TAGGABLE_TYPE.NODE)
      expect(emPersistStub.firstCall.args[0].taggableId).to.eq(TAGGABLE_ID)
      expect(emPersistStub.firstCall.args[0].taggerType).to.eq('taggerType')
      expect(emPersistStub.firstCall.args[0].taggerId).to.eq(USER_ID)
      expect(emPersistStub.firstCall.args[0].context).to.eq('tags')
    })

    it('existing tag and non existing taggings', async () => {
      tagRepoFindOneStub.resolves({ id: TAG_ID })
      taggingRepoFindOneStub.resolves(null)
      emPersistStub.reset()

      const service = getTaggingService()
      await service.addTaggingForEntity(
        'tag',
        'taggerType',
        USER_ID,
        TAGGABLE_ID,
        TAGGABLE_TYPE.NODE,
      )

      expect(emTransactionalStub.calledOnce).to.be.true()
      expect(tagRepoFindOneStub.calledOnce).to.be.true()
      expect(emPersistStub.calledOnce).to.be.true()
      expect(emPersistStub.firstCall.args[0].tagId).to.eq(TAG_ID)
      expect(emPersistStub.firstCall.args[0].taggableType).to.eq(TAGGABLE_TYPE.NODE)
      expect(emPersistStub.firstCall.args[0].taggableId).to.eq(TAGGABLE_ID)
      expect(emPersistStub.firstCall.args[0].taggerType).to.eq('taggerType')
      expect(emPersistStub.firstCall.args[0].taggerId).to.eq(USER_ID)
      expect(emPersistStub.firstCall.args[0].context).to.eq('tags')
    })

    it('existing tag and existing taggings', async () => {
      tagRepoFindOneStub.resolves({ id: TAG_ID })
      taggingRepoFindOneStub.resolves({})

      const service = getTaggingService()
      await service.addTaggingForEntity(
        'tag',
        'taggerType',
        USER_ID,
        TAGGABLE_ID,
        TAGGABLE_TYPE.NODE,
      )

      expect(emTransactionalStub.calledOnce).to.be.true()
      expect(tagRepoFindOneStub.calledOnce).to.be.true()
      expect(emPersistStub.notCalled).to.be.true()
      expect(emPersistAndFlushStub.notCalled).to.be.true()
    })
  })

  describe('#removeTaggings', () => {
    it('should remove taggings for entity with id and type', async () => {
      const tag = { id: 5 }
      const tagging = { tag }
      taggingRepoFindForTaggableStub.withArgs(1, TAGGABLE_TYPE.NODE).resolves([tagging])
      taggingRepoCountStub.reset()
      taggingRepoCountStub.withArgs({ tagId: 1 }).resolves(2)
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
      expect(emRemoveStub.calledTwice).to.be.true()
      expect(emRemoveStub.calledWith(tag)).to.be.true()
      expect(emRemoveStub.calledWith(tagging)).to.be.true()
    })
  })
})
