import {
  Collection,
  Entity,
  Enum,
  Filter,
  ManyToOne,
  OneToMany,
  Property,
  Ref,
  Reference,
  Unique,
} from '@mikro-orm/core'
import { Uid } from '@shared/domain/entity/domain/uid'
import { DbClusterProperty } from '@shared/domain/property/db-cluster-property.entity'
import { SCOPE } from '@shared/types/common'
import { BaseEntity } from '../../database/base-entity'
import { formatDuration } from '../../utils/format'
import { DxId } from '../entity/domain/dxid'
import { User } from '../user/user.entity'
import { ENGINE, STATUS } from './db-cluster.enum'

@Entity({ tableName: 'dbclusters' })
@Filter({ name: 'ownedBy', cond: (args) => ({ user: { id: args.userId } }) })
@Filter({
  name: 'isNonTerminal',
  cond: {
    status: {
      $ne: STATUS.TERMINATED,
    },
  },
})
export class DbCluster extends BaseEntity {
  @Property()
  @Unique()
  dxid!: DxId<'dbcluster'>

  @Property()
  @Unique()
  uid!: Uid<'dbcluster'>

  @Property()
  name!: string

  @Property()
  scope!: SCOPE

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
  user!: Ref<User>

  @OneToMany({
    entity: () => DbClusterProperty,
    mappedBy: 'dbCluster',
    orphanRemoval: true,
  })
  properties = new Collection<DbClusterProperty>(this)

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
