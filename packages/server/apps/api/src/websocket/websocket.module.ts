import { Module } from '@nestjs/common'
import { AuthModule } from '@shared/domain/auth/auth.module'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { JobModule } from '@shared/domain/job/job.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { WebsocketGateway } from './websocket.gateway'

@Module({
  imports: [NotificationModule, AuthModule, JobModule, EntityModule],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}
