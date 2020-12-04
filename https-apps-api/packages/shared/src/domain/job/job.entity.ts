import {
  Collection,
  Entity,
  EntityRepositoryType,
  IdentifiedReference,
  JsonType,
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
import { Provenance } from './job.input'

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

  @Property({ type: JsonType })
  provenance: Provenance

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
  localFolderId: number

  // @Property()
  // analysisId: number

  // relations
  @ManyToOne()
  user!: IdentifiedReference<User>

  @ManyToOne()
  app!: IdentifiedReference<App>

  @OneToMany({
    entity: () => Tagging,
    mappedBy: t => t.job,
  })
  taggings = new Collection<Tagging>(this);

  // pivot table key names are mismatched and this does not work :(
  // @ManyToMany({
  //   pivotTable: 'job_inputs',
  //   joinColumn: 'job_id',
  //   inverseJoinColumn: 'user_file_id',
  // })
  // userFiles = new Collection<UserFile>(this);

  [EntityRepositoryType]?: JobRepository

  constructor(user: User, app?: App) {
    super()
    this.user = Reference.create(user)
    if (app) {
      this.app = Reference.create(app)
    }
  }
}
