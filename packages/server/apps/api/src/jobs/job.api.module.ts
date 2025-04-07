import { Module } from '@nestjs/common'
import { JobController } from './job.controller'
import { JobModule } from '@shared/domain/job/job.module'

@Module({
  imports: [JobModule],
  controllers: [JobController],
})
export class JobApiModule {}
