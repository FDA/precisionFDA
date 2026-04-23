import { expect } from 'chai'
import * as sinon from 'sinon'
import { stub } from 'sinon'
import { BaseEntityRepository } from '@shared/database/repository/base-entity.repository'

type TestEntity = { id: number }

describe('BaseEntityRepository', () => {
  const makeRepo = (em: object) => {
    return {
      getEntityManager: stub().returns(em),
    } as unknown as BaseEntityRepository<TestEntity>
  }

  describe('#persist', () => {
    it('delegates to EntityManager#persist', () => {
      const persistStub = stub()
      const repo = makeRepo({ persist: persistStub })
      const entity = { id: 1 }

      BaseEntityRepository.prototype.persist.call(repo, entity)

      expect(persistStub.calledOnceWith(entity)).to.be.true()
    })
  })

  describe('#persistAndFlush', () => {
    it('delegates to EntityManager#persist then flush', async () => {
      const flushStub = stub().resolves()
      const persistStub = stub().returns({ flush: flushStub })
      const repo = makeRepo({ persist: persistStub })
      const entity = { id: 1 }

      await BaseEntityRepository.prototype.persistAndFlush.call(repo, entity)

      expect(persistStub.calledOnceWith(entity)).to.be.true()
      expect(flushStub.calledOnce).to.be.true()
    })
  })

  describe('#flush', () => {
    it('delegates to EntityManager#flush', async () => {
      const flushStub = stub().resolves()
      const repo = makeRepo({ flush: flushStub })

      await BaseEntityRepository.prototype.flush.call(repo)

      expect(flushStub.calledOnce).to.be.true()
    })
  })

  describe('#remove', () => {
    it('delegates to EntityManager#remove', () => {
      const removeStub = stub()
      const repo = makeRepo({ remove: removeStub })
      const entity = { id: 1 }

      BaseEntityRepository.prototype.remove.call(repo, entity)

      expect(removeStub.calledOnceWith(entity)).to.be.true()
    })
  })

  describe('#removeAndFlush', () => {
    it('delegates to EntityManager#remove then flush', async () => {
      const flushStub = stub().resolves()
      const removeStub = stub().returns({ flush: flushStub })
      const repo = makeRepo({ remove: removeStub })
      const entity = { id: 1 }

      await BaseEntityRepository.prototype.removeAndFlush.call(repo, entity)

      expect(removeStub.calledOnceWith(entity)).to.be.true()
      expect(flushStub.calledOnce).to.be.true()
    })
  })

  describe('#transactional', () => {
    it('delegates to EntityManager#transactional', async () => {
      const result = { done: true }
      const transactionalStub = stub().callsFake(cb => cb({}))
      const repo = makeRepo({ transactional: transactionalStub })
      const cb = stub().resolves(result)

      const returned = await BaseEntityRepository.prototype.transactional.call(repo, cb)

      expect(transactionalStub.calledOnce).to.be.true()
      expect(cb.calledOnce).to.be.true()
      expect(returned).to.equal(result)
    })

    it('passes options to EntityManager#transactional', async () => {
      const transactionalStub = stub().resolves()
      const repo = makeRepo({ transactional: transactionalStub })
      const options = { isolationLevel: 'READ COMMITTED' as const }

      await BaseEntityRepository.prototype.transactional.call(repo, stub().resolves(), options)

      expect(transactionalStub.calledOnceWith(sinon.match.func, options)).to.be.true()
    })
  })
})
