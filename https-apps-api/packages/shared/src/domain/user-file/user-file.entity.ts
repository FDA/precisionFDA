import {
  Entity,
  EntityRepositoryType,
  IdentifiedReference,
  ManyToOne,
  PrimaryKey,
  Property,
  Reference,
} from '@mikro-orm/core'
import { User } from '..'
import { BaseEntity } from '../../database/base-entity'
import { FILE_STATE, FILE_TYPE, PARENT_TYPE, FILE_STI_TYPE } from './user-file.enum'
import { UserFileRepository } from './user-file.repository'

@Entity({ tableName: 'nodes', customRepository: () => UserFileRepository })
export class UserFile extends BaseEntity {
  @PrimaryKey()
  id: number

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

  @Property()
  stiType: FILE_STI_TYPE // [Folder, UserFile, Asset] - options

  @ManyToOne()
  user!: IdentifiedReference<User>;

  [EntityRepositoryType]?: UserFileRepository
  constructor(user: User) {
    super()
    this.user = Reference.create(user)
  }
}
