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
  state: JOB_STATE

  @Property()
  name: string

  @Property()
  scope: string

  @Property()
  entityType: number

  @Property({ hidden: true })
  runData: string

  @Property({ hidden: true })
  describe: string

  @Property({ type: JsonType, hidden: true })
  provenance: Provenance

  @Property({ hidden: true })
  uid: string

  // foreign keys -> not yet mapped
  @Property({ hidden: true })
  appSeriesId: number

  @Property({ hidden: true })
  localFolderId: number

  // @Property()
  // analysisId: number

  // relations
  @ManyToOne()
  user!: IdentifiedReference<User>

  @ManyToOne()
  app!: IdentifiedReference<App>;

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
