import { EntityManager, EntityName } from '@mikro-orm/core'
import { ScopeFilterContext, ScopeFilterProvider } from '@shared/domain/counters/counters.types'

/**
 * Abstract base class for count services.
 * Provides common counting logic for entities based on scope filter conditions.
 */
export abstract class AbstractCountService<T extends object> {
  protected abstract readonly em: EntityManager
  protected abstract readonly scopeFilterProvider: ScopeFilterProvider<T>
  protected abstract readonly entityClass: EntityName<T>

  async count(context: ScopeFilterContext): Promise<number> {
    const where = this.scopeFilterProvider.buildWhereCondition(context)

    if (where === null) {
      return 0
    }

    return this.em.count(this.entityClass, where)
  }
}
