import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { constructDxid } from '@shared/domain/app/app.helper'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { AppSeriesRepository } from '@shared/domain/app-series/app-series.repository'
import { AppSeriesCountService } from '@shared/domain/app-series/app-series-count.service'
import { ScopeFilterContext } from '@shared/domain/counters/counters.types'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { EntityScope } from '@shared/types/common'

@Injectable()
export class AppSeriesService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
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

  async createAppSeries(appName: string, user: User, scope?: EntityScope): Promise<AppSeries> {
    const appSeriesDxid = constructDxid(this.user.dxuser, appName, scope)
    const appSeries = new AppSeries(user)
    appSeries.name = appName
    appSeries.dxid = appSeriesDxid
    appSeries.scope = scope
    this.logger.log(`Creating app series ${appSeries.dxid}`)
    await this.em.persist(appSeries).flush()
    return appSeries
  }
}
