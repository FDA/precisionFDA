import { Module } from '@nestjs/common'
import { apiExceptionFilterProviders } from '@shared/errors/filter/api-exception-filter.providers'
import { LoggerModule } from '@shared/logger/logger.module'
import { AdminPlatformClientController } from './controller/admin-platform-client.controller'
import { platformClientProvider } from './provider/platform-client.provider'
import { AdminPlatformClientService } from './service/admin-platform-client.service'
import { WebsocketModule } from './websocket/websocket.module'

@Module({
  imports: [LoggerModule, WebsocketModule],
  controllers: [AdminPlatformClientController],
  providers: [...apiExceptionFilterProviders, platformClientProvider, AdminPlatformClientService],
})
export class AdminPlatformClientModule {}
