import { IsDate, IsIn, IsOptional } from 'class-validator'
import { ACTIVITY_METRIC_TYPES } from '@shared/domain/event/model/activity-metric-types'
import { MetricType } from '@shared/domain/event/model/metric.type'
import { ToOptionalDate } from '../validation/decorators/to-optional-date.decorator'

export class ActivityReportQueryDTO {
  @IsOptional()
  @ToOptionalDate()
  @IsDate()
  dateFrom?: Date

  @IsOptional()
  @ToOptionalDate()
  @IsDate()
  dateTo?: Date
}

export class ActivityReportMetricParamsDTO {
  @IsIn(ACTIVITY_METRIC_TYPES)
  metricType!: MetricType
}
