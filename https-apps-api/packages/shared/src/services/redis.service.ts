import { createClient } from 'redis'
import { config } from '../config'
import { getLogger } from '../logger'

/**
 * Creates named redis client.
 *
 * @param name named ident of the client (api, worker etc.)
 *
 * @returns
 */
export const createRedisClient = async (name?: string) => {
  const url = new URL(config.redis.url)

  try {
    getLogger().info('connecting to redis')
    const client = createClient({
      //@ts-ignore doesn't compile, but needs to be here
      socket: {
        port: parseInt(url.port),
        host: url.hostname,
        tls: config.redis.isSecure,
      },
      ...config.redis.isSecure && { password: config.redis.authPassword },
    })

    //@ts-ignore doesn't compile, but needs to be here
    await client.connect()
    if (config.redis.isSecure) {
      //@ts-ignore doesn't compile, but needs to be here
      client.auth({ password: config.redis.authPassword })
    }
    getLogger().info('connected to redis')
    return client
  } catch (error) {
    getLogger().error(error)
    throw error
  }
}

export const NOTIFICATIONS_QUEUE = 'notifications'
