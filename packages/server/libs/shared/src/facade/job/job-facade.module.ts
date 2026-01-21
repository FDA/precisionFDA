import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { EntityLinkModule } from '@shared/domain/entity/entity-link/entity-link.module'
import { JobModule } from '@shared/domain/job/job.module'
import { JobSyncTaskCheckFacade } from '@shared/facade/job/job-sync-task-check.facade'
import { JobStaleCheckFacade } from './job-stale-check.facade'

@Module({
  imports: [JobModule, EmailModule, EntityLinkModule],
  providers: [JobStaleCheckFacade, JobSyncTaskCheckFacade],
  exports: [JobStaleCheckFacade, JobSyncTaskCheckFacade],
})
export class JobFacadeModule {}
