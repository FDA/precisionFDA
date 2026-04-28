import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
import { Controller, Get, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common'
import { EventService } from '@shared/domain/event/event.service'
import { ActivityTotals } from '@shared/domain/event/model/activity-totals'
import { MetricResult } from '@shared/domain/event/model/metric-result'
import { SiteAdminGuard } from '../admin/guards/site-admin.guard'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { ActivityReportMetricParamsDTO, ActivityReportQueryDTO } from './activity-reports.dto'

@UseGuards(UserContextGuard, SiteAdminGuard)
@UseInterceptors(CacheInterceptor)
@CacheTTL(60_000) // cache for 60 seconds
@Controller('/admin/activity-reports')
export class ActivityReportsController {
  constructor(private readonly eventService: EventService) {}

  @Get('/totals')
  async getTotals(@Query() query: ActivityReportQueryDTO): Promise<ActivityTotals> {
    const now = new Date()
    const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const hasAnyDate = query.dateFrom != null || query.dateTo != null
    if (!hasAnyDate) {
      return this.eventService.getTotals()
    }

    return this.eventService.getTotals(query.dateFrom ?? defaultStartDate, query.dateTo ?? now)
  }

  @Get('/metrics/:metricType')
  async getMetric(
    @Param() params: ActivityReportMetricParamsDTO,
    @Query() query: ActivityReportQueryDTO,
  ): Promise<MetricResult> {
    const now = new Date()
    const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return this.eventService.getMetric(params.metricType, query.dateFrom ?? defaultStartDate, query.dateTo ?? now)
  }
}
