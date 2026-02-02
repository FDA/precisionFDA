import { Collection, Entity, Enum, ManyToOne, OneToMany, Property, Ref } from '@mikro-orm/core'
import { ScopedEntity } from '@shared/database/scoped.entity'
import { Uid } from '@shared/domain/entity/domain/uid'
import { NodeProperty } from '@shared/domain/property/node-property.entity'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { User } from '@shared/domain/user/user.entity'
import { FILE_STATE, FILE_STI_TYPE, FOLDER_STATE, PARENT_TYPE } from './user-file.types'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { NodeTagging } from '@shared/domain/tagging/node-tagging.entity'

@Entity({
  abstract: true,
  discriminatorColumn: 'stiType',
  discriminatorMap: { UserFile: 'UserFile', Folder: 'Folder', Asset: 'Asset' },
  tableName: 'nodes',
  repository: () => NodeRepository,
})
export class Node extends ScopedEntity {
  @Property({ unique: true })
  uid: Uid<'file'>

  @Property()
  name: string

  @Property()
  description?: string

  @Property()
  state: FILE_STATE | FOLDER_STATE

  @Property()
  locked: boolean

  @Property({ type: 'numeric' })
  fileSize?: number

  @Property()
  project?: DxId<'project'>

  @ManyToOne(() => Node, { nullable: true })
  parentFolder: Node

  @ManyToOne(() => Node, { nullable: true })
  scopedParentFolder?: Node

  @Property()
  parentFolderId?: number

  @Property()
  scopedParentFolderId?: number

  @Enum({ fieldName: 'sti_type' })
  stiType!: FILE_STI_TYPE // [Folder, UserFile, Asset] - options

  @OneToMany({
    entity: () => NodeProperty,
    mappedBy: 'node',
    orphanRemoval: true,
  })
  properties = new Collection<NodeProperty>(this)

  @OneToMany(() => NodeTagging, (tagging) => tagging.node, {
    orphanRemoval: true,
  })
  taggings = new Collection<NodeTagging>(this)

  @Property()
  parentId: number

  @Property({ default: false })
  featured: boolean

  @Enum({ items: () => PARENT_TYPE, fieldName: 'parent_type' })
  parentType: PARENT_TYPE

  @ManyToOne({ entity: () => User, serializedName: 'userId' })
  user!: Ref<User>

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

  @Property({ hidden: true, persist: false })
  folderPath?: string
}
