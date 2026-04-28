import { Module } from '@nestjs/common'
import { OrgMemberActionFacadeModule } from '@shared/facade/profile/org-member-action-facade.module'
import { ProfileReadFacadeModule } from '@shared/facade/profile/profile-read-facade.module'
import { ProfileUpdateFacadeModule } from '@shared/facade/profile/profile-update-facade.module'
import { ProfileController } from './profile.controller'

@Module({
  imports: [ProfileReadFacadeModule, ProfileUpdateFacadeModule, OrgMemberActionFacadeModule],
  controllers: [ProfileController],
})
export class ProfileApiModule {}
