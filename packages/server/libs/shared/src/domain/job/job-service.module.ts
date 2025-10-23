import { DynamicModule, Module } from '@nestjs/common'
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface'
import { EmailModule } from '@shared/domain/email/email.module'
import { JobService } from '@shared/domain/job/job.service'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { UserModule } from '@shared/domain/user/user.module'
import { PlatformClient } from '@shared/platform-client'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { JobLogService } from './services/job-log.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Job } from '@shared/domain/job/job.entity'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { ChallengeJobSynchronizationService } from '@shared/domain/job/services/challenge-job-synchronization.service'
import { EventModule } from '@shared/domain/event/event.module'

const imports = [
  MikroOrmModule.forFeature([Job, Space, SpaceMembership]),
  UserModule,
  PlatformClientModule,
  NotificationModule,
  UserFileModule,
  EmailModule,
  EventModule,
]

@Module({
  imports,
  providers: [
    JobService,
    JobLogService,
    JobSynchronizationService,
    ChallengeJobSynchronizationService,
  ],
  exports: [JobService, JobLogService],
})
export class JobServiceModule {
  static registerWithCustomPlatformClient(
    serviceToken: InjectionToken,
    clientToken: InjectionToken,
  ): DynamicModule {
    return {
      module: JobServiceModule,
      imports,
      providers: [
        {
          provide: PlatformClient,
          useExisting: clientToken,
        },
        {
          provide: serviceToken,
          useClass: JobService,
        },
      ],
      exports: [serviceToken],
    }
  }
}
