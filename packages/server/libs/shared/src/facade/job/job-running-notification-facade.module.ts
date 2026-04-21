import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { EntityLinkModule } from '@shared/domain/entity/entity-link/entity-link.module'
import { JobModule } from '@shared/domain/job/job.module'
import { JobRunningNotificationFacade } from './job-running-notification.facade'

@Module({
  imports: [JobModule, EmailModule, EntityLinkModule],
  providers: [JobRunningNotificationFacade],
  exports: [JobRunningNotificationFacade],
})
export class JobRunningNotificationFacadeModule {}
