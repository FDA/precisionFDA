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

const imports = [UserModule, PlatformClientModule, NotificationModule, UserFileModule, EmailModule]

@Module({
  imports,
  providers: [JobService, JobLogService],
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
