import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core'
import { BaseEntity } from '../../database/base-entity'
import { FILE_STI_TYPE } from './user-file.enum'

@Entity({
  abstract: true,
  discriminatorColumn: 'stiType',
  discriminatorMap: { UserFile: 'UserFile', Folder: 'Folder', Asset: 'Asset' },
  tableName: 'nodes',
})
export class Node extends BaseEntity {
  @PrimaryKey()
  id: number

  @Property()
  dxid?: string

  @Property({ unique: true })
  uid: string

  @Enum({ fieldName: 'sti_type' })
  stiType!: FILE_STI_TYPE // [Folder, UserFile, Asset] - options

  // todo: more
}
