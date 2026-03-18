import { MikroOrmMiddleware } from '@mikro-orm/nestjs'
import { CacheModule } from '@nestjs/cache-manager'
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
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
import { CountersApiModule } from './counters/counters.api.module'
import { CliApiModule } from './cli/cli.api.module'
import { DataPortalsApiModule } from './data-portals/data-portals.api.module'
import { DbClusterApiModule } from './dbclusters/dbcluster.api.module'
import { DebugApiModule } from './debug/debug.api.module'
import { DiscussionsApiModule } from './discussions/discussions.api.module'
import { EmailApiModule } from './emails/email.api.module'
import { ExpertsApiModule } from './experts/experts.api.module'
import { FilesApiModule } from './files/files.api.module'
import { FolderApiModule } from './folders/folder.api.module'
import { HealthApiModule } from './health/health.api.module'
import { JobApiModule } from './jobs/job.api.module'
import { LicenseApiModule } from './licenses/license.api.module'
import { RailsLoggerInterceptor } from './logger/interceptor/rails-logger.interceptor'
import { NewsApiModule } from './news/news.api.module'
import { NodesApiModule } from './nodes/nodes.api.module'
import { NotesApiModule } from './notes/notes.api.module'
import { NotificationPreferencesApiModule } from './notification-preferences/notification-preferences.api.module'
import { NotificationsApiModule } from './notifications/notifications.api.module'
import { PropertiesApiModule } from './properties/properties.api.module'
import { PublishApiModule } from './publish/publish.api.module'
import { ReportsApiModule } from './reports/reports.api.module'
import { RequestAccessApiModule } from './request-access/request-access.api.module'
import { SearchApiModule } from './search/search.api.module'
import { SessionApiModule } from './session/session.api.module'
import { SiteSettingsApiModule } from './site-settings/site-settings.api.module'
import { SpaceEventsApiModule } from './space-events/space-events.api.module'
import { SpaceGroupsApiModule } from './space-groups/space-groups.api.module'
import { SpaceMembershipsApiModule } from './space-memberships/space-memberships.api.module'
import { SpacesApiModule } from './spaces/spaces.api.module'
import { TracksApiModule } from './tracks/tracks.api.module'
import { CSRFVerificationMiddleware } from './user-context/middleware/csrf-verification.middleware'
import { UserContextMiddleware } from './user-context/middleware/user-context.middleware'
import { UsersApiModule } from './users/users.api.module'
import { WebsocketModule } from './websocket/websocket.module'
import { WorkflowApiModule } from './workflows/workflow.api.module'

@Module({
  imports: [
    DatabaseModule.forRoot({
      distPath: './dist/apps/api',
      sourcePath: './apps/api/src',
    }),
    CacheModule.register({
      isGlobal: true,
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
    CountersApiModule,
    DataPortalsApiModule,
    DbClusterApiModule,
    DebugApiModule,
    DiscussionsApiModule,
    EmailApiModule,
    ExpertsApiModule,
    FilesApiModule,
    HealthApiModule,
    SpaceEventsApiModule,
    FolderApiModule,
    JobApiModule,
    LicenseApiModule,
    NewsApiModule,
    NodesApiModule,
    NotificationPreferencesApiModule,
    NotificationsApiModule,
    NotesApiModule,
    PropertiesApiModule,
    SiteSettingsApiModule,
    SpacesApiModule,
    SpaceMembershipsApiModule,
    SpaceGroupsApiModule,
    TracksApiModule,
    AlertsApiModule,
    UsersApiModule,
    WorkflowApiModule,
    ReportsApiModule,
    RequestAccessApiModule,
    SessionApiModule,
    PublishApiModule,
    SearchApiModule,
  ],
  providers: [
    ...apiExceptionFilterProviders,
    // PFDA-6374: temporary revert to keep the current log query working
    {
      provide: APP_INTERCEPTOR,
      useClass: RailsLoggerInterceptor,
    },
  ],
})
export class ApiModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MikroOrmMiddleware, UserContextMiddleware).forRoutes('{*splat}')
    // Apply UserContext and CSRF middlewares to all routes except CLI token exchange
    // CLI token exchange is used by job workers where CSRF token is not applicable
    consumer
      .apply(CSRFVerificationMiddleware)
      .exclude({ path: 'cli/token/exchange', method: RequestMethod.POST })
      .forRoutes('{*splat}')
  }
}
