import { Provider } from '@nestjs/common'
import { SpaceMembershipUpdatePermissionProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.provider'
import { SpaceMembershipUpdatePermissionToActiveProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-active.provider'
import { SpaceMembershipUpdatePermissionToAdminProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-admin.provider'
import { SpaceMembershipUpdatePermissionToContributorProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-contributor.provider'
import { SpaceMembershipUpdatePermissionToInactiveProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-inactive.provider'
import { SpaceMembershipUpdatePermissionToLeadProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-lead.provider'
import { SpaceMembershipUpdatePermissionToViewerProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-viewer.provider'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { SpaceMembershipPermission } from '@shared/domain/space-membership/space-membership.type'

export type SpaceMembershipPermissionUpdateProviderMap = {
  [T in SpaceMembershipPermission]?: SpaceMembershipUpdatePermissionProvider
}

export const SPACE_MEMBERSHIP_PERMISSION_TO_UPDATE_PROVIDER_MAP = 'SPACE_MEMBERSHIP_PERMISSION_TO_UPDATE_PROVIDER_MAP'

export const SpaceMembershipToPermissionUpdateProviderProvider: Provider = {
  provide: SPACE_MEMBERSHIP_PERMISSION_TO_UPDATE_PROVIDER_MAP,
  inject: [
    SpaceMembershipUpdatePermissionToLeadProvider,
    SpaceMembershipUpdatePermissionToAdminProvider,
    SpaceMembershipUpdatePermissionToContributorProvider,
    SpaceMembershipUpdatePermissionToViewerProvider,
    SpaceMembershipUpdatePermissionToActiveProvider,
    SpaceMembershipUpdatePermissionToInactiveProvider,
  ],
  useFactory: (
    toLead: SpaceMembershipUpdatePermissionToLeadProvider,
    toAdmin: SpaceMembershipUpdatePermissionToAdminProvider,
    toContributor: SpaceMembershipUpdatePermissionToContributorProvider,
    toViewer: SpaceMembershipUpdatePermissionToViewerProvider,
    toActive: SpaceMembershipUpdatePermissionToActiveProvider,
    toInactive: SpaceMembershipUpdatePermissionToInactiveProvider,
  ): SpaceMembershipPermissionUpdateProviderMap => {
    return {
      [SPACE_MEMBERSHIP_ROLE.LEAD]: toLead,
      [SPACE_MEMBERSHIP_ROLE.ADMIN]: toAdmin,
      [SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR]: toContributor,
      [SPACE_MEMBERSHIP_ROLE.VIEWER]: toViewer,
      enable: toActive,
      disable: toInactive,
    }
  },
}
