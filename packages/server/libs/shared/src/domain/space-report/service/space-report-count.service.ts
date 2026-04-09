import { EntityManager, EntityName } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { AbstractCountService } from '@shared/domain/counters/abstract-count.service'
import { ScopeFilterProvider } from '@shared/domain/counters/counters.types'
import { SpaceReport } from '../entity/space-report.entity'
import { SpaceReportScopeFilterProvider } from '../space-report-scope-filter.provider'

@Injectable()
export class SpaceReportCountService extends AbstractCountService<SpaceReport> {
  protected readonly em: EntityManager
  protected readonly scopeFilterProvider: ScopeFilterProvider<SpaceReport>
  protected readonly entityClass: EntityName<SpaceReport> = SpaceReport

  constructor(em: SqlEntityManager, spaceReportScopeFilterProvider: SpaceReportScopeFilterProvider) {
    super()
    this.em = em
    this.scopeFilterProvider = spaceReportScopeFilterProvider
  }
}
