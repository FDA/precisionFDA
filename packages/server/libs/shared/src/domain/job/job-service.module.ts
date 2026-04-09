import { MikroOrmModule } from '@mikro-orm/nestjs'
import { DynamicModule, Module } from '@nestjs/common'
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface'
import { EmailModule } from '@shared/domain/email/email.module'
import { EventModule } from '@shared/domain/event/event.module'
import { Job } from '@shared/domain/job/job.entity'
import { JobService } from '@shared/domain/job/job.service'
import { JobScopeFilterProvider } from '@shared/domain/job/job-scope-filter.provider'
import { JobCountService } from '@shared/domain/job/services/job-count.service'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'
import { JobWorkstationService } from '@shared/domain/job/services/job-workstation.service'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { UserModule } from '@shared/domain/user/user.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { PlatformClient } from '@shared/platform-client'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { JobLogService } from './services/job-log.service'

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
    JobCountService,
    JobScopeFilterProvider,
    JobWorkstationService,
  ],
  exports: [JobService, JobLogService, JobSynchronizationService],
})
export class JobServiceModule {
  static registerWithCustomPlatformClient(serviceToken: InjectionToken, clientToken: InjectionToken): DynamicModule {
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
