import {
  Collection,
  Entity,
  Ref,
  ManyToOne, OneToMany,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { User } from '../user'
import { BaseEntity } from '../../database/base-entity'
import { AppSeriesProperty } from '../property'

@Entity({ tableName: 'app_series' })
export class AppSeries extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  dxid?: string

  @Property()
  name?: string

  @Property()
  latestRevisionAppId?: number

  @Property()
  latestVersionAppId?: number

  @Property()
  scope?: string

  @Property()
  verified: boolean

  @Property()
  featured?: boolean

  @Property()
  deleted: boolean

  @ManyToOne({ entity: () => User, serializedName: 'userId' })
  user?: Ref<User>

  constructor(user?: User) {
    super()
    if (user) {
      this.user = Reference.create(user)
    }
  }

  @OneToMany({
    entity: () => AppSeriesProperty,
    mappedBy: 'appSeries',
    orphanRemoval: true,
  })
  properties = new Collection<AppSeriesProperty>(this)
}
