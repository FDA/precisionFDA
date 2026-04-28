import { Module } from '@nestjs/common'
import { ProfileModule } from '@shared/domain/profile/profile.module'
import { UserModule } from '@shared/domain/user/user.module'
import { ProfileReadFacade } from './profile-read.facade'

@Module({
  imports: [ProfileModule, UserModule],
  providers: [ProfileReadFacade],
  exports: [ProfileReadFacade],
})
export class ProfileReadFacadeModule {}
