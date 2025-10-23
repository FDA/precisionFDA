import {
  Collection,
  Entity,
  Filter,
  OneToMany,
  OneToOne,
  Property,
  Reference,
} from '@mikro-orm/core'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { Resource } from '@shared/domain/resource/resource.entity'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { ChallengeResource } from '../challenge/challenge-resource.entity'
import { Node } from './node.entity'
import { UserFileRepository } from './user-file.repository'
import { FILE_STATE_DX, FILE_STATE_PFDA, FILE_STI_TYPE } from './user-file.types'
import { Tagging } from '@shared/domain/tagging/tagging.entity'

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
@Entity({
  tableName: 'nodes',
  repository: () => UserFileRepository,
  discriminatorColumn: 'stiType',
  discriminatorValue: FILE_STI_TYPE.USERFILE,
})
class UserFile extends Node {
  @Property()
  dxid: DxId<'file'>

  @OneToMany({ entity: () => ChallengeResource, mappedBy: 'userFile', orphanRemoval: true })
  challengeResources = new Collection<ChallengeResource>(this)

  @OneToOne(() => Resource, (resource) => resource.userFile, { orphanRemoval: true })
  resource!: Resource

  @OneToMany(() => Tagging, (tagging) => tagging.userFile, {
    orphanRemoval: true,
  })
  taggings = new Collection<Tagging>(this)

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }

  @Property({ persist: false })
  get links(): { download: string } {
    return {
      download: `/api/files/${this.uid}/download`,
    }
  }

  isCreatedByChallengeBot(): boolean {
    return this.challengeResources.length > 0 || this.user.getEntity().isChallengeBot()
  }

  isPublishable(): boolean {
    return this.isPrivate() && this.state === FILE_STATE_DX.CLOSED
  }

  isResource(): boolean {
    return !!this.resource
  }
}

export { UserFile }
