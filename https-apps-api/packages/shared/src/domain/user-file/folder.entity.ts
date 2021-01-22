import {
  Collection,
  Entity,
  EntityRepositoryType,
  Filter,
  IdentifiedReference,
  ManyToOne,
  OneToMany,
  Property,
  Reference,
} from '@mikro-orm/core'
import { isNil } from 'ramda'
import { Tagging, User } from '..'
import { FolderRepository } from './folder.repository'
import { Node } from './node.entity'
import { FILE_STATE, FILE_STI_TYPE, FILE_TYPE, PARENT_TYPE } from './user-file.enum'

@Entity({ tableName: 'nodes', customRepository: () => FolderRepository })
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

  @OneToMany(() => Tagging, tagging => tagging.folder, { orphanRemoval: true })
  taggings = new Collection<Tagging>(this)

  // todo: could be User etc..
  // @ManyToOne()
  // parent?: IdentifiedReference<Job>

  @ManyToOne()
  parentFolder?: IdentifiedReference<Folder>

  @ManyToOne()
  user!: IdentifiedReference<User>;

  [EntityRepositoryType]?: FolderRepository

  constructor(user: User, parentFolder?: Folder) {
    super()
    this.user = Reference.create(user)
    if (!isNil(parentFolder)) {
      this.parentFolder = Reference.create(parentFolder)
    }
  }
}
