import {
  Collection,
  Entity,
  EntityRepositoryType,
  Filter,
  IdentifiedReference, ManyToMany,
  ManyToOne,
  OneToMany,
  Property,
  Reference,
} from '@mikro-orm/core'
import { User, Tagging, Job } from '..'
import { ChallengeResource } from '../challenge/challenge-resource.entity'
import { Node } from './node.entity'
import {
  FILE_STATE,
  FILE_ORIGIN_TYPE,
  PARENT_TYPE,
  FILE_STI_TYPE,
  ITrackable,
  IFileOrAsset,
  FILE_STATE_DX,
  FILE_STATE_PFDA,
} from './user-file.types'
import { UserFileRepository } from './user-file.repository'

@Entity({ tableName: 'nodes', customRepository: () => UserFileRepository })
@Filter({ name: 'userfile', cond: { stiType: FILE_STI_TYPE.USERFILE } })
@Filter({ name: 'https', cond: { entityType: FILE_ORIGIN_TYPE.HTTPS } })
@Filter({ name: 'local', cond: { entityType: FILE_ORIGIN_TYPE.REGULAR } })
@Filter({ name: 'unclosed', cond: { $or: [
  { 'state': FILE_STATE_DX.OPEN },
  { 'state': FILE_STATE_DX.CLOSING },
  { 'state': FILE_STATE_DX.ABANDONED },
  { 'state': FILE_STATE_PFDA.REMOVING },
]}})
class UserFile extends Node implements IFileOrAsset, ITrackable {
  @Property()
  dxid: string

  @Property()
  project: string

  @Property()
  description?: string

  @Property()
  //@ts-ignore IFileOrAsset introduced state as string
  state: FILE_STATE

  @Property()
  entityType: FILE_ORIGIN_TYPE

  @Property({ type: 'numeric' })
  fileSize?: number

  // unused FK references
  // resolves into User/Job/Asset and other entities in PFDA
  @Property()
  parentId: number

  @Property()
  parentType: PARENT_TYPE

  @Property()
  parentFolderId?: number

  @Property()
  scopedParentFolderId?: number

  // todo: micro-orm can do single table inheritance

  @ManyToOne(() => User)
  user!: IdentifiedReference<User>

  @OneToMany(() => Tagging, tagging => tagging.userFile, { orphanRemoval: true })
  taggings = new Collection<Tagging>(this);

  @OneToMany({ entity: () => ChallengeResource, mappedBy: 'userFile', orphanRemoval: true })
  challengeResources = new Collection<ChallengeResource>(this);

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

export {
  UserFile,
}
