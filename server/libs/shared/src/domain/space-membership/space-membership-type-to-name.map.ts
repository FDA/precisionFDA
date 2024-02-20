import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'

export const spaceMembershipTypeToNameMap: Record<SPACE_MEMBERSHIP_ROLE, string> = {
  [SPACE_MEMBERSHIP_ROLE.ADMIN]: 'Admin',
  [SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR]: 'Contributor',
  [SPACE_MEMBERSHIP_ROLE.LEAD]: 'Lead',
  [SPACE_MEMBERSHIP_ROLE.VIEWER]: 'Viewer',
}
