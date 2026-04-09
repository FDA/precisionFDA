import { Module } from '@nestjs/common'
import { ExpertModule } from '@shared/domain/expert/expert.module'
import { ExpertsController } from './experts.controller'

@Module({
  imports: [ExpertModule],
  controllers: [ExpertsController],
})
export class ExpertsApiModule {}
