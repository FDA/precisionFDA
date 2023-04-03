import { createClient } from 'redis'
import { Notification } from '../notification.entity'
import { getLogger } from '../../../logger'
import { createRedisClient, NOTIFICATIONS_QUEUE } from '../../../services/redis.service'

type RedisClientType = ReturnType<typeof createClient>

class NotificationService {
  private redisClient?: RedisClientType

  constructor(redisClient?: RedisClientType) {
    this.redisClient = redisClient
    getLogger().debug('NotificationService initialized')
  }

  async createNotification(notification: Notification) {
    getLogger().debug(`creating notification ${JSON.stringify(notification)}`)
    if (!this.redisClient) {
      getLogger().debug('creating new Redis Client')
      this.redisClient = await createRedisClient()
    }

    // TODO persistence
    this.redisClient?.publish(NOTIFICATIONS_QUEUE, JSON.stringify(notification))
    getLogger().debug('notification published')
  }
}

export { NotificationService, RedisClientType }
