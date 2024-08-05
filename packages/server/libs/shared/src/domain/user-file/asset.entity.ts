import {
  Collection,
  Entity,
  EntityRepositoryType,
  Filter,
  ManyToMany,
  OneToMany,
  Property,
  Reference,
} from '@mikro-orm/core'
import { App } from '@shared/domain/app/app.entity'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { ArchiveEntry } from '@shared/domain/user-file/archive-entry.entity'
import { User } from '@shared/domain/user/user.entity'
import { AssetRepository } from './asset.repository'
import { Node } from './node.entity'
import { FILE_STATE, FILE_STI_TYPE, IFileOrAsset, ITrackable } from './user-file.types'

@Filter({ name: 'asset', cond: { stiType: FILE_STI_TYPE.ASSET } })
@Filter({
  name: 'accessibleBy',
  cond: (args) => ({
    $or: [{ user: { id: args.userId }, scope: 'private' }, { scope: { $in: args.spaceScopes } }],
  }),
})
@Entity({ tableName: 'nodes', repository: () => AssetRepository })
class Asset extends Node implements IFileOrAsset, ITrackable {
  @Property()
  dxid: DxId<'file'>

  @Property()
  project: string

  @Property()
  description?: string

  @Property()
  state: FILE_STATE

  @Property({ type: 'numeric' })
  fileSize?: number

  @OneToMany(() => Tagging, (tagging) => tagging.asset, { orphanRemoval: true })
  taggings = new Collection<Tagging>(this)

  @OneToMany(() => ArchiveEntry, (archiveEntry) => archiveEntry.asset, { orphanRemoval: true })
  archiveEntries = new Collection<ArchiveEntry>(this)

  @ManyToMany(() => App, (app) => app.assets)
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

export { Asset }
