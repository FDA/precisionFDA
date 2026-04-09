import { EntityManager, EntityName } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { AbstractCountService } from '@shared/domain/counters/abstract-count.service'
import { ScopeFilterProvider } from '@shared/domain/counters/counters.types'
import { AppSeries } from './app-series.entity'
import { AppSeriesScopeFilterProvider } from './app-series-scope-filter.provider'

@Injectable()
export class AppSeriesCountService extends AbstractCountService<AppSeries> {
  protected readonly em: EntityManager
  protected readonly scopeFilterProvider: ScopeFilterProvider<AppSeries>
  protected readonly entityClass: EntityName<AppSeries> = AppSeries

  constructor(em: SqlEntityManager, appSeriesScopeFilterProvider: AppSeriesScopeFilterProvider) {
    super()
    this.em = em
    this.scopeFilterProvider = appSeriesScopeFilterProvider
  }
}
