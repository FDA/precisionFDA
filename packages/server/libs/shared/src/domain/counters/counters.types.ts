import { FilterQuery } from '@mikro-orm/core'
import { HOME_SCOPE } from '@shared/enums'
import { User } from '@shared/domain/user/user.entity'

export type SpaceScope = `space-${number}`

export interface ScopeFilterContext {
  user: User
  scope: HOME_SCOPE
  spaceScopes: SpaceScope[]
}

/**
 * Interface for building scope-based where conditions.
 * Used by both count and list services.
 */
export interface ScopeFilterProvider<T extends object> {
  /**
   * Build the where condition for the given scope context.
   * Returns null if the entity shouldn't be counted/listed for the given scope.
   */
  buildWhereCondition(context: ScopeFilterContext): FilterQuery<T> | null
}

export interface CountersResponse {
  files: number
  apps: number
  assets: number
  jobs: number
  dbclusters: number
  workflows: number
  reports: number
  discussions: number
}
