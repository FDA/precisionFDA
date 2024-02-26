import { Module } from '@nestjs/common'
import { AuthModule } from '@shared/domain/auth/auth.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { WebsocketGateway } from './websocket.gateway'

@Module({
  imports: [NotificationModule, AuthModule],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}
