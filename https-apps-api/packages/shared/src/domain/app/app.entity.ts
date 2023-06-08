import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  IdentifiedReference,
  Reference,
  Collection,
  OneToMany,
  Enum,
  ManyToMany,
  EntityRepositoryType,
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { Job } from '../job/job.entity'
import { Asset } from '../user-file'
import { User } from '../user/user.entity'
import { ENTITY_TYPE } from './app.enum'
import { AppRepository } from './app.repository'

@Entity({ tableName: 'apps', customRepository: () => AppRepository })
export class App extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  dxid: string

  @Property()
  version: string

  @Property()
  revision: number

  @Property()
  title: string

  @Property()
  readme: string

  @Property()
  scope: string

  @Property()
  spec: string

  @Property()
  internal: string

  @Property()
  verified: boolean

  @Property()
  uid: string

  @Property()
  devGroup: string

  @Property()
  release: string

  // foreign keys -> not yet mapped
  @Property()
  appSeriesId: number

  // references
  @ManyToOne({ entity: () => User, serializedName: 'userId' })
  user!: IdentifiedReference<User>

  @OneToMany({ entity: () => Job, mappedBy: 'app' })
  jobs = new Collection<Job>(this)

  @ManyToMany(() => Asset, 'apps', {
    pivotTable: 'apps_assets',
    owner: true,
    inverseJoinColumn: 'asset_id'})
  assets = new Collection<Asset>(this)

  @Enum()
  entityType: ENTITY_TYPE

  isRegular() {
    return this.entityType === ENTITY_TYPE.NORMAL
  }

  isHTTPS() {
    return this.entityType === ENTITY_TYPE.HTTPS
  }

  [EntityRepositoryType]?: AppRepository

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
