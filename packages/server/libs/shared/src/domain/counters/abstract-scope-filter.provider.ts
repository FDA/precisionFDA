import { FilterQuery } from '@mikro-orm/core'
import { HOME_SCOPE, STATIC_SCOPE } from '@shared/enums'
import { ScopeFilterContext, ScopeFilterProvider } from '@shared/domain/counters/counters.types'

/**
 * Abstract base class for scope filter providers.
 * Provides common filtering logic for entities based on HOME_SCOPE.
 *
 * Subclasses can override individual scope methods to customize behavior
 * or return null if a scope is not supported for the entity type.
 */
export abstract class AbstractScopeFilterProvider<T extends object>
  implements ScopeFilterProvider<T>
{
  buildWhereCondition(context: ScopeFilterContext): FilterQuery<T> | null {
    const { scope } = context

    switch (scope) {
      case HOME_SCOPE.ME:
        return this.buildMeCondition(context)
      case HOME_SCOPE.FEATURED:
        return this.buildFeaturedCondition(context)
      case HOME_SCOPE.EVERYBODY:
        return this.buildEverybodyCondition(context)
      case HOME_SCOPE.SPACES:
        return this.buildSpacesCondition(context)
      default:
        return null
    }
  }

  /**
   * Override to provide base conditions that apply to all scopes.
   * Returns an empty object by default.
   */
  protected getBaseCondition(): Partial<FilterQuery<T>> {
    return {}
  }

  /**
   * Build condition for HOME_SCOPE.ME - private entities owned by user
   * Override in subclass to customize or return null if not supported
   */
  protected buildMeCondition(context: ScopeFilterContext): FilterQuery<T> | null {
    return {
      ...this.getBaseCondition(),
      user: context.user.id,
      scope: STATIC_SCOPE.PRIVATE,
    } as FilterQuery<T>
  }

  /**
   * Build condition for HOME_SCOPE.FEATURED - featured public entities
   * Override in subclass to customize or return null if not supported
   */
  protected buildFeaturedCondition(_context: ScopeFilterContext): FilterQuery<T> | null {
    return {
      ...this.getBaseCondition(),
      featured: true,
      scope: STATIC_SCOPE.PUBLIC,
    } as FilterQuery<T>
  }

  /**
   * Build condition for HOME_SCOPE.EVERYBODY - all public entities
   * Override in subclass to customize or return null if not supported
   */
  protected buildEverybodyCondition(_context: ScopeFilterContext): FilterQuery<T> | null {
    return {
      ...this.getBaseCondition(),
      scope: STATIC_SCOPE.PUBLIC,
    } as FilterQuery<T>
  }

  /**
   * Build condition for HOME_SCOPE.SPACES - entities in accessible spaces
   * Override in subclass to customize or return null if not supported
   */
  protected buildSpacesCondition(context: ScopeFilterContext): FilterQuery<T> | null {
    const { spaceScopes } = context
    if (spaceScopes.length === 0) return null
    return {
      ...this.getBaseCondition(),
      scope: { $in: spaceScopes },
    } as FilterQuery<T>
  }
}
