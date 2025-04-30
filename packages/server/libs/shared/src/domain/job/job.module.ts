import { Module } from '@nestjs/common'
import { JobServiceModule } from '@shared/domain/job/job-service.module'
import { JOB_SERVICE_WITH_CHALLENGE_BOT_CLIENT } from '@shared/domain/job/job-service.provider'
import { CHALLENGE_BOT_PLATFORM_CLIENT } from '@shared/platform-client/providers/platform-client.provider'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Job } from '@shared/domain/job/job.entity'

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
