import { createClient } from 'redis'
import { Notification } from '../notification.entity'
import { defaultLogger as logger } from '../../../logger'
import { createRedisClient, NOTIFICATIONS_QUEUE } from '../../../services/redis.service'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { NotificationInput } from '../notification.input'
import { User } from '../../user'
import { errors } from '@pfda/https-apps-shared'

export type RedisClientType = ReturnType<typeof createClient>

export interface INotificationService {
  createNotification: (notificationInput: NotificationInput) => Promise<void>
}

export class NotificationService implements INotificationService {
  private redisClient?: RedisClientType
  protected em: SqlEntityManager

  constructor(em: SqlEntityManager, redisClient?: RedisClientType) {
    this.em = em
    this.redisClient = redisClient
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

    let user: User | null = null
    if (notificationInput.userId) {
      user = await this.em.findOneOrFail(User, notificationInput.userId)
    }
    const notification = new Notification(user, notificationInput.action, notificationInput.message,
      notificationInput.severity, new Date(), new Date(), notificationInput.meta)

    await this.em.persistAndFlush(notification)

    this.redisClient?.publish(NOTIFICATIONS_QUEUE, JSON.stringify(notification))
    logger.debug('NotificationService: notification published')
  }

  /**
   * Returns notifications for current user that have empty deliveredAt flag.
   */
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    logger.info(`NotificationService: getting unread notifications for user id: {userId}`)
    const unread = await this.em.find(Notification, { user: userId, deliveredAt: null })
    return unread
  }

  /**
   * Updates updatedAt flag and deliveredAt date.
   *
   * @param notificationInput
   * @param userCtx
   */
  async updateDeliveredAt(
    notificationId: number,
    deliveredAt?: Date,
    userId?: number, // TODO take this from automatically injected context
  ): Promise<Notification> {
    if (notificationId) {
      const loadedFromDb = await this.em.findOneOrFail(Notification, notificationId, {
        populate: ['user'],
      })
      if (loadedFromDb.user?.id !== userId) {
        throw new errors.PermissionError()
      }

      loadedFromDb.updatedAt = new Date()
      if (deliveredAt) {
        loadedFromDb.deliveredAt = new Date(deliveredAt.toString())
      }

      await this.em.flush()
      return loadedFromDb
    } else {
      throw new errors.NotFoundError()
    }
  }
}
