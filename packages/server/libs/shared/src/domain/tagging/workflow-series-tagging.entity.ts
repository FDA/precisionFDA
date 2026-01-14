import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { WorkflowSeries } from '@shared/domain/workflow-series/workflow-series.entity'

@Entity({ discriminatorValue: TAGGABLE_TYPE.WORKFLOW_SERIES })
export class WorkflowSeriesTagging extends Tagging {
  @ManyToOne(() => WorkflowSeries, { joinColumn: 'taggable_id' })
  workflowSeries: Ref<WorkflowSeries>
}
