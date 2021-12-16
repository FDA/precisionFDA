import {
  Entity,
  Property,
  Unique,
  ManyToOne,
  IdentifiedReference,
  Reference,
  Enum,
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { User } from '../user/user.entity'
import { STATUS, ENGINE } from './db-cluster.enum'

@Entity({ tableName: 'dbclusters' })
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

  @Property()
  host: string

  @Property()
  port: string

  @Property()
  description: string

  @Property()
  statusAsOf: Date

  @Enum()
  status!: STATUS

  @Enum()
  engine!: ENGINE

  @ManyToOne()
  user!: IdentifiedReference<User>

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
