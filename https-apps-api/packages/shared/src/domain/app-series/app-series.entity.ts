import {
  Entity,
  IdentifiedReference,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { User } from '../user'
import { BaseEntity } from '../../database/base-entity'

@Entity({ tableName: 'app_series' })
export class AppSeries extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  dxid: string

  @Property()
  name: string

  @Property()
  latestRevisionAppId: number

  @Property()
  latestVersionAppId: number

  @Property()
  scope: string

  @Property()
  verified: boolean

  @Property()
  featured: boolean

  @Property()
  deleted: boolean

  @ManyToOne({ entity: () => User, serializedName: 'userId' })
  user!: IdentifiedReference<User>

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
