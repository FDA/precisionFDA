import { Module } from '@nestjs/common'
import { JobModule } from '@shared/domain/job/job.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { JobGetFacade } from './job-get.facade'

@Module({
  imports: [JobModule, UserFileModule],
  providers: [JobGetFacade],
  exports: [JobGetFacade],
})
export class JobGetFacadeModule {}
