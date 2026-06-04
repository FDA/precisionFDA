import { Module } from '@nestjs/common'
import { AdminMembershipModule } from '@shared/domain/admin-membership/admin-membership.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { SpaceMembershipModule } from '@shared/domain/space-membership/space-membership.module'
import { UserModule } from '@shared/domain/user/user.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { CreateAdminMembershipFacade } from './create-admin-membership.facade'
import { AdminMembershipsListFacade } from './admin-memberships-list.facade'
import { RemoveAdminMembershipFacade } from './remove-admin-membership.facade'

@Module({
  imports: [AdminMembershipModule, SpaceMembershipModule, SpaceModule, UserModule, PlatformClientModule],
  providers: [AdminMembershipsListFacade, CreateAdminMembershipFacade, RemoveAdminMembershipFacade],
  exports: [AdminMembershipsListFacade, CreateAdminMembershipFacade, RemoveAdminMembershipFacade],
})
export class AdminMembershipFacadeModule {}
