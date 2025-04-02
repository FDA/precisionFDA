import { Entity, ManyToOne, Property, Ref } from '@mikro-orm/core'
import { BaseEntity } from '@shared/database/base.entity'
import { User } from '@shared/domain/user/user.entity'
import { DbCluster } from '../db-cluster.entity'
import { UsersDbClustersSaltRepository } from './users-db-clusters-salt.repository'

@Entity({ tableName: 'users_dbclusters_salts', repository: () => UsersDbClustersSaltRepository })
export class UsersDbClustersSalt extends BaseEntity {
  @ManyToOne(() => DbCluster)
  dbcluster!: Ref<DbCluster>

  @ManyToOne(() => User)
  user!: Ref<User>

  @Property({ nullable: false })
  salt: string
}
