import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Job } from '@shared/domain/job/job.entity'
import { JobServiceModule } from '@shared/domain/job/job-service.module'
import { JOB_SERVICE_WITH_CHALLENGE_BOT_CLIENT } from '@shared/domain/job/job-service.provider'
import { CHALLENGE_BOT_PLATFORM_CLIENT } from '@shared/platform-client/providers/platform-client.provider'

@Module({
  imports: [
    JobServiceModule,
    JobServiceModule.registerWithCustomPlatformClient(
      JOB_SERVICE_WITH_CHALLENGE_BOT_CLIENT,
      CHALLENGE_BOT_PLATFORM_CLIENT,
    ),
    MikroOrmModule.forFeature([Job]),
  ],
  exports: [JobServiceModule, MikroOrmModule],
})
export class JobModule {}
