import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { DatabaseModule, LoggerModule } from '@shared'
import { AccountApiModule } from './account'
import { AdminApiModule } from './admin'
import { AppApiModule } from './apps'
import { BullBoardModule } from './bull-board/bull-board.module'
import { ChallengeApiModule } from './challenges'
import { CliApiModule } from './cli'
import { DataPortalsApiModule } from './data-portals'
import { DbclusterApiModule } from './dbclusters'
import { DebugApiModule } from './debug'
import { DiscussionsApiModule } from './discussions'
import { EmailApiModule } from './emails'
import { ExpertsApiModule } from './experts'
import { FilesApiModule } from './files'
import { FolderApiModule } from './folders'
import { JobApiModule } from './jobs'
import { LicenseApiModule } from './licenses'
import { NewsApiModule } from './news'
import { NodesApiModule } from './nodes'
import { NotificationsApiModule } from './notifications'
import { PropertiesApiModule } from './properties'
import { BaseErrorFilter } from './server/filter/base-error.filter'
import { DefaultExceptionFilter } from './server/filter/default-exception.filter'
import { SiteSettingsApiModule } from './site-settings'
import { SpacesApiModule } from './spaces'
import { UserContextModule } from './user-context/user-context.module'
import { UsersApiModule } from './users'
import { WorkflowApiModule } from './workflows'

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    UserContextModule,
    BullBoardModule,
    AccountApiModule,
    AdminApiModule,
    AppApiModule,
    ChallengeApiModule,
    CliApiModule,
    DataPortalsApiModule,
    DbclusterApiModule,
    DebugApiModule,
    DiscussionsApiModule,
    EmailApiModule,
    ExpertsApiModule,
    FilesApiModule,
    FolderApiModule,
    JobApiModule,
    LicenseApiModule,
    NewsApiModule,
    NodesApiModule,
    NotificationsApiModule,
    PropertiesApiModule,
    SiteSettingsApiModule,
    SpacesApiModule,
    UsersApiModule,
    WorkflowApiModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DefaultExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: BaseErrorFilter,
    },
  ],
})
export class ApiModule {}
