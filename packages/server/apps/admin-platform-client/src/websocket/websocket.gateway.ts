import { Logger } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { Uid } from '@shared/domain/entity/domain/uid'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import WebSocket from 'ws'

@WebSocketGateway()
export class WebsocketGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(private readonly platformClient: PlatformClient) {}

  async handleConnection(client: WebSocket) {
    try {
      this.logger.log(`Client connected to admin-platform-client: ${client}`)
    } catch (e) {
      this.logger.error(`Connection error: ${e}`)

      client.close(4001, e?.message)
    }
  }

  handleDisconnect(client: WebSocket) {
    try {
      this.logger.log(`Client disconnected to admin-platform-client: ${client}`)
      client.close()
    } catch (e) {
      this.logger.error(`Websocket disconnection error: ${e}`)
    }
  }

  @SubscribeMessage('getLog')
  async fetchJobLog(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() data: { jobDxId: Uid<'job'> },
  ) {
    try {
      const jobDxId = data.jobDxId

      const ws = this.platformClient.streamJobLogs(jobDxId)
      ws.on('message', (data) => {
        client.send(data)
      })
      ws.on('close', () => {
        client.close()
      })
    } catch (error) {
      this.logger.error(`admin-platform-client failed to fetch job log: ${error}`)
    }
  }
}
