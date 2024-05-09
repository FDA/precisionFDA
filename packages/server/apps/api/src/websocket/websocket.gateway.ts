import { Logger } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { AuthSessionOperation } from '@shared/domain/auth/auth.session'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { createRedisClient, NOTIFICATIONS_QUEUE } from '@shared/services/redis.service'
import { Server, WebSocket } from 'ws'
import { log } from '../logger'
import { SubscribeMessageWithContext } from './decorator/subscribe-message-with-context'

interface PfdaWebSocket extends WebSocket {
  PFDA_USER_ID: number
}

@WebSocketGateway()
export class WebsocketGateway implements OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server

  private clientConnections = new Map<number, Set<PfdaWebSocket>>()
  private logger = new Logger('WebsocketGateway')

  constructor(
    private readonly notificationService: NotificationService,
    private readonly authSessionOperation: AuthSessionOperation,
  ) {}

  afterInit() {
    this.setupRedisSubscriber().catch((err) =>
      this.logger.error(`Failed to setup Redis subscriber: ${err}`),
    )
  }

  handleDisconnect(client: PfdaWebSocket) {
    this.logger.verbose(`Websocket client disconnected: ${client}`)

    const userId = client.PFDA_USER_ID

    if (userId == null) {
      return
    }

    const connections = this.clientConnections.get(userId)

    if (!connections) {
      return
    }

    connections.delete(client)

    if (connections.size === 0) {
      this.clientConnections.delete(userId)
    }
  }

  @SubscribeMessageWithContext('login')
  async handleLogin(
    @ConnectedSocket() client: PfdaWebSocket,
    @MessageBody('sessionId') sessionId: string,
  ) {
    try {
      const user = await this.authSessionOperation.execute(sessionId)

      if (!this.clientConnections.has(user.id)) {
        this.clientConnections.set(user.id, new Set())
      }

      this.clientConnections.get(user.id).add(client)
      client.PFDA_USER_ID = user.id

      this.logger.verbose(
        `User ${user.dxuser} successfully authenticated for receiving WebSocket notifications`,
      )

      const unreadNotifications = await this.notificationService.getUnreadNotifications(user.id)
      unreadNotifications.forEach((notification) => {
        client.send(JSON.stringify(notification))
      })
    } catch (error) {
      this.logger.error(`WebSocket connection authentication failed. ${error}`)
    }
  }

  private async setupRedisSubscriber() {
    const client = await createRedisClient()

    client.subscribe(NOTIFICATIONS_QUEUE, (notificationJson: string) => {
      const notification: { user: UserContext } = JSON.parse(notificationJson)

      const userId = notification.user.id

      delete notification.user // not sending user info to client

      this.sendNotification(userId, JSON.stringify(notification))
    })

    this.server.on('close', () => {
      this.logger.verbose('Closing Redis connection')
      client.quit()
    })
  }

  private sendNotification(userId: number, notification: string) {
    this.clientConnections.get(userId)?.forEach((connection) => {
      try {
        log.verbose(
          `Sending notification to client. UserId: ${userId}, notification: ${notification}`,
        )
        connection.send(notification)
      } catch (error) {
        log.error(`Sending notification failed. ${error}`)
      }
    })
  }
}
