import { createClient } from 'redis'
import { config } from '../config'
import { getLogger } from '../logger'

/**
 * Creates redis client.
 *
 * @returns
 */
export const createRedisClient = async (): Promise<any> => {
  const url = new URL(config.redis.url)

  try {
    const client = createClient({
      socket: {
        port: parseInt(url.port),
        host: url.hostname,
        ...(config.redis.isSecure && { tls: true as const }),
      },
      ...(config.redis.isSecure && { password: config.redis.authPassword }),
    })

    await client.connect()
    if (config.redis.isSecure) {
      await client.auth({ password: config.redis.authPassword })
    }
    return client
  } catch (error) {
    getLogger().error(error)
    throw error
  }
}

export const NOTIFICATIONS_QUEUE = 'notifications'
