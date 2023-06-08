import {
  Collection,
  Filter,
  IdentifiedReference,
  ManyToOne,
  OneToMany,
  ManyToMany,
  Property,
  Reference,
  EntityRepository,
  EntityRepositoryType,
  Entity,
} from '@mikro-orm/core'
import { Tagging, User } from '..'
import { AssetRepository } from './asset.repository'
import { App } from '../app'
import { Node } from './node.entity'
import { FILE_ORIGIN_TYPE, FILE_STATE, PARENT_TYPE, IFileOrAsset, FILE_STI_TYPE, ITrackable } from './user-file.types'

@Filter({ name: 'asset', cond: { stiType: FILE_STI_TYPE.ASSET } })
@Entity({ tableName: 'nodes', customRepository: () => AssetRepository })
class Asset extends Node implements IFileOrAsset, ITrackable {
  @Property()
  dxid: string

  @Property()
  project: string

  @Property()
  name: string

  @Property()
  description?: string

  @Property()
  state: FILE_STATE

  @Property()
  entityType: FILE_ORIGIN_TYPE

  @Property()
  uid: string

  @Property()
  scope: string

  @Property({ type: 'bigint' })
  fileSize?: number

  // unused FK references
  // resolves into User/Job/Asset and other entities in PFDA
  @Property()
  parentId: number

  @Property()
  parentType: PARENT_TYPE

  @Property({ fieldName: 'parent_folder_id' })
  parentFolderId?: number

  @Property()
  scopedParentFolderId?: Node

  @ManyToOne(() => User)
  user!: IdentifiedReference<User>

  @OneToMany(() => Tagging, tagging => tagging.asset, { orphanRemoval: true })
  taggings = new Collection<Tagging>(this)

  @ManyToMany(() => App, app => app.assets)
  apps = new Collection<App>(this)

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }

  isCreatedByChallengeBot(): boolean {
    // Challenge resources are always files, see create_challenge_resource in api_controller.rb
    return false
  }

  [EntityRepositoryType]?: AssetRepository
}

export {
  Asset,
}
