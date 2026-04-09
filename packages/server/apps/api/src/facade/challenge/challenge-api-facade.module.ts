import { Module } from '@nestjs/common'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'
import { EmailModule } from '@shared/domain/email/email.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { ChallengeFacade } from './challenge.facade'

@Module({
  imports: [ChallengeModule, SpaceModule, EmailModule, UserFileModule, PlatformClientModule],
  providers: [ChallengeFacade],
  exports: [ChallengeFacade],
})
export class ChallengeApiFacadeModule {}
