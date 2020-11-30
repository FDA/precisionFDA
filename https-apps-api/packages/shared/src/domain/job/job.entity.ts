import {
  Collection,
  Entity,
  EntityRepositoryType,
  IdentifiedReference,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { App } from '../app'
import { BaseEntity } from '../../database/base-entity'
import { User } from '../user'
import { Tagging } from '../tagging'
import { JOB_STATE } from './job.enum'
import { JobRepository } from './job.repository'

@Entity({ tableName: 'jobs', customRepository: () => JobRepository })
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

  @Property()
  entityType: number

  // foreign keys -> not yet mapped
  @Property()
  appSeriesId: number

  @Property()
  localFolderId: number;

  // @Property()
  // analysisId: number

  [EntityRepositoryType]?: JobRepository

  // relations
  @ManyToOne()
  user!: IdentifiedReference<User>

  @ManyToOne()
  app?: IdentifiedReference<App>

  @OneToMany({
    entity: () => Tagging,
    mappedBy: t => t.job,
  })
  taggings = new Collection<Tagging>(this)

  constructor(user: User, app?: App) {
    super()
    this.user = Reference.create(user)
    if (app) {
      this.app = Reference.create(app)
    }
  }
}
