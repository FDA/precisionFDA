import {
  Entity,
  IdentifiedReference,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { App } from '../app/app.entity'
import { BaseEntity } from '../../database/base-entity'
import { User } from '../user/user.entity'
import { JOB_STATE } from './job.enum'

@Entity({ tableName: 'jobs' })
export class Job extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  dxid: string

  @Property()
  project: string

  @Property()
  runData: string

  @Property({ hidden: true })
  describe: string

  @Property({ hidden: true })
  provenance: string

  @Property()
  state: JOB_STATE

  @Property()
  name: string

  @Property()
  scope: string

  @Property()
  uid: string

  // foreign keys -> not yet mapped
  // @Property()
  // appSeriesId: number

  // @Property()
  // analysisId: number

  // relations
  // serialized name -> is it a good idea?
  @ManyToOne({ serializedName: 'userId' })
  user!: IdentifiedReference<User>

  @ManyToOne({ serializedName: 'appId' })
  app?: IdentifiedReference<App>

  constructor(user: User, app?: App) {
    super()
    this.user = Reference.create(user)
    if (app) {
      this.app = Reference.create(app)
    }
  }
}
