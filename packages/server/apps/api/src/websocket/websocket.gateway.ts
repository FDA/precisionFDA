import { CreateRequestContext, SqlEntityManager } from '@mikro-orm/mysql'
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
import { COOKIE_SESSION_KEY } from '@shared/config/consts'
import { database } from '@shared/database'
import { OrmContextInterceptor } from '@shared/database/interceptor/orm-context.interceptor'
import { Uid } from '@shared/domain/entity/domain/uid'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'
import { Job } from '@shared/domain/job/job.entity'
import { JobLogService } from '@shared/domain/job/services/job-log.service'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { Session } from '@shared/domain/session/session.entity'
import { PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { NOTIFICATIONS_QUEUE, createRedisClient } from '@shared/services/redis.service'
import { CookieUtils } from '@shared/utils/cookie.utils'
import { Encryptor } from '@shared/utils/encryptors/encryptor'
import { HashUtils } from '@shared/utils/hash.utils'
import { PfdaWebSocket, WEBSOCKET_EVENTS } from '@shared/websocket/model/pfda-web-socket'
import { IncomingMessage } from 'http'
import { Server } from 'ws'
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
    private readonly entityFetcherService: EntityFetcherService,
    private readonly jobLogService: JobLogService,
    private readonly em: SqlEntityManager,
  ) {}

  afterInit() {
    this.setupRedisSubscriber().catch((err) =>
      this.logger.error({ message: 'Failed to setup Redis subscriber', error: err.message }),
    )
  }

  @CreateRequestContext(() => database.orm())
  async handleConnection(client: PfdaWebSocket, message: IncomingMessage) {
    try {
      this.logger.debug(`WebSocket client connected, IP: ${message.socket.remoteAddress}`)

      const token = CookieUtils.getCookie(COOKIE_SESSION_KEY, message.headers.cookie)
      if (!token) {
        throw new Error('Missing authentication token')
      }
      client.PFDA_AUTH_TOKEN = token

      const decrypted = Encryptor.decrypt(token)

      const sessionId = decrypted.session_id
      const session = await this.em.findOneOrFail(Session, {
        key: HashUtils.hashSessionId(sessionId),
        user: decrypted.user_id,
      })

      if (session.isExpired()) {
        throw new Error('Session expired')
      }

      const userId = decrypted.user_id
      const dxuser = decrypted.username

      if (!this.clientConnections.has(userId)) {
        this.clientConnections.set(userId, new Set())
      }

      this.clientConnections.get(userId).add(client)

      this.logger.debug({
        message: 'User authenticated for WebSocket notifications',
        user: dxuser,
        userId: userId,
      })

      const unreadNotifications = await this.notificationService.getUnreadNotifications(userId)
      unreadNotifications.forEach((notification) => {
        client.send(JSON.stringify(notification))
      })
    } catch (e) {
      this.logger.error({ message: 'WebSocket connection error', error: e.message })
      client.close(4001, e.message)
    }
  }

  handleDisconnect(client: PfdaWebSocket) {
    try {
      const token = client.PFDA_AUTH_TOKEN
      const decrypted = Encryptor.decrypt(token)
      const userId = decrypted.user_id

      if (!userId) {
        this.logger.warn('Disconnecting client with missing user ID')
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
      this.logger.error({ message: 'WebSocket disconnection error', error: e.message })
    }
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.JOB_LOG)
  async fetchJobLog(
    @ConnectedSocket() client: PfdaWebSocket,
    @MessageBody() data: { jobUid: Uid<'job'> },
  ) {
    try {
      const job = await this.entityFetcherService.getAccessibleByUid(Job, data.jobUid)
      if (!job) {
        throw new PermissionError('User is not the owner of this job')
      }
      await this.jobLogService.streamJobLogs(job, client)
    } catch (error) {
      this.logger.error({ message: 'Failed to fetch job log', error: error.message })
    }
  }

  private async setupRedisSubscriber() {
    const client = await createRedisClient()

    client.subscribe(NOTIFICATIONS_QUEUE, (notificationJson: string) => {
      const notification: { user: number } = JSON.parse(notificationJson)
      const userId = notification.user

      delete notification.user // not sending user info to client

      this.sendNotification(
        userId,
        JSON.stringify({
          type: WEBSOCKET_EVENTS.NOTIFICATION,
          data: notification,
        }),
      )
    })

    this.server.on('close', () => {
      this.logger.debug('Closing Redis connection')
      client.quit()
    })
  }

  private sendNotification(userId: number, notification: string) {
    this.clientConnections.get(userId)?.forEach((connection) => {
      try {
        this.logger.log({
          message: 'Sending notification to client',
          userId: userId,
          notification: notification,
        })
        connection.send(notification)
      } catch (error) {
        this.logger.error({ message: 'Sending notification failed', error: error.message })
      }
    })
  }
}
