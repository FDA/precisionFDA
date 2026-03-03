import { FilterQuery } from '@mikro-orm/core'
import { ApiProperty } from '@nestjs/swagger'
import { User } from '@shared/domain/user/user.entity'
import { HOME_SCOPE } from '@shared/enums'

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

export class CountersResponse {
  @ApiProperty({ description: 'Number of files', example: 12 })
  files: number

  @ApiProperty({ description: 'Number of apps', example: 5 })
  apps: number

  @ApiProperty({ description: 'Number of assets', example: 3 })
  assets: number

  @ApiProperty({ description: 'Number of jobs', example: 8 })
  jobs: number

  @ApiProperty({ description: 'Number of database clusters', example: 1 })
  dbclusters: number

  @ApiProperty({ description: 'Number of workflows', example: 4 })
  workflows: number

  @ApiProperty({ description: 'Number of reports', example: 2 })
  reports: number

  @ApiProperty({ description: 'Number of discussions', example: 6 })
  discussions: number
}

export class SpaceCountersResponse extends CountersResponse {
  @ApiProperty({ description: 'Number of space members', example: 10 })
  members: number
}
