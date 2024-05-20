import { SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'

export const spaceMembershipSideToNameMap: Record<SPACE_MEMBERSHIP_SIDE, string> = {
  [SPACE_MEMBERSHIP_SIDE.HOST]: 'Reviewer',
  [SPACE_MEMBERSHIP_SIDE.GUEST]: 'Sponsor',
}
