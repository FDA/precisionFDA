import { Module } from '@nestjs/common'
import { ChallengeController } from './challenge.controller'

@Module({
  controllers: [ChallengeController],
})
export class ChallengeApiModule {}
