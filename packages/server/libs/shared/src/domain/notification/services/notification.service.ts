import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger, Optional } from '@nestjs/common'
import { Notification } from '@shared/domain/notification/notification.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User } from '@shared/domain/user/user.entity'
import { NotFoundError, PermissionError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { createRedisClient, NOTIFICATIONS_QUEUE } from '@shared/services/redis.service'
import { createClient } from 'redis'
import { NotificationInput } from '../notification.input'

export type RedisClientType = ReturnType<typeof createClient>

@Injectable()
export class NotificationService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user?: UserContext,
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
    await this.em.persistAndFlush(notification)

    const notificationMessage = {
      id: notification.id,
      sessionId: notificationInput.sessionId,
      user: notificationInput.userId,
      action: notification.action,
      message: notification.message,
      severity: notification.severity,
      meta: notificationInput.meta,
    }

    this.redisClient?.publish(NOTIFICATIONS_QUEUE, JSON.stringify(notificationMessage))

    this.logger.debug('Notification published')
  }

  /**
   * Returns notifications for current user that have empty deliveredAt flag.
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    this.logger.log({
      message: `Getting unread notifications for user id: ${this.user.id}`,
      userId: this.user.id,
    })
    return await this.em.find(
      Notification,
      { user: this.user.id, deliveredAt: null },
      { orderBy: { createdAt: 'DESC' } },
    )
  }

  /**
   * Updates updatedAt flag and deliveredAt date.
   *
   * @param notificationId
   * @param deliveredAt
   */
  async updateDeliveredAt(notificationId: number, deliveredAt?: Date): Promise<Notification> {
    const loadedFromDb = await this.em.findOne(Notification, notificationId, {
      populate: ['user'],
    })

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
    await this.em.persistAndFlush(loadedFromDb)
    return loadedFromDb
  }
}
