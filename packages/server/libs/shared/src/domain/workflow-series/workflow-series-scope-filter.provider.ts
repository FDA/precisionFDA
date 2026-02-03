import { FilterQuery } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { AbstractScopeFilterProvider } from '@shared/domain/counters/abstract-scope-filter.provider'
import { WorkflowSeries } from './workflow-series.entity'

/**
 * Scope filter provider for WorkflowSeries entities.
 * Uses standard filtering for all scopes (ME, FEATURED, EVERYBODY, SPACES).
 * Filters out deleted workflow series.
 */
@Injectable()
export class WorkflowSeriesScopeFilterProvider extends AbstractScopeFilterProvider<WorkflowSeries> {
  protected override getBaseCondition(): Partial<FilterQuery<WorkflowSeries>> {
    return {
      deleted: false,
    }
  }
}
