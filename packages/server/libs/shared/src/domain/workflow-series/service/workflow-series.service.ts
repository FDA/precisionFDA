import { Injectable } from '@nestjs/common'
import { ScopeFilterContext } from '@shared/domain/counters/counters.types'
import { WorkflowSeriesCountService } from '@shared/domain/workflow-series/workflow-series-count.service'

@Injectable()
export class WorkflowSeriesService {
  constructor(private readonly workflowSeriesCountService: WorkflowSeriesCountService) {}

  /**
   * Count workflow series based on the given scope filter context
   */
  async countByScope(context: ScopeFilterContext): Promise<number> {
    return this.workflowSeriesCountService.count(context)
  }
}
