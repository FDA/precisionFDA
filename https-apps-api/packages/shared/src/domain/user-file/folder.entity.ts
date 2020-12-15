import {
  Entity,
  EntityRepositoryType,
  Filter,
  IdentifiedReference,
  ManyToOne,
  Property,
  Reference,
} from '@mikro-orm/core'
import { User } from '..'
import { Node } from './node.entity'
import { FILE_STATE, FILE_STI_TYPE, FILE_TYPE, PARENT_TYPE } from './user-file.enum'

@Entity({ tableName: 'nodes' })
@Filter({ name: 'folder', cond: { stiType: FILE_STI_TYPE.FOLDER } })
export class Folder extends Node {
  @Property()
  project: string

  @Property()
  name: string

  @Property()
  description?: string

  @Property()
  state: FILE_STATE

  @Property()
  entityType: FILE_TYPE

  @Property()
  uid: string

  @Property()
  scope: string

  @Property({ type: 'bigint' })
  fileSize: number

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

  @ManyToOne()
  user!: IdentifiedReference<User>;

  [EntityRepositoryType]?: UserFileRepository
  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
