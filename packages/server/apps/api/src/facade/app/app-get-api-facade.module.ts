import { Module } from '@nestjs/common'
import { AppModule } from '@shared/domain/app/app.module'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'
import { JobModule } from '@shared/domain/job/job.module'
import { SettingModule } from '@shared/domain/setting/setting.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { AppGetFacade } from './app-get.facade'

@Module({
  imports: [AppModule, SpaceModule, JobModule, SettingModule, ChallengeModule],
  providers: [AppGetFacade],
  exports: [AppGetFacade],
})
export class AppGetApiFacadeModule {}
