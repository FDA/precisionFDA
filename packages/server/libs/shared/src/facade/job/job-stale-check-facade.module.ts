import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { EntityLinkModule } from '@shared/domain/entity/entity-link/entity-link.module'
import { JobModule } from '@shared/domain/job/job.module'
import { JobStaleCheckFacade } from './job-stale-check.facade'

@Module({
  imports: [JobModule, EmailModule, EntityLinkModule],
  providers: [JobStaleCheckFacade],
  exports: [JobStaleCheckFacade],
})
export class JobStaleCheckFacadeModule {}
