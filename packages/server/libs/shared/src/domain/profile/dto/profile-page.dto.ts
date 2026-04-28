import type { User } from '../../user/user.entity'
import { ProfileOrganizationDTO } from './profile-organization.dto'
import { ProfileUserDTO } from './profile-user.dto'
import { ProfileViewDTO } from './profile-view.dto'

/**
 * Full profile page response including user and organization data
 */
export class ProfilePageDTO {
  user: ProfileUserDTO
  profile: ProfileViewDTO
  organization: ProfileOrganizationDTO | null

  static fromEntity(user: User, profile: ProfileViewDTO): ProfilePageDTO {
    const org = user.organization.getEntity()
    const isSingular = org.singular
    const isOrgAdmin = !isSingular && org.admin?.id === user.id

    const dto = new ProfilePageDTO()
    dto.user = ProfileUserDTO.fromEntity(user, isSingular, isOrgAdmin)
    dto.profile = profile
    dto.organization = isSingular ? null : ProfileOrganizationDTO.fromEntity(org)

    return dto
  }
}
