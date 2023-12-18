import {
    Entity,
    Ref,
    ManyToOne,
} from '@mikro-orm/core'
import { GeneralProperty } from "./property.entity";
import { WorkflowSeries } from "../workflow-series";

@Entity({ discriminatorValue: 'workflowSeries' })
export class WorkflowSeriesProperty extends GeneralProperty {

    @ManyToOne(() => WorkflowSeries, { joinColumn: 'target_id' })
    workflowSeries: Ref<WorkflowSeries>
}
