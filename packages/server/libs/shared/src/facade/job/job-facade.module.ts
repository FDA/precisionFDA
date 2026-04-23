import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { EntityLinkModule } from '@shared/domain/entity/entity-link/entity-link.module'
import { JobModule } from '@shared/domain/job/job.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { JobSyncTaskCheckFacade } from '@shared/facade/job/job-sync-task-check.facade'
import { JobWorkstationFacade } from '@shared/facade/job/job-workstation.facade'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { JobStaleCheckFacade } from './job-stale-check.facade'

@Module({
  imports: [JobModule, EmailModule, EntityLinkModule, UserFileModule, NotificationModule, PlatformClientModule],
  providers: [JobStaleCheckFacade, JobSyncTaskCheckFacade, JobWorkstationFacade],
  exports: [JobStaleCheckFacade, JobSyncTaskCheckFacade, JobWorkstationFacade],
})
export class JobFacadeModule {}
