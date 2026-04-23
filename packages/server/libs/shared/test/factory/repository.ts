import { EntityManager } from '@mikro-orm/core'
import { MySqlDriver } from '@mikro-orm/mysql'
import { SinonStub, stub } from 'sinon'
import { PaginatedRepository } from '@shared/database/repository/paginated.repository'

interface RepositoryStub<T extends object> extends PaginatedRepository<T> {
  stubs: {
    // EntityRepository methods
    find: SinonStub
    findOne: SinonStub
    findOneOrFail: SinonStub
    findAndCount: SinonStub
    findAll: SinonStub
    count: SinonStub
    nativeInsert: SinonStub
    nativeUpdate: SinonStub
    nativeDelete: SinonStub
    // PaginatedRepository methods
    paginate: SinonStub
    persist: SinonStub
    persistAndFlush: SinonStub
    flush: SinonStub
    remove: SinonStub
    removeAndFlush: SinonStub
    // Repository transactional method
    transactional: SinonStub
    // Utility
    reset: () => void
  }
}

/**
 * Creates a stub implementation of PaginatedRepository for testing purposes.
 *
 * This factory generates a test double that implements all methods from both
 * MikroORM's EntityRepository and the custom PaginatedRepository class. All
 * methods are Sinon stubs that can be configured and asserted in tests.
 * @example
 * // Basic usage
 * const userRepo = createRepositoryStub<User>();
 *
 * // Configure stub behavior
 * userRepo.stubs.findOne.resolves(mockUser);
 * userRepo.stubs.count.resolves(42);
 *
 * // Assert calls
 * expect(userRepo.stubs.count.callCount).toBe(1);
 *
 * // Reset stubs between tests
 * userRepo.stubs.reset();
 *
 * @returns {RepositoryStub<T>} A repository stub with:
 *   - All standard repository methods as Sinon stubs
 *   - A `stubs` property providing direct access to all stubs for assertions
 *   - A `reset()` method to clear all stub state between tests
 **/
export function createRepositoryStub<T extends object>(): RepositoryStub<T> {
  // EntityRepository stubs
  const findStub = stub()
  const findOneStub = stub()
  const findOneOrFailStub = stub()
  const findAndCountStub = stub()
  const findAllStub = stub()
  const countStub = stub()
  const nativeInsertStub = stub()
  const nativeUpdateStub = stub()
  const nativeDeleteStub = stub()

  // PaginatedRepository stubs
  const paginateStub = stub()
  const persistStub = stub()
  const persistAndFlushStub = stub()
  const flushStub = stub()
  const removeStub = stub()
  const removeAndFlushStub = stub()

  const transactionalStub = stub()
  transactionalStub.callsFake(async (callback: (em: EntityManager<MySqlDriver>) => Promise<unknown>) => {
    return callback({} as unknown as EntityManager<MySqlDriver>)
  })

  const allStubs = [
    findStub,
    findOneStub,
    findOneOrFailStub,
    findAndCountStub,
    findAllStub,
    countStub,
    nativeInsertStub,
    nativeUpdateStub,
    nativeDeleteStub,
    paginateStub,
    persistStub,
    persistAndFlushStub,
    flushStub,
    removeStub,
    removeAndFlushStub,
  ]

  const reset = (): void => {
    allStubs.forEach(stub => {
      stub.reset()
      stub.throws()
    })
  }

  return {
    // EntityRepository methods
    find: findStub,
    findOne: findOneStub,
    findOneOrFail: findOneOrFailStub,
    findAndCount: findAndCountStub,
    findAll: findAllStub,
    count: countStub,
    nativeInsert: nativeInsertStub,
    nativeUpdate: nativeUpdateStub,
    nativeDelete: nativeDeleteStub,

    // PaginatedRepository methods
    paginate: paginateStub,
    persist: persistStub,
    persistAndFlush: persistAndFlushStub,
    flush: flushStub,
    remove: removeStub,
    removeAndFlush: removeAndFlushStub,

    // Other required methods
    transactional: transactionalStub,

    stubs: {
      find: findStub,
      findOne: findOneStub,
      findOneOrFail: findOneOrFailStub,
      findAndCount: findAndCountStub,
      findAll: findAllStub,
      count: countStub,
      nativeInsert: nativeInsertStub,
      nativeUpdate: nativeUpdateStub,
      nativeDelete: nativeDeleteStub,
      paginate: paginateStub,
      persist: persistStub,
      persistAndFlush: persistAndFlushStub,
      flush: flushStub,
      remove: removeStub,
      removeAndFlush: removeAndFlushStub,
      transactional: transactionalStub,
      reset,
    },
  } as unknown as RepositoryStub<T>
}
