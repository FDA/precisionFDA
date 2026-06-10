import { Injectable } from '@nestjs/common'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { AppSeriesRepository } from '@shared/domain/app-series/app-series.repository'
import { AppSeriesCountService } from '@shared/domain/app-series/app-series-count.service'
import { ScopeFilterContext } from '@shared/domain/counters/counters.types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { EntityScope } from '@shared/types/common'

@Injectable()
export class AppSeriesService {
  constructor(
    private readonly user: UserContext,
    private readonly appSeriesRepository: AppSeriesRepository,
    private readonly appSeriesCountService: AppSeriesCountService,
  ) {}

  /**
   * Count app series based on the given scope filter context
   */
  async countByScope(context: ScopeFilterContext): Promise<number> {
    return this.appSeriesCountService.count(context)
  }

  async getAppSeriesByName(name: string, scope: EntityScope): Promise<AppSeries | null> {
    return this.appSeriesRepository.findOne({
      name,
      scope,
      user: this.user.id,
    })
  }
}
