import {
  Entity,
  Enum,
  IdentifiedReference,
  ManyToOne,
  PrimaryKey,
  Property,
  Collection,
  OneToMany,
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { User } from '../user/user.entity'
import {FILE_STATE, FILE_STI_TYPE, FOLDER_STATE} from './user-file.types'

@Entity({
  abstract: true,
  discriminatorColumn: 'stiType',
  discriminatorMap: {UserFile: 'UserFile', Folder: 'Folder', Asset: 'Asset'},
  tableName: 'nodes',
})
export class Node extends BaseEntity {
  @PrimaryKey()
  id: number

  // This is optional because local Folders do not have dxids
  @Property()
  dxid?: string

  @Property({unique: true})
  uid: string

  @Property()
  name: string

  @Property()
  state: FILE_STATE | FOLDER_STATE

  @Property()
  locked: boolean

  @Property()
  userId: number

  @Property()
  scope: string

  @Property()
  createdAt: Date

  @ManyToOne(() => Node)
  parentFolder: Node

  @ManyToOne(() => Node)
  scopedParentFolder?: Node

  @Enum({fieldName: 'sti_type'})
  stiType!: FILE_STI_TYPE // [Folder, UserFile, Asset] - options

  @Property({persist: false})
  get isAsset(): boolean {
    return this.stiType === FILE_STI_TYPE.ASSET
  }

  @Property({persist: false})
  get isFile(): boolean {
    return this.stiType === FILE_STI_TYPE.USERFILE
  }

  @Property({persist: false})
  get isFolder(): boolean {
    return this.stiType === FILE_STI_TYPE.FOLDER
  }

  @ManyToOne(() => User)
  user!: IdentifiedReference<User>
}
