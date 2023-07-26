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
  EntityRepositoryType, JsonType,
} from '@mikro-orm/core'
import { getLogger } from '../../logger'
import { BaseEntity } from '../../database/base-entity'
import { Job } from '../job/job.entity'
import { Asset } from '../user-file'
import { User } from '../user/user.entity'
import { ENTITY_TYPE } from './app.enum'
import { AppRepository } from './app.repository'
import { Spec } from './app.input'
import { isNil } from 'ramda'

const logger = getLogger('app.entity')

export class AppSpec extends JsonType {
  input_spec: Spec[]
  output_spec: Spec[]
  internet_access: boolean
  instance_type: string

  convertToJSValue(value: string | null) {
    if (isNil(value)) {
      return value
    }

    return JSON.parse(value)
  }
}

export class Internal extends JsonType {
  ordered_assets?: string[]
  packages: string[]
  code: string
  platform_tags?: string[]

  convertToJSValue(value: string | null) {
    if (isNil(value)) {
      return value
    }

    return JSON.parse(value)
  }
}

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
  scope?: string

  @Property({ type: AppSpec })
  spec: AppSpec

  @Property({ type: Internal })
  internal: Internal

  @Property()
  verified: boolean

  @Property()
  uid: string

  @Property()
  devGroup: string

  @Property()
  release: string

  @Property()
  forkedFrom: string | null

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

  // Workstation API support
  //
  @Property({ persist: false })
  get workstationAPITag(): string | null {
    if (!this.internal) {
      return null
    }

    try {
      if (this.internal.platform_tags) {
        const workstationApi = this.internal.platform_tags.find((x: string) => x.startsWith('pfda_workstation_api'))
        return workstationApi ? workstationApi : null
      }
    } catch (err) {
      logger.error('Unable to parse workstation API tag', {
        id: this.id,
        uid: this.uid,
        internal: this.internal,
        error: err,
      })
    }
    return null
  }

  @Property({ persist: false })
  get hasWorkstationAPI(): boolean {
    const tag = this.workstationAPITag
    return (tag != null)
  }

  @Property({ persist: false })
  get workstationAPIVersion(): string | null {
    const tag = this.workstationAPITag
    return tag?.split(':')[1] ?? null
  }

  [EntityRepositoryType]?: AppRepository

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
