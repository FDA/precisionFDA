import { Entity, ManyToOne, Ref } from '@mikro-orm/core'
import { Job } from '@shared/domain/job/job.entity'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'

@Entity({ discriminatorValue: TAGGABLE_TYPE.JOB })
export class JobTagging extends Tagging {
  @ManyToOne(() => Job, { joinColumn: 'taggable_id' })
  job: Ref<Job>
}
