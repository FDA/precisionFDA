import { Uid } from '@shared/domain/entity/domain/uid'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'

export class CliNodeDTO {
  id: number
  uid: Uid<'file'> | undefined // undefined for folders
  type: FILE_STI_TYPE
  name: string
  fileSize: number // 0 for folders
  createdAt: Date
  children: number // 0 for files

  static fromEntity(node: UserFile | Folder): CliNodeDTO {
    return {
      id: node.id,
      uid: node.uid,
      type: node.stiType,
      name: node.name,
      fileSize: node.fileSize,
      createdAt: node.createdAt,
      children: node.stiType === 'Folder' ? (node as Folder).children.length : 0,
    }
  }
}
