import { Module } from '@nestjs/common'
import { ProfileModule } from '@shared/domain/profile/profile.module'
import { ProfileUpdateFacade } from './profile-update.facade'

@Module({
  imports: [ProfileModule],
  providers: [ProfileUpdateFacade],
  exports: [ProfileUpdateFacade],
})
export class ProfileUpdateFacadeModule {}
