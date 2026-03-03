import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { SpaceMembershipCountFilterProvider } from '@shared/domain/space-membership/service/space-membership-count-filter.provider'
import { SpaceMembershipCountService } from '@shared/domain/space-membership/service/space-membership-count.service'
import { SpaceMembershipUpdatePermissionModule } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { SpaceMembershipProviderModule } from './providers/space-membership-provider.module'
import { SpaceMembershipService } from './service/space-membership.service'
import { SpaceMembership } from './space-membership.entity'

@Module({
  imports: [
    MikroOrmModule.forFeature([SpaceMembership]),
    SpaceMembershipProviderModule,
    SpaceMembershipUpdatePermissionModule,
    PlatformClientModule,
  ],
  providers: [SpaceMembershipService, SpaceMembershipCountService, SpaceMembershipCountFilterProvider],
  exports: [MikroOrmModule, SpaceMembershipService],
})
export class SpaceMembershipModule {}
