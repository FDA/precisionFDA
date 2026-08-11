import { QueryOrder, Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger, Optional } from '@nestjs/common'
import { createClient } from 'redis'
import { Notification } from '@shared/domain/notification/notification.entity'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NotFoundError, PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { createRedisClient, NOTIFICATIONS_QUEUE } from '@shared/services/redis.service'
import { NotificationDTO } from '../dto/notification.dto'
import { NotificationInput } from '../notification.input'
import { NotificationRepository } from '../notification.repository'

export type RedisClientType = ReturnType<typeof createClient>

@Injectable()
export class NotificationService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly notificationRepo: NotificationRepository,
    @Optional() private redisClient?: RedisClientType,
  ) {
    this.logger.debug('NotificationService initialized')
  }

  /**
   * Persists notification in a database and publishes it into a channel.
   * @param notificationInput notification data
   */
  async createNotification(notificationInput: NotificationInput): Promise<void> {
    this.logger.debug(`Creating notification ${JSON.stringify(notificationInput)}`)
    if (!this.redisClient) {
      this.logger.debug('Creating new Redis Client')
      this.redisClient = await createRedisClient()
    }

    const notification = new Notification(
      notificationInput.userId ? Reference.createFromPK(User, notificationInput.userId) : null,
      notificationInput.sessionId ?? null,
      notificationInput.action,
      notificationInput.message,
      notificationInput.severity,
      new Date(),
      new Date(),
      notificationInput.meta,
    )
    await this.notificationRepo.persistAndFlush(notification)

    const mappedNotification = NotificationDTO.fromEntity(notification)

    this.redisClient?.publish(
      NOTIFICATIONS_QUEUE,
      JSON.stringify({
        notification: mappedNotification,
        userId: notification.user?.id,
        sessionId: notification.sessionId,
      }),
    )

    this.logger.debug('Notification published')
  }

  /**
   * For the REST endpoint: fetches unread notifications for the authenticated user
   * and immediately marks them as delivered.
   */
  async fetchAndMarkDelivered(): Promise<NotificationDTO[]> {
    this.logger.log({
      message: `Getting unread notifications for user id: ${this.user.id}`,
      userId: this.user.id,
    })
    const notifications = await this.queryUnread(this.user.id)

    const now = new Date()
    const ids = notifications.map(notification => notification.id)
    await this.em.nativeUpdate(Notification, { id: { $in: ids } }, { deliveredAt: now })

    return notifications.map((notification: Notification) => NotificationDTO.fromEntity(notification))
  }

  /**
   * For the WebSocket sync: fetches unread notifications for a specific user
   * without marking them as delivered (the client confirms each one individually).
   */
  async fetchUnreadForSync(userId: number): Promise<Notification[]> {
    this.logger.log({
      message: `Getting unread notifications for sync, user id: ${userId}`,
      userId,
    })
    return this.queryUnread(userId)
  }

  private async queryUnread(userId: number): Promise<Notification[]> {
    return this.notificationRepo.find({ user: userId, deliveredAt: null }, { orderBy: { createdAt: QueryOrder.DESC } })
  }

  /**
   * Updates updatedAt flag and deliveredAt date.
   *
   * @param notificationId
   * @param deliveredAt
   */
  async updateDeliveredAt(notificationId: number, deliveredAt?: Date): Promise<NotificationDTO> {
    const loadedFromDb = await this.notificationRepo.findOne(
      { id: notificationId },
      {
        populate: ['user'],
      },
    )

    if (!loadedFromDb) {
      throw new NotFoundError()
    }

    if (loadedFromDb.user?.id !== this.user?.id) {
      throw new PermissionError()
    }

    if (deliveredAt) {
      loadedFromDb.deliveredAt = new Date(deliveredAt.toString())
    } else {
      loadedFromDb.deliveredAt = new Date()
    }
    await this.em.flush()
    return NotificationDTO.fromEntity(loadedFromDb)
  }
}
