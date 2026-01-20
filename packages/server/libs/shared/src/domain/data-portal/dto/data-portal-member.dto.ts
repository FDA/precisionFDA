import { DATA_PORTAL_MEMBER_ROLE } from '@shared/domain/data-portal/data-portal.enum'
import { spaceMembershipRoleToDataPortalMemberRoleSMap } from '@shared/domain/data-portal/space-membership-role-to-data-portal-member-role.map'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'

export class DataPortalMemberDTO {
  dxuser: string
  role: DATA_PORTAL_MEMBER_ROLE

  static fromEntity(member: SpaceMembership): DataPortalMemberDTO {
    const dto = new DataPortalMemberDTO()
    dto.dxuser = member.user.getEntity().dxuser
    dto.role = spaceMembershipRoleToDataPortalMemberRoleSMap[member.role]
    return dto
  }
}
