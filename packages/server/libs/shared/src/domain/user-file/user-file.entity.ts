import {
  Collection,
  Entity,
  EntityRepositoryType,
  Filter,
  OneToMany,
  OneToOne,
  Property,
  Reference,
} from '@mikro-orm/core'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Resource } from '@shared/domain/resource/resource.entity'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { ChallengeResource } from '../challenge/challenge-resource.entity'
import { Node } from './node.entity'
import { UserFileRepository } from './user-file.repository'
import {
  FILE_STATE,
  FILE_STATE_DX,
  FILE_STATE_PFDA,
  FILE_STI_TYPE,
  IFileOrAsset,
  ITrackable,
} from './user-file.types'

@Entity({
  tableName: 'nodes',
  repository: () => UserFileRepository,
  discriminatorColumn: 'stiType',
  discriminatorValue: FILE_STI_TYPE.USERFILE,
})
@Filter({ name: 'userfile', cond: { stiType: FILE_STI_TYPE.USERFILE } })
@Filter({
  name: 'unclosed',
  cond: {
    $or: [
      { state: FILE_STATE_DX.OPEN },
      { state: FILE_STATE_DX.CLOSING },
      { state: FILE_STATE_DX.ABANDONED },
      { state: FILE_STATE_PFDA.REMOVING },
    ],
  },
})
@Filter({
  name: 'accessibleBy',
  cond: (args) => ({
    $or: [
      { user: { id: args.userId }, scope: STATIC_SCOPE.PRIVATE },
      { scope: { $in: args.spaceScopes } },
    ],
  }),
})
class UserFile extends Node implements IFileOrAsset, ITrackable {
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

  @Property()
  parentFolderId?: number

  @Property()
  scopedParentFolderId?: number

  // todo: micro-orm can do single table inheritance
  @OneToMany(() => Tagging, (tagging) => tagging.userFile, { orphanRemoval: true })
  taggings = new Collection<Tagging>(this)

  @OneToMany({ entity: () => ChallengeResource, mappedBy: 'userFile', orphanRemoval: true })
  challengeResources = new Collection<ChallengeResource>(this)

  @OneToOne(() => Resource, (resource) => resource.userFile, { orphanRemoval: true })
  resource!: Resource;

  [EntityRepositoryType]?: UserFileRepository
  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }

  @Property({ persist: false })
  get links() {
    return {
      download: `/api/files/${this.uid}/download`,
    }
  }

  isCreatedByChallengeBot(): boolean {
    return this.challengeResources.length > 0 || this.user.getEntity().isChallengeBot()
  }
}

export { UserFile }
