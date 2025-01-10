import { Module } from '@nestjs/common'
import { ChallengeController } from './challenge.controller'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'
import { ChallengeApiFacadeModule } from '../facade/challenge/challenge-api-facade.module'

@Module({
  imports: [ChallengeModule, ChallengeApiFacadeModule],
  controllers: [ChallengeController],
})
export class ChallengeApiModule {}
