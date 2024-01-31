import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { DatabaseModule } from '@shared/database/database.module'
import { LoggerModule } from '@shared/logger/logger.module'
import { QueueModule } from '@shared/queue/queue.module'
import { AccountApiModule } from './account/account.api.module'
import { AdminApiModule } from './admin/admin.api.module'
import { AppApiModule } from './apps/app.api.module'
import { BullBoardModule } from './bull-board/bull-board.module'
import { ChallengeApiModule } from './challenges/challenge.api.module'
import { CliApiModule } from './cli/cli.api.module'
import { DataPortalsApiModule } from './data-portals/data-portals.api.module'
import { DbclusterApiModule } from './dbclusters/dbcluster.api.module'
import { DebugApiModule } from './debug/debug.api.module'
import { DiscussionsApiModule } from './discussions/discussions.api.module'
import { EmailApiModule } from './emails/email.api.module'
import { ExpertsApiModule } from './experts/experts.api.module'
import { FilesApiModule } from './files/files.api.module'
import { FolderApiModule } from './folders/folder.api.module'
import { JobApiModule } from './jobs/job.api.module'
import { LicenseApiModule } from './licenses/license.api.module'
import { NewsApiModule } from './news/news.api.module'
import { NodesApiModule } from './nodes/nodes.api.module'
import { NotificationsApiModule } from './notifications/notifications.api.module'
import { PropertiesApiModule } from './properties/properties.api.module'
import { BaseErrorFilter } from './server/filter/base-error.filter'
import { DefaultExceptionFilter } from './server/filter/default-exception.filter'
import { SiteSettingsApiModule } from './site-settings/site-settings.api.module'
import { SpacesApiModule } from './spaces/spaces.api.module'
import { TracksApiModule } from './tracks/tracks.api.module'
import { AlertsApiModule } from './alerts/alerts.api.module'
import { UserContextModule } from './user-context/user-context.module'
import { UsersApiModule } from './users/users.api.module'
import { WorkflowApiModule } from './workflows/workflow.api.module'

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    QueueModule,
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
    TracksApiModule,
    AlertsApiModule,
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
