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
import { ScopedEntity } from '@shared/database/scoped.entity'
import { Uid } from '@shared/domain/entity/domain/uid'
import { DbClusterProperty } from '@shared/domain/property/db-cluster-property.entity'
import { DbClusterTagging } from '@shared/domain/tagging/db-cluster-tagging.entity'
import { formatDuration } from '../../utils/format'
import { DxId } from '../entity/domain/dxid'
import { User } from '../user/user.entity'
import { DB_SYNC_STATUS, ENGINE, STATUS } from './db-cluster.enum'
import { DbClusterRepository } from './db-cluster.repository'

@Entity({ tableName: 'dbclusters', repository: () => DbClusterRepository })
@Filter({ name: 'ownedBy', cond: args => ({ user: { id: args.userId } }) })
@Filter({
  name: 'isNonTerminal',
  cond: {
    status: {
      $ne: STATUS.TERMINATED,
    },
  },
})
export class DbCluster extends ScopedEntity {
  @Property()
  @Unique()
  dxid!: DxId<'dbcluster'>

  @Property()
  @Unique()
  uid!: Uid<'dbcluster'>

  @Property()
  name!: string

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

  @Property()
  salt!: string

  @Enum()
  status!: STATUS

  @Enum()
  syncStatus!: DB_SYNC_STATUS

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

  @OneToMany(
    () => DbClusterTagging,
    tagging => tagging.dbCluster,
    { orphanRemoval: true },
  )
  taggings = new Collection<DbClusterTagging>(this)

  @Property({ nullable: true })
  failureReason?: string

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }

  elapsedTimeSinceCreation(): number {
    return Date.now() - this.createdAt.getTime()
  }

  elapsedTimeSinceCreationString(): string {
    return formatDuration(this.elapsedTimeSinceCreation())
  }
}
