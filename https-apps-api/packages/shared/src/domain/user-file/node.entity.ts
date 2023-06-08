import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property
} from '@mikro-orm/core'
import {BaseEntity} from '../../database/base-entity'
import {FILE_STI_TYPE} from './user-file.types'


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

  // todo: more
}
