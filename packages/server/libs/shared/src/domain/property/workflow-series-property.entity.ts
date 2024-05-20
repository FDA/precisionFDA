import {
    Entity,
    Ref,
    ManyToOne,
} from '@mikro-orm/core'
import { WorkflowSeries } from '@shared/domain/workflow-series/workflow-series.entity'
import { GeneralProperty } from "./property.entity";

@Entity({ discriminatorValue: 'workflowSeries' })
export class WorkflowSeriesProperty extends GeneralProperty {

    @ManyToOne(() => WorkflowSeries, { joinColumn: 'target_id' })
    workflowSeries: Ref<WorkflowSeries>
}
