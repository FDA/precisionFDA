import { IncomingMessage } from 'node:http'
import { RequestContext } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Logger, UseInterceptors } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'ws'
import { COOKIE_SESSION_KEY } from '@shared/config/consts'
import { OrmContextInterceptor } from '@shared/database/interceptor/orm-context.interceptor'
import { Uid } from '@shared/domain/entity/domain/uid'
import { JobRepository } from '@shared/domain/job/job.repository'
import { JobLogService } from '@shared/domain/job/services/job-log.service'
import { NotificationDTO } from '@shared/domain/notification/dto/notification.dto'
import { Notification } from '@shared/domain/notification/notification.entity'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { Session } from '@shared/domain/session/session.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NOTIFICATION_ACTION } from '@shared/enums'
import { PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { createRedisClient, NOTIFICATIONS_QUEUE } from '@shared/services/redis.service'
import { CookieUtils } from '@shared/utils/cookie.utils'
import { Encryptor } from '@shared/utils/encryptors/encryptor'
import { HashUtils } from '@shared/utils/hash.utils'
import { PfdaWebSocket, WEBSOCKET_EVENTS } from '@shared/websocket/model/pfda-web-socket'
import { UserContextTokenInterceptor } from '../user-context/interceptor/user-context-token.interceptor'

@UseInterceptors(UserContextTokenInterceptor, OrmContextInterceptor)
@WebSocketGateway()
export class WebsocketGateway implements OnGatewayDisconnect, OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server
  @ServiceLogger()
  private readonly logger: Logger

  private clientConnections = new Map<number, Set<PfdaWebSocket>>()

  constructor(
    private readonly notificationService: NotificationService,
    private readonly jobRepository: JobRepository,
    private readonly jobLogService: JobLogService,
    private readonly em: SqlEntityManager,
  ) {}

  afterInit(): void {
    this.setupRedisSubscriber().catch(err =>
      this.logger.error({ message: 'Failed to setup Redis subscriber', error: err.message }),
    )
  }

  async handleConnection(client: PfdaWebSocket, message: IncomingMessage): Promise<void> {
    await RequestContext.create(this.em.fork(), async () => {
      try {
        this.logger.verbose(`WebSocket client connected, IP: ${message.socket.remoteAddress}`)

        const token = CookieUtils.getCookie(COOKIE_SESSION_KEY, message.headers.cookie)
        if (!token) {
          this.logger.verbose('WebSocket connection missing authentication token')
          client.close(4001, 'Missing authentication token')
          return
        }

        const decryptedUserSession = Encryptor.decrypt(token)

        client.pfdaUserContext = new UserContext(
          decryptedUserSession.user_id,
          decryptedUserSession.token,
          decryptedUserSession.username,
          decryptedUserSession.expiration,
          decryptedUserSession.session_id,
        )

        const session = await this.em.findOne(Session, {
          key: HashUtils.hashSessionId(client.pfdaUserContext.sessionId),
          user: client.pfdaUserContext.id,
        })
        if (!session) {
          this.logger.verbose(`Session with id ${client.pfdaUserContext.sessionId} was not found`)
          client.close(4001, 'Session not found')
          return
        }

        if (session.isExpired()) {
          this.logger.verbose(`Session with id ${session.id} expired`)
          client.close(4001, 'Session expired')
          return
        }

        const userId = client.pfdaUserContext.id
        const dxuser = client.pfdaUserContext.dxuser

        if (!this.clientConnections.has(userId)) {
          this.clientConnections.set(userId, new Set())
        }

        this.clientConnections.get(userId).add(client)
        client.send(
          JSON.stringify({ type: WEBSOCKET_EVENTS.NOTIFICATION, data: { action: NOTIFICATION_ACTION.CONNECTED } }),
        )

        this.logger.debug({
          message: 'User authenticated for WebSocket notifications',
          user: dxuser,
          userId: userId,
        })
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e)
        this.logger.error({ message: 'WebSocket connection error', error: errorMessage })
        client.close(4001, errorMessage)
      }
    })
  }

  handleDisconnect(client: PfdaWebSocket): void {
    try {
      const userId = client.pfdaUserContext.id

      if (!userId) {
        this.logger.verbose('Disconnecting client with missing user ID')
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

      this.logger.debug({
        message: 'WebSocket client disconnected',
        userId: userId,
        remainingConnections: connections.size,
      })
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e)
      this.logger.error({ message: 'WebSocket disconnection error', error: errorMessage })
    }
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.SYNC)
  async syncUnreadNotifications(@ConnectedSocket() client: PfdaWebSocket): Promise<void> {
    try {
      const userId = client.pfdaUserContext.id
      const unreadNotifications = await this.notificationService.fetchUnreadForSync(userId)
      unreadNotifications.forEach((notification: Notification) => {
        this.sendNotification(
          userId,
          JSON.stringify({
            type: WEBSOCKET_EVENTS.NOTIFICATION,
            data: NotificationDTO.fromEntity(notification),
          }),
          notification.sessionId,
        )
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error({ message: 'Failed to sync unread notifications', error: errorMessage })
    }
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.JOB_LOG)
  async fetchJobLog(
    @ConnectedSocket() client: PfdaWebSocket,
    @MessageBody() data: { jobUid: Uid<'job'> },
  ): Promise<void> {
    try {
      const job = await this.jobRepository.findAccessibleOne({ uid: data.jobUid })
      if (!job) {
        throw new PermissionError('User is not the owner of this job')
      }
      await this.jobLogService.streamJobLogs(job, client)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error({ message: 'Failed to fetch job log', error: errorMessage })
    }
  }

  private async setupRedisSubscriber(): Promise<void> {
    const client = await createRedisClient()

    client.subscribe(NOTIFICATIONS_QUEUE, (notificationJson: string) => {
      const notificationMessage: { userId: number; sessionId?: string; notification: NotificationDTO } =
        JSON.parse(notificationJson)
      const userId = notificationMessage.userId
      const sessionId = notificationMessage.sessionId

      this.sendNotification(
        userId,
        JSON.stringify({
          type: WEBSOCKET_EVENTS.NOTIFICATION,
          data: notificationMessage.notification,
        }),
        sessionId,
      )
    })

    this.server.on('close', () => {
      this.logger.debug('Closing Redis connection')
      client.quit()
    })
  }

  private sendNotification(userId: number, notification: string, sessionId?: string): void {
    this.clientConnections.get(userId)?.forEach(connection => {
      if (sessionId && connection.pfdaUserContext.sessionId !== sessionId) {
        // PFDA-5816: if sessionId is provided, only send to the connection with the same sessionId
        return
      }
      try {
        this.logger.log({
          message: 'Sending notification to client',
          userId: userId,
          notification: notification,
        })
        connection.send(notification)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        this.logger.error({ message: 'Sending notification failed', error: errorMessage })
      }
    })
  }
}
