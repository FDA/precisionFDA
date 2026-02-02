import { Injectable } from '@nestjs/common'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { EntityManager, EntityName } from '@mikro-orm/core'
import { AbstractCountService } from '@shared/domain/counters/abstract-count.service'
import { ScopeFilterProvider } from '@shared/domain/counters/counters.types'
import { DbCluster } from '../db-cluster.entity'
import { DbClusterScopeFilterProvider } from '../db-cluster-scope-filter.provider'

@Injectable()
export class DbClusterCountService extends AbstractCountService<DbCluster> {
  protected readonly em: EntityManager
  protected readonly scopeFilterProvider: ScopeFilterProvider<DbCluster>
  protected readonly entityClass: EntityName<DbCluster> = DbCluster

  constructor(em: SqlEntityManager, dbClusterScopeFilterProvider: DbClusterScopeFilterProvider) {
    super()
    this.em = em
    this.scopeFilterProvider = dbClusterScopeFilterProvider
  }
}
