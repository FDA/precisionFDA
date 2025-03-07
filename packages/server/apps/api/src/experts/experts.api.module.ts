import { Module } from '@nestjs/common'
import { ExpertsController } from './experts.controller'
import { ExpertModule } from '@shared/domain/expert/expert.module'

@Module({
  imports: [ExpertModule],
  controllers: [ExpertsController],
})
export class ExpertsApiModule {}
