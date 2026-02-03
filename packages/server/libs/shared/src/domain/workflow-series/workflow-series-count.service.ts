import { Injectable } from '@nestjs/common'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { EntityManager, EntityName } from '@mikro-orm/core'
import { AbstractCountService } from '@shared/domain/counters/abstract-count.service'
import { ScopeFilterProvider } from '@shared/domain/counters/counters.types'
import { WorkflowSeries } from './workflow-series.entity'
import { WorkflowSeriesScopeFilterProvider } from './workflow-series-scope-filter.provider'

@Injectable()
export class WorkflowSeriesCountService extends AbstractCountService<WorkflowSeries> {
  protected readonly em: EntityManager
  protected readonly scopeFilterProvider: ScopeFilterProvider<WorkflowSeries>
  protected readonly entityClass: EntityName<WorkflowSeries> = WorkflowSeries

  constructor(
    em: SqlEntityManager,
    workflowSeriesScopeFilterProvider: WorkflowSeriesScopeFilterProvider,
  ) {
    super()
    this.em = em
    this.scopeFilterProvider = workflowSeriesScopeFilterProvider
  }
}
