import type { Organization } from '../../org/organization.entity'

export class ProfileOrganizationDTO {
  id: number
  handle: string
  name: string
  adminId: number
  adminFullName: string

  static fromEntity(org: Organization): ProfileOrganizationDTO {
    const admin = org.admin?.getEntity()

    const dto = new ProfileOrganizationDTO()
    dto.id = org.id
    dto.handle = org.handle
    dto.name = org.name
    dto.adminId = admin?.id ?? 0
    dto.adminFullName = admin ? `${admin.firstName} ${admin.lastName}` : ''
    return dto
  }
}
