import {
  Collection,
  Entity,
  EntityRepositoryType,
  Enum,
  Filter,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Ref,
  Reference,
} from '@mikro-orm/core'
import { Job } from '@shared/domain/job/job.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { BaseEntity } from '../../database/base-entity'
import { WorkaroundJsonType } from '../../database/custom-json-type'
import { getLogger } from '../../logger'
import { DxId } from '../entity/domain/dxid'
import { Uid } from '../entity/domain/uid'
import { ENTITY_TYPE } from './app.enum'
import type { Spec } from './app.input'
import { AppRepository } from './app.repository'

const logger = getLogger('app.entity')

export interface AppSpec {
  input_spec: Spec[]
  output_spec: Spec[]
  internet_access: boolean
  instance_type: string
}

export interface Internal {
  ordered_assets?: string[]
  packages: string[]
  code: string
  platform_tags?: string[]
}

@Entity({ tableName: 'apps', repository: () => AppRepository })
@Filter({
  name: 'accessibleBy',
  cond: (args) => ({
    $or: [
      { user: { id: args.userId }, scope: STATIC_SCOPE.PRIVATE },
      { scope: { $in: args.spaceScopes } },
    ],
  }),
})
export class App extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  dxid: DxId<'app'>

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

  @Property({ type: WorkaroundJsonType })
  spec: AppSpec

  @Property({ type: WorkaroundJsonType })
  internal: Internal

  @Property()
  verified: boolean

  @Property({ unique: true })
  uid: Uid<'app'>

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
  user!: Ref<User>

  @OneToMany({ entity: () => Job, mappedBy: 'app' })
  jobs = new Collection<Job>(this)

  @ManyToMany(() => Asset, 'apps', {
    pivotTable: 'apps_assets',
    owner: true,
    inverseJoinColumn: 'asset_id',
  })
  assets = new Collection<Asset>(this)

  @Enum()
  entityType: ENTITY_TYPE

  isHTTPS() {
    return this.entityType === ENTITY_TYPE.HTTPS
  }

  @Property({ persist: false })
  get workstationTags(): string[] {
    return this.internal?.platform_tags ?? []
  }

  // Workstation API support
  //
  @Property({ persist: false })
  get workstationAPITag(): string | null {
    try {
      return this.workstationTags.find((x: string) => x.startsWith('pfda_workstation_api')) ?? null
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
    return tag != null
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

  @Property({ persist: false })
  get hasHttpsAppState(): boolean {
    return this.workstationTags.some((x: string) => x.startsWith('pfda_httpsAppState_enabled'))
  }
}
