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
import { config } from '@shared/config'
import { OrmContextInterceptor } from '@shared/database/interceptor/orm-context.interceptor'
import { Uid } from '@shared/domain/entity/domain/uid'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'
import { Job } from '@shared/domain/job/job.entity'
import { JobLogService } from '@shared/domain/job/services/job-log.service'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { Session } from '@shared/domain/session/session.entity'
import { PermissionError } from '@shared/errors'
import { NOTIFICATIONS_QUEUE, createRedisClient } from '@shared/services/redis.service'
import { CookieUtils } from '@shared/utils/cookie-utils'
import { Encryptor } from '@shared/utils/encryptor'
import { HashUtils } from '@shared/utils/hash-utils'
import { TimeUtils } from '@shared/utils/time.utils'
import { PfdaWebSocket, WEBSOCKET_EVENTS } from '@shared/websocket/model/pfda-web-socket'
import { IncomingMessage } from 'http'
import { Server } from 'ws'
import { log } from '../logger'
import { UserContextTokenInterceptor } from '../user-context/interceptor/user-context-token.interceptor'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

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
      this.logger.error(`Failed to setup Redis subscriber: ${err}`),
    )
  }

  @CreateRequestContext()
  async handleConnection(client: PfdaWebSocket, message: IncomingMessage) {
    try {
      this.logger.log(`Websocket client connected: ${client}`)

      const token = CookieUtils.getCookie('_precision-fda_session', message.headers.cookie)
      client.PFDA_AUTH_TOKEN = token

      const decrypted = Encryptor.decrypt(token)
      const sessionId = decrypted.session_id
      const session = await this.em.findOneOrFail(Session, {
        key: HashUtils.hashSessionId(sessionId),
      })
      // ref: app/models/session.rb#expired?
      if (
        session.updatedAt.getTime() < TimeUtils.minutesAgoInMiliseconds(config.maxTimeInactivity)
      ) {
        throw new Error('Session expired')
      }

      const userId = decrypted.user_id
      const dxuser = decrypted.username

      if (!this.clientConnections.has(userId)) {
        this.clientConnections.set(userId, new Set())
      }

      this.clientConnections.get(userId).add(client)

      this.logger.log(
        `User ${dxuser} successfully authenticated for receiving WebSocket notifications`,
      )

      const unreadNotifications = await this.notificationService.getUnreadNotifications(userId)
      unreadNotifications.forEach((notification) => {
        client.send(JSON.stringify(notification))
      })
    } catch (e) {
      this.logger.error(`WebSocket connection error: ${e}`)

      client.close(4001, e?.message)
    }
  }

  handleDisconnect(client: PfdaWebSocket) {
    try {
      this.logger.log(`Websocket client disconnected: ${client}`)

      const token = client.PFDA_AUTH_TOKEN

      const decrypted = Encryptor.decrypt(token)
      const userId = decrypted.user_id
      if (userId == null) {
        return
      }

      const connections = this.clientConnections.get(userId)

      if (!connections) {
        return
      }

      client.close()
      connections.delete(client)

      if (connections.size === 0) {
        this.clientConnections.delete(userId)
      }
    } catch (e) {
      this.logger.error(`Websocket disconnection error: ${e}`)
    }
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.JOB_LOG)
  async fetchJobLog(
    @ConnectedSocket() client: PfdaWebSocket,
    @MessageBody() data: { jobUid: Uid<'job'> },
  ) {
    try {
      const jobUid = data.jobUid
      const job = (await this.entityFetcherService.getAccessibleByUid(Job, jobUid)) as Job
      if (!job) {
        throw new PermissionError('User is not the owner of this job')
      }
      await this.jobLogService.streamJobLogs(job, client)
    } catch (error) {
      this.logger.error(`Failed to fetch job log. ${error}`)
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
      this.logger.log('Closing Redis connection')
      client.quit()
    })
  }

  private sendNotification(userId: number, notification: string) {
    this.clientConnections.get(userId)?.forEach((connection) => {
      try {
        log.log(
          `Sending notification to client. UserId: ${userId}, notification: ${notification}`,
        )
        connection.send(notification)
      } catch (error) {
        log.error(`Sending notification failed. ${error}`)
      }
    })
  }
}
