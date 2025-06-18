import { MikroOrmMiddleware } from '@mikro-orm/nestjs'
import { MiddlewareConsumer, Module } from '@nestjs/common'
import { DevtoolsModule } from '@nestjs/devtools-integration'
import { config } from '@shared/config'
import { DatabaseModule } from '@shared/database/database.module'
import { UserContextModule } from '@shared/domain/user-context/user-context.module'
import { apiExceptionFilterProviders } from '@shared/errors/filter/api-exception-filter.providers'
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
import { PublishApiModule } from './publish/publish.api.module'
import { ReportsApiModule } from './reports/reports.api.module'
import { SessionApiModule } from './session/session.api.module'
import { SiteSettingsApiModule } from './site-settings/site-settings.api.module'
import { SpaceEventsApiModule } from './space-events/space-events.api.module'
import { SpacesApiModule } from './spaces/spaces.api.module'
import { TracksApiModule } from './tracks/tracks.api.module'
import { CSRFVerificationMiddleware } from './user-context/middleware/csrf-verification.middleware'
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
    DatabaseModule.forRoot({
      distPath: './dist/apps/api',
      sourcePath: './apps/api/src',
    }),
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
    SpaceEventsApiModule,
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
    ReportsApiModule,
    SessionApiModule,
    PublishApiModule,
  ],
  providers: [
    ...apiExceptionFilterProviders,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: RailsLoggerInterceptor,
    // },
  ],
})
export class ApiModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(MikroOrmMiddleware, UserContextMiddleware, CSRFVerificationMiddleware)
      .forRoutes('{*splat}')
  }
}
