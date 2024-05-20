import {
    Entity,
    Ref,
    ManyToOne,
} from '@mikro-orm/core'
import { Job } from '@shared/domain/job/job.entity'
import { GeneralProperty } from '@shared/domain/property/property.entity'

@Entity({ discriminatorValue: 'job' })
export class JobProperty extends GeneralProperty {

    @ManyToOne(() => Job, { joinColumn: 'target_id' })
    job: Ref<Job>
}
