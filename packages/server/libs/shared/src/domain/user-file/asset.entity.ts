import { Collection, Entity, ManyToMany, OneToMany, Property } from '@mikro-orm/core'
import { App } from '@shared/domain/app/app.entity'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { User } from '@shared/domain/user/user.entity'
import { ArchiveEntry } from '@shared/domain/user-file/archive-entry.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { AssetRepository } from './asset.repository'
import { FILE_STATE_DX, FILE_STI_TYPE } from './user-file.types'

@Entity({
  tableName: 'nodes',
  repository: () => AssetRepository,
  discriminatorColumn: 'stiType',
  discriminatorValue: FILE_STI_TYPE.ASSET,
})
class Asset extends UserFile {
  @Property()
  dxid: DxId<'file'>

  @OneToMany(
    () => ArchiveEntry,
    archiveEntry => archiveEntry.asset,
    { orphanRemoval: true },
  )
  archiveEntries = new Collection<ArchiveEntry>(this)

  @ManyToMany(
    () => App,
    app => app.assets,
  )
  apps = new Collection<App>(this)

  constructor(user: User) {
    super(user)
  }

  isCreatedByChallengeBot(): boolean {
    // Challenge resources are always files, see create_challenge_resource in api_controller.rb
    return false
  }

  isPublishable(): boolean {
    return this.isPrivate() && this.state === FILE_STATE_DX.CLOSED
  }
}

export { Asset }
