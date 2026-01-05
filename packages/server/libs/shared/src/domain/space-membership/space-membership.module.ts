import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { SpaceMembershipProviderModule } from './providers/space-membership-provider.module'
import { SpaceMembershipService } from './service/space-membership.service'
import { SpaceMembership } from './space-membership.entity'
import { SpaceMembershipUpdatePermissionModule } from '@shared/domain/space-membership/service/update-permission/space-membership-update-permission.module'

@Module({
  imports: [
    MikroOrmModule.forFeature([SpaceMembership]),
    SpaceMembershipProviderModule,
    SpaceMembershipUpdatePermissionModule,
    PlatformClientModule,
  ],
  providers: [SpaceMembershipService],
  exports: [MikroOrmModule, SpaceMembershipService],
})
export class SpaceMembershipModule {}
