import { Entity, ManyToOne, OneToOne, Property, Ref } from '@mikro-orm/core'
import { BaseEntity } from '@shared/database/base.entity'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { Job } from '@shared/domain/job/job.entity'
import { User } from '@shared/domain/user/user.entity'

@Entity({ tableName: 'submissions' })
export class Submission extends BaseEntity {
  @ManyToOne({ entity: () => Challenge })
  challenge!: Ref<Challenge>

  @OneToOne({ entity: () => Job })
  job!: Ref<Job>

  @ManyToOne({ entity: () => User })
  user!: Ref<User>

  @Property({ fieldName: 'desc' })
  description: string
}
