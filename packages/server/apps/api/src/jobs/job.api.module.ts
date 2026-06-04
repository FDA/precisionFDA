import { Module } from '@nestjs/common'
import { JobModule } from '@shared/domain/job/job.module'
import { JobFacadeModule } from '@shared/facade/job/job-facade.module'
import { JobGetFacadeModule } from '../facade/job/get-facade/job-get-facade.module'
import { JobsController } from './jobs.controller'

@Module({
  imports: [JobModule, JobFacadeModule, JobGetFacadeModule],
  controllers: [JobsController],
})
export class JobApiModule {}
