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
import { User, Tagging } from '..'
import { Node } from './node.entity'
import { FILE_STATE, FILE_ORIGIN_TYPE, PARENT_TYPE, FILE_STI_TYPE } from './user-file.enum'
import { UserFileRepository } from './user-file.repository'

@Filter({ name: 'userfile', cond: { stiType: FILE_STI_TYPE.USERFILE } })
@Entity({ tableName: 'nodes', customRepository: () => UserFileRepository })
export class UserFile extends Node {
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

  @Property({ unique: true })
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
  scopedParentFolderId?: number

  // todo: micro-orm can do single table inheritance

  @ManyToOne(() => User)
  user!: IdentifiedReference<User>

  @OneToMany(() => Tagging, tagging => tagging.userFile, { orphanRemoval: true })
  taggings = new Collection<Tagging>(this);

  [EntityRepositoryType]?: UserFileRepository
  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
