import {
  Entity,
  Enum,
  Ref,
  ManyToOne,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
} from '@mikro-orm/core'
import { NodeProperty } from '@shared/domain/property/node-property.entity'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { User } from '@shared/domain/user/user.entity'
import { BaseEntity } from '../../database/base-entity'
import { formatDuration } from '../../utils/format'
import { FILE_STATE, FILE_STI_TYPE, FOLDER_STATE, PARENT_TYPE } from './user-file.types'
import { SCOPE } from '../../types/common'

@Entity({
  abstract: true,
  discriminatorColumn: 'stiType',
  discriminatorMap: { UserFile: 'UserFile', Folder: 'Folder', Asset: 'Asset' },
  tableName: 'nodes',
  customRepository: () => NodeRepository,
})
export class Node extends BaseEntity {
  @PrimaryKey()
  id: number

  // This is optional because local Folders do not have dxids
  @Property()
  dxid?: string

  @Property({ unique: true })
  uid: string

  @Property()
  name: string

  @Property()
  state: FILE_STATE | FOLDER_STATE

  @Property()
  locked: boolean

  @Property()
  userId: number

  @Property({ type: 'numeric' })
  fileSize?: number

  @Property()
  scope: SCOPE

  @Property()
  createdAt: Date

  @Property()
  project?: string

  @Property()
  parentFolderId?: number

  @ManyToOne(() => Node)
  parentFolder: Node

  @Property()
  scopedParentFolderId?: number

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

  elapsedTimeSinceCreation(): number {
    return new Date().getTime() - this.createdAt.getTime()
  }

  elapsedTimeSinceCreationString(): string {
    return formatDuration(this.elapsedTimeSinceCreation())
  }
}
