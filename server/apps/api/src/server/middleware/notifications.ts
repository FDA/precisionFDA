
import { database } from '@shared/database'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { AuthSessionOperation } from '@shared/domain/user/ops/auth.session'
import { User } from '@shared/domain/user/user.entity'
import { createRedisClient, NOTIFICATIONS_QUEUE } from '@shared/services/redis.service'
import http from 'http'
import ws from 'ws'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { log } from '../../logger'
import { UserCtx } from '@shared/types'

// list of client connections grouped together by user id for faster access
const clientConnections = new Map<number, WebSocketConnection[]>()

const connectionsCleanup = () => {
  clientConnections.forEach((connections: WebSocketConnection[], userId: number) => {
    if (connections !== null && connections.length > 0) {
      // filter those with readyState === 1 (OPEN)
      const filteredConnections = connections.filter(wsc => wsc.connection.readyState === 1)
      if (connections.length !== filteredConnections.length) {
        log.debug(`removing connection for user ${userId}`)
        clientConnections.set(userId, filteredConnections)
      }
    }
  })
}

const storeConnection = (user: User, wsc: WebSocketConnection) => {
  if (!clientConnections.get(user.id) || clientConnections.get(user.id)?.length === 0) {
    log.verbose(`Store WS connection`)
    clientConnections.set(user.id, [wsc])
  } else {
    clientConnections.get(user.id)?.push(wsc)
  }
  log.verbose(`User ${user.dxuser} successfully authenticated for receiving WebSocket notifications`)
  log.verbose(`Count of connectedClients ${clientConnections.size}`)
}

const authenticateUserConnection = async (connection: any, message: any) => {
  const notificationService = new NotificationService(database.orm().em.fork() as SqlEntityManager)
  const authSessionOp = new AuthSessionOperation({
    log,
    em: database.orm().em as SqlEntityManager,
    user: {} as UserCtx,
  })
  const user = await authSessionOp.execute(message.session_id)
    .then(user => {
      const wsc: WebSocketConnection = {
        connection,
        sessionId: message.session_id,
        startedAt: new Date(),
        userId: user.id,
      }
      storeConnection(user, wsc)
      notificationService.getUnreadNotifications(user.id).then(unread => {
        unread.forEach(unreadNotification => {
          connection.send(JSON.stringify(unreadNotification))
        });
      })
    })
    .catch(error => {
      log.error(`WebSocket connection fails. ${error}`)
    })
}

export const setupWSServer = async (server: http.Server) => {
  const wss = new ws.Server({ server })
  //@ts-ignore
  wss.on('connection', conn => {
    //@ts-ignore
    conn.on('message', messagePayload => {
      log.verbose(`WS messagePayload ${messagePayload}`)
      const message = JSON.parse(messagePayload.toString())
      if (message.action === 'login') {
        log.verbose('starting login session')
        authenticateUserConnection(conn, message)
      }
    })
    conn.on('close', () => {
      console.log('connection close listener')
      connectionsCleanup()
    })
  })

  const client = await createRedisClient('worker')

  client.subscribe(NOTIFICATIONS_QUEUE, eventPayload => {
    //@ts-ignore compilation says it's instance of Error, but it's actually a string
    const notification = JSON.parse(eventPayload)
    const userId = notification.user.id
    notification.user = null // not sending user info to client
    const wscs = clientConnections.get(userId)
    wscs?.forEach(wsc => {
      try {
        log.verbose(`sending notification to client ${JSON.stringify(notification)}`)
        wsc.connection.send(JSON.stringify(notification))
      } catch (error) {
        log.error(`error: ${error}`)
      }
    })
  })

  wss.on('close', () => {
    console.log('on close event')
    log.verbose('closing redis connection')
    client.quit()
  })

  return wss
}

export type WebSocketConnection = {
  startedAt: Date
  userId: number
  sessionId: string
  connection: any
}
