import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { ScopeFilterContext } from '@shared/domain/counters/counters.types'
import { AppSeriesCountService } from '@shared/domain/app-series/app-series-count.service'

@Injectable()
export class AppSeriesService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(private readonly appSeriesCountService: AppSeriesCountService) {}

  /**
   * Count app series based on the given scope filter context
   */
  async countByScope(context: ScopeFilterContext): Promise<number> {
    return this.appSeriesCountService.count(context)
  }
}
