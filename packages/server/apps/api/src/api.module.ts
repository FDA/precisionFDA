import { MiddlewareConsumer, Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { DevtoolsModule } from '@nestjs/devtools-integration'
import { config } from '@shared/config'
import { DatabaseModule } from '@shared/database/database.module'
import { UserContextModule } from '@shared/domain/user-context/user-context.module'
import { LoggerModule } from '@shared/logger/logger.module'
import { QueueModule } from '@shared/queue/queue.module'
import { AccountApiModule } from './account/account.api.module'
import { AdminApiModule } from './admin/admin.api.module'
import { AlertsApiModule } from './alerts/alerts.api.module'
import { AppApiModule } from './apps/app.api.module'
import { ChallengeApiModule } from './challenges/challenge.api.module'
import { CliApiModule } from './cli/cli.api.module'
import { DataPortalsApiModule } from './data-portals/data-portals.api.module'
import { DbClusterApiModule } from './dbclusters/dbcluster.api.module'
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
import { ReportsApiModule } from './reports/reports.api.module'
import { ResourcesApiModule } from './resources/resources.api.module'
import { BaseErrorExceptionFilter } from './server/filter/base-error-exception.filter'
import { DefaultExceptionFilter } from './server/filter/default-exception.filter'
import { HttpExceptionFilter } from './server/filter/http-exception.filter'
import { SiteSettingsApiModule } from './site-settings/site-settings.api.module'
import { SpacesApiModule } from './spaces/spaces.api.module'
import { TracksApiModule } from './tracks/tracks.api.module'
import { UserContextMiddleware } from './user-context/middleware/user-context.middleware'
import { UsersApiModule } from './users/users.api.module'
import { WebsocketModule } from './websocket/websocket.module'
import { WorkflowApiModule } from './workflows/workflow.api.module'

@Module({
  imports: [
    DevtoolsModule.register({
      http: config.nestjsDevtoolsEnabled,
      port: 8000,
    }),
    DatabaseModule,
    LoggerModule,
    QueueModule,
    UserContextModule,
    WebsocketModule,
    AccountApiModule,
    AdminApiModule,
    AppApiModule,
    ChallengeApiModule,
    CliApiModule,
    DataPortalsApiModule,
    DbClusterApiModule,
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
    ResourcesApiModule,
    SiteSettingsApiModule,
    SpacesApiModule,
    TracksApiModule,
    AlertsApiModule,
    UsersApiModule,
    WorkflowApiModule,
    ReportsApiModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DefaultExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: BaseErrorExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class ApiModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserContextMiddleware).forRoutes('*')
  }
}
