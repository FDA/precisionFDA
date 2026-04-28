import { EVENT_TYPES } from '../event.entity'
import { AggregateKind } from './aggregate-kind.type'
import { FilterColumn } from './filter-column.type'
import { MetricColumn } from './metric-column.type'

export interface MetricDefinition {
  eventType: EVENT_TYPES
  aggregate: AggregateKind
  column: MetricColumn
  filters?: Partial<Record<FilterColumn, string>>
}
