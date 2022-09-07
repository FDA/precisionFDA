import {
  Entity,
  Property,
  Unique,
  ManyToOne,
  IdentifiedReference,
  Reference,
  Enum,
  Filter,
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { formatDuration } from '../job/job.helper'
import { User } from '../user/user.entity'
import { STATUS, ENGINE } from './db-cluster.enum'

@Entity({ tableName: 'dbclusters' })
@Filter({ name: 'ownedBy', cond: args => ({ user: { id: args.userId } }) })
@Filter({ name: 'isNonTerminal', cond: {
    status: {
      $ne: STATUS.TERMINATED
    }
  }
})
export class DbCluster extends BaseEntity {
  @Property()
  @Unique()
  dxid!: string

  @Property()
  @Unique()
  uid!: string

  @Property()
  name!: string

  @Property()
  scope!: string

  @Property()
  project!: string

  @Property()
  dxInstanceClass!: string

  @Property()
  engineVersion!: string

  @Property({ nullable: true })
  host?: string

  @Property({ nullable: true })
  port?: string

  @Property({ nullable: true })
  description?: string

  @Property()
  statusAsOf: Date

  @Enum()
  status!: STATUS

  @Enum()
  engine!: ENGINE

  @ManyToOne(() => User)
  user!: IdentifiedReference<User>

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }

  elapsedTimeSinceCreation(): number {
    return new Date().getTime() - this.createdAt.getTime()
  }

  elapsedTimeSinceCreationString(): string {
    return formatDuration(this.elapsedTimeSinceCreation())
  }

}
