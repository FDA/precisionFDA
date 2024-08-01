import { Module } from '@nestjs/common'
import { platformClientProvider } from '../provider/platform-client.provider'
import { WebsocketGateway } from './websocket.gateway'

@Module({
  imports: [],
  providers: [platformClientProvider, WebsocketGateway],
})
export class WebsocketModule {}
