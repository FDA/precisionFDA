import sinon from 'sinon'
import { expect } from 'chai'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { TaggingService } from '@shared/domain/tagging/tagging.service'
import { TaggingRepository } from '@shared/domain/tagging/tagging.repository'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'

describe('TaggingService', () => {
  const findForTaggableStub = sinon.stub()
  const countStub = sinon.stub()
  const transactionalStub = sinon.stub()
  const removeStub = sinon.stub()
  const em = {
    transactional: transactionalStub,
    remove: removeStub,
  } as unknown as SqlEntityManager

  transactionalStub.callsFake(async (callback) => {
    return callback(em)
  })

  const getTaggingService = () => {
    const taggingRepository = {
      findForTaggable: findForTaggableStub,
      count: countStub,
    } as unknown as TaggingRepository

    return new TaggingService(em, taggingRepository)
  }

  beforeEach(() => {
    findForTaggableStub.reset()
    findForTaggableStub.throws()

    removeStub.reset()
    removeStub.throws()
  })

  describe('#removeTaggings', () => {
    it('should remove taggings for entity with id and type', async () => {
      const tag = { id: 5 }
      findForTaggableStub.withArgs(1, TAGGABLE_TYPE.NODE).resolves([{ tag }])
      countStub.withArgs({ tagId: 1 }).resolves(2)
      removeStub.reset()

      const service = getTaggingService()
      const id = 1
      const type = TAGGABLE_TYPE.NODE

      await service.removeTaggings(id, type)

      expect(transactionalStub.calledOnce).to.be.true
      expect(findForTaggableStub.calledOnce).to.be.true
      expect(removeStub.calledOnce).to.be.true
      expect(removeStub.calledWith(tag)).to.be.true
    })

    it('should remove also tag', async () => {
      const tag = { id: 5 }
      findForTaggableStub.withArgs(1, TAGGABLE_TYPE.NODE).resolves([{ tag }])
      countStub.withArgs({ tagId: 1 }).resolves(2)
      removeStub.reset()

      const service = getTaggingService()
      const id = 1
      const type = TAGGABLE_TYPE.NODE

      await service.removeTaggings(id, type)

      expect(transactionalStub.calledOnce).to.be.true
      expect(findForTaggableStub.calledOnce).to.be.true
      expect(findForTaggableStub.calledWith(id, type)).to.be.true
      expect(removeStub.calledTwice).to.be.true
      expect(removeStub.calledWith(tag)).to.be.true
      expect(removeStub.calledWith({ tag })).to.be.true
    })
  })
})
