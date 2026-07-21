import { propertiesToRecord } from '@shared/domain/property/property.helper'
import { Space } from '@shared/domain/space/space.entity'
import { EntityScope } from '@shared/types/common'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'
import { TimeUtils } from '@shared/utils/time.utils'
import { Node } from '../node.entity'
import { FILE_STI_TYPE } from '../user-file.types'
import { NodeDTO } from './node/node.dto'

export class FolderDTO extends NodeDTO {
  readonly stiType = FILE_STI_TYPE.FOLDER

  id: number
  name: string
  state: string | null
  scope: EntityScope
  spaceId: number | null
  featured: boolean
  createdAt: string
  createdAtDateTime: string
  path?: string
  folderId: number | null
  addedBy: string
  addedByDxUser: string
  tags: string[]
  properties: Record<string, string>
  location?: string

  static fromEntity(node: Node, space?: Space): FolderDTO {
    const dto = new FolderDTO()
    dto.id = node.id
    dto.name = node.name
    dto.state = node.state
    dto.scope = node.scope
    dto.spaceId = space?.id
    dto.featured = node.featured
    dto.createdAt = TimeUtils.formatShortDate(node.createdAt)
    dto.createdAtDateTime = TimeUtils.formatDateTimeUTC(node.createdAt)
    dto.path = node.folderPath
    dto.folderId = node.isInSpace() ? node.scopedParentFolderId : node.parentFolderId
    dto.addedBy = node.user.getEntity().fullName
    dto.addedByDxUser = node.user.getEntity().dxuser
    dto.location = EntityScopeUtils.computeLocation(node.scope, space)
    dto.tags = node.taggings.isInitialized() ? node.taggings.getItems().map(t => t.tag?.name ?? '') : []
    dto.properties = propertiesToRecord(node.properties)

    return dto
  }
}
