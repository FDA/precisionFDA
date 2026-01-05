import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { SpaceMembershipProviderModule } from '@shared/domain/space-membership/providers/space-membership-provider.module'
import { SpaceMembershipToPermissionUpdateProviderProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-to-update-permission-provider.provider'
import { SpaceMembershipUpdatePermissionToActiveProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-active.provider'
import { SpaceMembershipUpdatePermissionToAdminProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-admin.provider'
import { SpaceMembershipUpdatePermissionToContributorProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-contributor.provider'
import { SpaceMembershipUpdatePermissionToInactiveProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-inactive.provider'
import { SpaceMembershipUpdatePermissionToLeadProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-lead.provider'
import { SpaceMembershipUpdatePermissionToViewerProvider } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission-to-viewer.provider'
import { SpaceMembershipUpdatePermissionHelper } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.helper'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'

@Module({
  imports: [
    PlatformClientModule,
    MikroOrmModule.forFeature([SpaceMembership]),
    SpaceMembershipProviderModule,
  ],
  providers: [
    SpaceMembershipUpdatePermissionToLeadProvider,
    SpaceMembershipUpdatePermissionToAdminProvider,
    SpaceMembershipUpdatePermissionToContributorProvider,
    SpaceMembershipUpdatePermissionToViewerProvider,
    SpaceMembershipUpdatePermissionToActiveProvider,
    SpaceMembershipUpdatePermissionToInactiveProvider,
    SpaceMembershipToPermissionUpdateProviderProvider,
    SpaceMembershipUpdatePermissionHelper,
  ],
  exports: [
    SpaceMembershipToPermissionUpdateProviderProvider,
    SpaceMembershipUpdatePermissionHelper,
  ],
})
export class SpaceMembershipUpdatePermissionModule {}
