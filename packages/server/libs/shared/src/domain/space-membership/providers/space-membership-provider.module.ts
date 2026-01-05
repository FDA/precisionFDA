import { Module } from '@nestjs/common'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { SpaceMembershipPlatformAccessToAdminProvider } from './platform-access/space-membership-platform-access-to-admin.provider'
import { SpaceMembershipPlatformAccessToContributorProvider } from './platform-access/space-membership-platform-access-to-contributor.provider'
import { SpaceMembershipPlatformAccessToInactiveProvider } from './platform-access/space-membership-platform-access-to-inactive.provider'
import { SpaceMembershipPlatformAccessToViewerProvider } from './platform-access/space-membership-platform-access-to-viewer.provider'
import { SpaceMembershipToPlatformAccessProviderProvider } from './platform-access/space-membership-to-platform-access-provider.provider'

@Module({
  imports: [PlatformClientModule],
  providers: [
    SpaceMembershipPlatformAccessToAdminProvider,
    SpaceMembershipPlatformAccessToContributorProvider,
    SpaceMembershipPlatformAccessToViewerProvider,
    SpaceMembershipPlatformAccessToInactiveProvider,
    SpaceMembershipToPlatformAccessProviderProvider,
  ],
  exports: [
    SpaceMembershipPlatformAccessToAdminProvider,
    SpaceMembershipPlatformAccessToContributorProvider,
    SpaceMembershipPlatformAccessToViewerProvider,
    SpaceMembershipPlatformAccessToInactiveProvider,
    SpaceMembershipToPlatformAccessProviderProvider,
  ],
})
export class SpaceMembershipProviderModule {}
