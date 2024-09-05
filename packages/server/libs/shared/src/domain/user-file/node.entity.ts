import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Ref,
} from '@mikro-orm/core'
import { Uid } from '@shared/domain/entity/domain/uid'
import { NodeProperty } from '@shared/domain/property/node-property.entity'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base-entity'
import { EntityScope } from '../../types/common'
import { DxId } from '../entity/domain/dxid'
import { Tagging } from '../tagging/tagging.entity'
import { FILE_STATE, FILE_STI_TYPE, FOLDER_STATE, PARENT_TYPE } from './user-file.types'

@Entity({
  abstract: true,
  discriminatorColumn: 'stiType',
  discriminatorMap: { UserFile: 'UserFile', Folder: 'Folder', Asset: 'Asset' },
  tableName: 'nodes',
  repository: () => NodeRepository,
})
export class Node extends BaseEntity {
  @PrimaryKey()
  id: number

  // This is optional because local Folders do not have dxids
  @Property()
  dxid?: DxId<'file'>

  @Property({ unique: true })
  uid: Uid<'file'>

  @Property()
  name: string

  @Property()
  state: FILE_STATE | FOLDER_STATE

  @Property()
  locked: boolean

  @Property({ type: 'numeric' })
  fileSize?: number

  @Property()
  scope: EntityScope

  @Property()
  createdAt: Date

  @Property()
  project?: string

  @ManyToOne(() => Node)
  parentFolder: Node

  @ManyToOne(() => Node)
  scopedParentFolder?: Node

  @Enum({ fieldName: 'sti_type' })
  stiType!: FILE_STI_TYPE // [Folder, UserFile, Asset] - options

  @OneToMany({
    entity: () => NodeProperty,
    mappedBy: 'node',
    orphanRemoval: true,
  })
  properties = new Collection<NodeProperty>(this)

  @Property()
  parentId: number

  @Property()
  parentType: PARENT_TYPE

  @Property({ persist: false })
  get isAsset(): boolean {
    return this.stiType === FILE_STI_TYPE.ASSET
  }

  @Property({ persist: false })
  get isFile(): boolean {
    return this.stiType === FILE_STI_TYPE.USERFILE
  }

  @Property({ persist: false })
  get isFolder(): boolean {
    return this.stiType === FILE_STI_TYPE.FOLDER
  }

  @ManyToOne(() => User)
  user!: Ref<User>

  @Property({ hidden: true, persist: false })
  folderPath?: string

  @OneToMany(() => Tagging, (tagging) => tagging.folder || tagging.asset || tagging.userFile, {
    orphanRemoval: true,
  })
  taggings = new Collection<Tagging>(this)
}
