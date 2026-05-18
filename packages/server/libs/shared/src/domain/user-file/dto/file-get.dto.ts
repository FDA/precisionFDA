import { License } from '@shared/domain/license/license.entity'
import { Space } from '@shared/domain/space/space.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { humanizeFileSize } from '@shared/utils/format'
import { TimeUtils } from '@shared/utils/time.utils'

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

export class FileGetDTO {
  id: number
  uid: string
  name: string
  type: string
  state: string | null
  scope: string
  spaceId: string | null
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
    dto.spaceId = file.isInSpace() ? file.scope : null
    dto.location = computeLocation(file, space)
    dto.addedBy = user.fullName
    dto.addedByDxuser = user.dxuser
    dto.createdAt = TimeUtils.formatShortDate(file.createdAt)
    dto.createdAtDateTime = TimeUtils.formatAtTime(file.createdAt)
    dto.featured = file.featured
    dto.locked = file.locked
    dto.description = file.description ?? null
    dto.fileSize = humanizeFileSize(file.fileSize)
    dto.resource = file.isResource()
    dto.origin = origin
    dto.originObject = { originType: originParentType, originUid: originParentUid }
    dto.tags = file.taggings.isInitialized() ? file.taggings.getItems().map(t => t.tag?.name ?? '') : []
    dto.properties = buildProperties(file)
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

function buildProperties(file: UserFile): Record<string, string> {
  const props: Record<string, string> = {}
  if (file.properties.isInitialized()) {
    for (const prop of file.properties.getItems()) {
      props[prop.propertyName] = prop.propertyValue
    }
  }
  return props
}

function computeLocation(file: UserFile, space: Space | null): string {
  if (!file.isInSpace()) {
    return file.scope === 'public' ? 'Public' : 'Private'
  }
  if (space) {
    const suffix = space.isConfidential() ? 'Private' : 'Shared'
    return `${space.name} - ${suffix}`
  }
  return 'Space'
}
