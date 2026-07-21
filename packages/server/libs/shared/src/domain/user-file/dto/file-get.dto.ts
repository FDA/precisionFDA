import { License } from '@shared/domain/license/license.entity'
import { propertiesToRecord } from '@shared/domain/property/property.helper'
import { Space } from '@shared/domain/space/space.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'
import { humanizeFileSize } from '@shared/utils/format'
import { TimeUtils } from '@shared/utils/time.utils'
import { FILE_STI_TYPE } from '../user-file.types'
import { NodeDTO } from './node/node.dto'

interface FileOriginDTO {
  text: string
  href?: string
}

interface FileLicenseDTO {
  id: number
  uid: string
  title: string
  approvalRequired: boolean
  acceptanceStatus: string | null
}

interface OriginObjectDTO {
  originType: string | null
  originUid: string | null
}

interface PathEntry {
  id: number
  name: string
}

interface FileGetDTOMapOptions {
  file: UserFile
  license: License | null
  licenseAcceptanceStatus: string | null
  folderPath: PathEntry[]
  origin: FileOriginDTO | string | null
  originParentType: string | null
  originParentUid: string | null
  space: Space | null
}

export class FileGetDTO extends NodeDTO {
  readonly stiType = FILE_STI_TYPE.USERFILE

  id: number
  uid: string
  name: string
  type: string
  state: string | null
  scope: string
  spaceId: number | null
  location: string
  addedBy: string
  addedByDxuser: string
  createdAt: string
  createdAtDateTime: string
  featured: boolean
  locked: boolean
  description: string | null
  fileSize: string
  resource: boolean
  origin: FileOriginDTO | string | null
  originObject: OriginObjectDTO
  tags: string[]
  properties: Record<string, string>
  fileLicense: FileLicenseDTO | null
  folderPath: PathEntry[]

  static mapToDTO({
    file,
    license,
    licenseAcceptanceStatus,
    folderPath,
    origin,
    originParentType,
    originParentUid,
    space,
  }: FileGetDTOMapOptions): FileGetDTO {
    const dto = new FileGetDTO()
    const user = file.user.getEntity()

    dto.id = file.id
    dto.uid = file.uid
    dto.name = file.name
    dto.type = file.stiType
    dto.state = file.state
    dto.scope = file.scope
    dto.spaceId = space?.id
    dto.location = EntityScopeUtils.computeLocation(file.scope, space)
    dto.addedBy = user.fullName
    dto.addedByDxuser = user.dxuser
    dto.createdAt = TimeUtils.formatShortDate(file.createdAt)
    dto.createdAtDateTime = TimeUtils.formatDateTimeUTC(file.createdAt)
    dto.featured = file.featured
    dto.locked = file.locked
    dto.description = file.description ?? null
    dto.fileSize = humanizeFileSize(file.fileSize)
    dto.resource = file.isResource()
    dto.origin = origin
    dto.originObject = { originType: originParentType, originUid: originParentUid }
    dto.tags = file.taggings.isInitialized() ? file.taggings.getItems().map(t => t.tag?.name ?? '') : []
    dto.properties = propertiesToRecord(file.properties)
    dto.fileLicense = license
      ? {
          id: license.id,
          uid: `license-${license.id}`,
          title: license.title,
          approvalRequired: license.approvalRequired,
          acceptanceStatus: licenseAcceptanceStatus,
        }
      : null
    dto.folderPath = folderPath

    return dto
  }
}
