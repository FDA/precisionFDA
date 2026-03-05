import { Module } from '@nestjs/common'
import { AppSeriesModule } from '@shared/domain/app-series/app-series.module'
import { AppModule } from '@shared/domain/app/app.module'
import { AuthModule } from '@shared/domain/auth/auth.module'
import { CliExchangeTokenModule } from '@shared/domain/cli-exchange-token/cli-exchange-token.module'
import { JobModule } from '@shared/domain/job/job.module'
import { LicenseModule } from '@shared/domain/license/license.module'
import { SpaceMembershipModule } from '@shared/domain/space-membership/space-membership.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { AppCreateFacade } from './app-create.facade'
import { AppRunFacade } from './app-run.facade'

@Module({
  imports: [
    AppModule,
    AppSeriesModule,
    JobModule,
    AuthModule,
    LicenseModule,
    SpaceMembershipModule,
    UserFileModule,
    PlatformClientModule,
    CliExchangeTokenModule,
  ],
  providers: [AppRunFacade, AppCreateFacade],
  exports: [AppRunFacade, AppCreateFacade],
})
export class AppFacadeModule {}
