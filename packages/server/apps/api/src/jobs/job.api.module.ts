import { Module } from '@nestjs/common'
import { JobModule } from '@shared/domain/job/job.module'
import { JobFacadeModule } from '@shared/facade/job/job-facade.module'
import { JobController } from './job.controller'

@Module({
  imports: [JobModule, JobFacadeModule],
  controllers: [JobController],
})
export class JobApiModule {}
