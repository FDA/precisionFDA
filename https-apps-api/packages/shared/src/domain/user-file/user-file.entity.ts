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
import { User, Tagging, Folder } from '..'
import { Node } from './node.entity'
import { FILE_STATE, FILE_TYPE, PARENT_TYPE, FILE_STI_TYPE } from './user-file.enum'
import { UserFileRepository } from './user-file.repository'

@Filter({ name: 'userfile', cond: { stiType: FILE_STI_TYPE.USERFILE } })
@Entity({ tableName: 'nodes', customRepository: () => UserFileRepository })
export class UserFile extends Node {
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
  user!: IdentifiedReference<User>

  @ManyToOne()
  parentFolder?: IdentifiedReference<Folder>

  // todo: could be User etc..
  // @ManyToOne()
  // parent?: IdentifiedReference<Job>

  @OneToMany(() => Tagging, tagging => tagging.userFile, { orphanRemoval: true })
  taggings = new Collection<Tagging>(this);

  [EntityRepositoryType]?: UserFileRepository
  constructor(user: User, parentFolder?: Folder) {
    super()
    this.user = Reference.create(user)
    if (!isNil(parentFolder)) {
      this.parentFolder = Reference.create(parentFolder)
    }
  }
}
