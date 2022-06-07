import {
  Collection,
  Entity,
  IdentifiedReference,
  ManyToOne,
  OneToMany,
  Property,
  Reference,
} from '@mikro-orm/core'
import { Tagging, User } from '..'
import { Node } from './node.entity'
import { FILE_ORIGIN_TYPE, FILE_STATE, PARENT_TYPE } from './user-file.enum'

@Entity({ tableName: 'nodes' })
export class Asset extends Node {
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
  scopedParentFolderId?: number

  @ManyToOne(() => User)
  user!: IdentifiedReference<User>

  @OneToMany(() => Tagging, tagging => tagging.asset, { orphanRemoval: true })
  taggings = new Collection<Tagging>(this)

  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
