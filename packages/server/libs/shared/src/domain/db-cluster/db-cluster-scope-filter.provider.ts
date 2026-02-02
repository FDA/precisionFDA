import { FilterQuery } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { AbstractScopeFilterProvider } from '@shared/domain/counters/abstract-scope-filter.provider'
import { ScopeFilterContext } from '@shared/domain/counters/counters.types'
import { DbCluster } from './db-cluster.entity'

/**
 * Scope filter provider for DbCluster entities.
 * DbClusters do not have public scope or featured flag.
 * Only ME and SPACES scopes are supported.
 */
@Injectable()
export class DbClusterScopeFilterProvider extends AbstractScopeFilterProvider<DbCluster> {
  protected override buildFeaturedCondition(
    _context: ScopeFilterContext,
  ): FilterQuery<DbCluster> | null {
    return null
  }

  protected override buildEverybodyCondition(
    _context: ScopeFilterContext,
  ): FilterQuery<DbCluster> | null {
    return null
  }
}
