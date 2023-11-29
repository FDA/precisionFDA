import {
    Entity,
    Ref,
    ManyToOne,
} from '@mikro-orm/core'
import { GeneralProperty } from "./property.entity";
import { Job } from "../job";

@Entity({ discriminatorValue: 'job' })
export class JobProperty extends GeneralProperty {

    @ManyToOne(() => Job, { joinColumn: 'target_id' })
    job: Ref<Job>
}
