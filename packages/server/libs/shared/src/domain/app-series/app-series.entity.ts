import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Ref,
  Reference,
} from '@mikro-orm/core'
import { ScopedEntity } from '@shared/database/scoped.entity'
import { AppSeriesProperty } from '@shared/domain/property/app-series-property.entity'
import { User } from '@shared/domain/user/user.entity'
import { AppSeriesRepository } from './app-series.repository'

@Entity({ tableName: 'app_series', repository: () => AppSeriesRepository })
export class AppSeries extends ScopedEntity {
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
  verified: boolean

  @Property()
  featured?: boolean

  @Property()
  deleted: boolean

  @Property()
  snapshot: boolean

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
