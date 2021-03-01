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
  EntityRepositoryType,
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { Job } from '../job/job.entity'
import { User } from '../user/user.entity'
import { APP_HTTPS_SUBTYPE, ENTITY_TYPE } from './app.enum'
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
  @ManyToOne({ serializedName: 'userId' })
  user!: IdentifiedReference<User>

  @OneToMany({ entity: () => Job, mappedBy: 'app' })
  jobs = new Collection<Job>(this)

  @Enum()
  entityType: ENTITY_TYPE;

  [EntityRepositoryType]?: AppRepository

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }

  // dynamic fields - only temporary
  @Property({ name: 'httpsSubtype', nullable: true })
  getSubType() {
    // fixme: should be in the database later
    return APP_HTTPS_SUBTYPE.JUPYTER
  }
}
