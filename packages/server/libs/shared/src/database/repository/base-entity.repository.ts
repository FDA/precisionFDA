import { TransactionOptions } from '@mikro-orm/core'
import { EntityManager, EntityRepository } from '@mikro-orm/mysql'

export abstract class BaseEntityRepository<T extends object> extends EntityRepository<T> {
  persist(entity: T | Iterable<T>): void {
    this.getEntityManager().persist(entity)
  }

  async persistAndFlush(entity: T | Iterable<T>): Promise<void> {
    await this.getEntityManager().persist(entity).flush()
  }

  async flush(): Promise<void> {
    await this.getEntityManager().flush()
  }

  remove(entity: T | Iterable<T>): void {
    this.getEntityManager().remove(entity)
  }

  async removeAndFlush(entity: T | Iterable<T>): Promise<void> {
    await this.getEntityManager().remove(entity).flush()
  }

  async transactional<R>(cb: (em: EntityManager) => Promise<R>, options?: TransactionOptions): Promise<R> {
    return this.getEntityManager().transactional(cb, options)
  }
}
