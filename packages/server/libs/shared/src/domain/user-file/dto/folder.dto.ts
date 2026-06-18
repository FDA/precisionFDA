import { Space } from '@shared/domain/space/space.entity'
import { EntityScope } from '@shared/types/common'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'
import { Node } from '../node.entity'
import { FILE_STI_TYPE } from '../user-file.types'
import { NodeDTO } from './node/node.dto'

export class FolderDTO extends NodeDTO {
  readonly stiType = FILE_STI_TYPE.FOLDER

  id: number
  name: string
  scope: EntityScope
  featured: boolean
  createdAt: Date
  createdAtDateTime: string
  path?: string
  folderId: number | null
  addedBy: string
  addedByDxUser: string
  location?: string

  static fromEntity(node: Node, space?: Space): FolderDTO {
    const dto = new FolderDTO()
    dto.id = node.id
    dto.name = node.name
    dto.scope = node.scope
    dto.featured = node.featured
    dto.createdAt = node.createdAt
    dto.createdAtDateTime = node.createdAt.toISOString()
    dto.path = node.folderPath
    dto.folderId = node.isInSpace() ? node.scopedParentFolderId : node.parentFolderId
    dto.addedBy = node.user.getEntity().fullName
    dto.addedByDxUser = node.user.getEntity().dxuser
    dto.location = EntityScopeUtils.computeLocation(node.scope, space)

    return dto
  }
}
