import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Optional } from '@nestjs/common'
import { User } from '@shared/domain/user/user.entity'
import { NotFoundError, PermissionError } from '@shared/errors'
import { createClient } from 'redis'
import { defaultLogger as logger } from '../../../logger'
import { createRedisClient, NOTIFICATIONS_QUEUE } from '@shared/services/redis.service'
import { Notification } from '@shared/domain/notification/notification.entity'
import { NotificationInput } from '../notification.input'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Reference } from '@mikro-orm/core'

export type RedisClientType = ReturnType<typeof createClient>

@Injectable()
export class NotificationService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly user?: UserContext,
    @Optional() private redisClient?: RedisClientType,
  ) {
    logger.debug('NotificationService initialized')
  }

  /**
   * Persists notification in a database and publishes it into a channel.
   * @param notificationInput notification data
   */
  async createNotification(notificationInput: NotificationInput) {
    logger.debug(`NotificationService: creating notification ${JSON.stringify(notificationInput)}`)
    if (!this.redisClient) {
      logger.debug('NotificationService: creating new Redis Client')
      this.redisClient = await createRedisClient()
    }

    const notification = new Notification(
      notificationInput.userId ? Reference.createFromPK(User, notificationInput.userId) : null,
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
      user: notificationInput.userId,
      action: notification.action,
      message: notification.message,
      severity: notification.severity,
      meta: notificationInput.meta,
    }

    this.redisClient?.publish(NOTIFICATIONS_QUEUE, JSON.stringify(notificationMessage))

    logger.debug('NotificationService: notification published')
  }

  /**
   * Returns notifications for current user that have empty deliveredAt flag.
   */
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    logger.log(`Getting unread notifications for user id: ${userId}`)
    return await this.em.find(Notification, { user: userId, deliveredAt: null })
  }

  /**
   * Updates updatedAt flag and deliveredAt date.
   *
   * @param notificationId
   * @param deliveredAt
   */
  async updateDeliveredAt(notificationId: number, deliveredAt?: Date): Promise<Notification> {
    if (notificationId) {
      const loadedFromDb = await this.em.findOneOrFail(Notification, notificationId, {
        populate: ['user'],
      })
      if (loadedFromDb.user?.id !== this.user?.id) {
        throw new PermissionError()
      }

      loadedFromDb.updatedAt = new Date()
      if (deliveredAt) {
        loadedFromDb.deliveredAt = new Date(deliveredAt.toString())
      }

      await this.em.flush()
      return loadedFromDb
    } else {
      throw new NotFoundError()
    }
  }
}
