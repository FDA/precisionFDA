import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  IdentifiedReference,
  Reference,
  Collection,
  OneToMany,
} from '@mikro-orm/core'
import { BaseEntity } from '../database/base-entity'
import { Job } from '../jobs'
import { User } from '../users'
import { APP_HTTPS_SUBTYPE, APP_TYPE } from './domain/app.enum'

@Entity({ tableName: 'apps' })
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
  // @Property()
  // appSeriesId: numbers

  // references
  @ManyToOne({ serializedName: 'userId' })
  user!: IdentifiedReference<User>

  @OneToMany({ entity: () => Job, mappedBy: 'app' })
  jobs = new Collection<Job>(this)

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }

  // dynamic fields - only temporary
  @Property({ name: 'type' })
  getType() {
    // fixme: should be in the database later
    return APP_TYPE.HTTPS
  }

  @Property({ name: 'httpsSubtype', nullable: true })
  getSubType() {
    // fixme: should be in the database later
    return APP_HTTPS_SUBTYPE.JUPYTER
  }
}
