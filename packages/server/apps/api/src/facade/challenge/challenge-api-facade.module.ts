import { Module } from '@nestjs/common'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { ChallengeFacade } from './challenge.facade'
import { EmailModule } from '@shared/domain/email/email.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'

@Module({
  imports: [ChallengeModule, SpaceModule, EmailModule, UserFileModule, PlatformClientModule],
  providers: [ChallengeFacade],
  exports: [ChallengeFacade],
})
export class ChallengeApiFacadeModule {}
