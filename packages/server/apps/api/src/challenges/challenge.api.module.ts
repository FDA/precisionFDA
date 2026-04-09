import { Module } from '@nestjs/common'
import { ChallengeModule } from '@shared/domain/challenge/challenge.module'
import { ChallengeApiFacadeModule } from '../facade/challenge/challenge-api-facade.module'
import { ChallengeController } from './challenge.controller'

@Module({
  imports: [ChallengeModule, ChallengeApiFacadeModule],
  controllers: [ChallengeController],
})
export class ChallengeApiModule {}
