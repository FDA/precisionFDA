import { Injectable } from '@nestjs/common'
import { ActivityReportService } from './activity-report.service'
import { ActivityTotals } from './model/activity-totals'
import { MetricType } from './model/metric.type'
import { MetricResult } from './model/metric-result'

@Injectable()
export class EventService {
  constructor(private readonly activityReportService: ActivityReportService) {}

  async getTotals(startDate?: Date, endDate?: Date): Promise<ActivityTotals> {
    return this.activityReportService.getTotals(startDate, endDate)
  }

  async getMetric(metricType: MetricType, startDate: Date, endDate: Date): Promise<MetricResult> {
    return this.activityReportService.getMetric(metricType, startDate, endDate)
  }
}
