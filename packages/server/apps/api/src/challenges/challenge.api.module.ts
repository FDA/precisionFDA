import { Module } from '@nestjs/common'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'
import { ChallengeApiFacadeModule } from '../facade/challenge/challenge-api-facade.module'
import { ChallengesController } from './challenges.controller'

@Module({
  imports: [ChallengeModule, ChallengeApiFacadeModule],
  controllers: [ChallengesController],
})
export class ChallengeApiModule {}
