import { Provider } from '@nestjs/common'
import { SPACE_MEMBERSHIP_ROLE } from '../../space-membership.enum'
import { SpaceMembershipPermission } from '../../space-membership.type'
import { SpaceMembershipPlatformAccessToAdminProvider } from './space-membership-platform-access-to-admin.provider'
import { SpaceMembershipPlatformAccessToContributorProvider } from './space-membership-platform-access-to-contributor.provider'
import { SpaceMembershipPlatformAccessToInactiveProvider } from './space-membership-platform-access-to-inactive.provider'
import { SpaceMembershipPlatformAccessToViewerProvider } from './space-membership-platform-access-to-viewer.provider'
import { SpaceMembershipPlatformAccessProvider } from './space-membership-platform-access.provider'

export type SpaceMembershipPlatformAccessProviderMap = {
  [T in SpaceMembershipPermission]?: SpaceMembershipPlatformAccessProvider
}

export const SPACE_MEMBERSHIP_TO_PLATFORM_ACCESS_PROVIDER_MAP =
  'SPACE_MEMBERSHIP_TO_PLATFORM_ACCESS_PROVIDER_MAP'

export const SpaceMembershipToPlatformAccessProviderProvider: Provider = {
  provide: SPACE_MEMBERSHIP_TO_PLATFORM_ACCESS_PROVIDER_MAP,
  inject: [
    SpaceMembershipPlatformAccessToAdminProvider,
    SpaceMembershipPlatformAccessToContributorProvider,
    SpaceMembershipPlatformAccessToViewerProvider,
    SpaceMembershipPlatformAccessToInactiveProvider,
  ],
  useFactory: (
    toAdmin: SpaceMembershipPlatformAccessToAdminProvider,
    toContributor: SpaceMembershipPlatformAccessToContributorProvider,
    toViewer: SpaceMembershipPlatformAccessToViewerProvider,
    toInactive: SpaceMembershipPlatformAccessToInactiveProvider,
  ): SpaceMembershipPlatformAccessProviderMap => {
    return {
      [SPACE_MEMBERSHIP_ROLE.LEAD]: toAdmin,
      [SPACE_MEMBERSHIP_ROLE.ADMIN]: toAdmin,
      [SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR]: toContributor,
      [SPACE_MEMBERSHIP_ROLE.VIEWER]: toViewer,
      'disable': toInactive,
    }
  },
}
