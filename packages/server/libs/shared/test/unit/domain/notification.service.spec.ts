import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { Notification } from '@shared/domain/notification/notification.entity'
import { User } from '@shared/domain/user/user.entity'
import { create, db } from '@shared/test'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { expect } from 'chai'
import sinon from 'sinon'
import { createClient } from 'redis'
import { NOTIFICATIONS_QUEUE } from '@shared/services/redis.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Reference } from '@mikro-orm/core'

describe('Notification service tests', () => {
  let em: EntityManager<MySqlDriver>
  let userCtx: UserContext
  let user1: User
  let user2: User
  let notificationService: NotificationService
  const userId = 100
  type RedisClientType = ReturnType<typeof createClient>

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user1 = create.userHelper.create(em, { id: userId })
    user2 = create.userHelper.create(em, { id: 101 })
    await em.flush()
    userCtx = {
      id: userId,
    } as UserContext
    notificationService = new NotificationService(em, userCtx)
  })

  it('Test create Notification', async () => {
    const redisClient = {
      publish: function (channel: string, message: string) {},
    } as RedisClientType
    const redisClientMock = sinon.mock(redisClient)
    redisClientMock.expects('publish').withArgs(
      NOTIFICATIONS_QUEUE,
      JSON.stringify({
        id: 1,
        user: 1,
        action: NOTIFICATION_ACTION.NODES_REMOVED,
        message: 'msg',
        severity: SEVERITY.WARN,
      }),
    )
    notificationService = new NotificationService(em, userCtx, redisClient)
    await notificationService.createNotification({
      userId: 1,
      action: NOTIFICATION_ACTION.NODES_REMOVED,
      message: 'msg',
      severity: SEVERITY.WARN,
    })

    const [notifications, count] = await em.findAndCount(Notification, {})
    expect(count).to.be.equal(1)
    expect(notifications[0].action).to.be.equal(NOTIFICATION_ACTION.NODES_REMOVED)
    expect(notifications[0].message).to.be.equal('msg')
    expect(notifications[0].severity).to.be.equal(SEVERITY.WARN)
    redisClientMock.verify()
  })

  it('Test create Notification with linkTitle and linkUrl', async () => {
    const redisClient = {
      publish: function (channel: string, message: string) {},
    } as RedisClientType
    const redisClientMock = sinon.mock(redisClient)
    redisClientMock.expects('publish').withArgs(
      NOTIFICATIONS_QUEUE,
      // N.B. ordering of keys seem to matter here
      JSON.stringify({
        id: 1,
        action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_COMPLETED,
        message: 'msg',
        severity: SEVERITY.WARN,
        meta: {
          linkTitle: 'hello',
          linkUrl: 'https://world.xyz',
        },
      }),
    )
    notificationService = new NotificationService(em, userCtx, redisClient)
    await notificationService.createNotification({
      action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_COMPLETED,
      message: 'msg',
      meta: {
        linkTitle: 'hello',
        linkUrl: 'https://world.xyz',
      },
      severity: SEVERITY.WARN,
    })

    const [notifications, count] = await em.findAndCount(Notification, {})
    expect(count).to.be.equal(1)
    expect(notifications[0].action).to.be.equal(NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_COMPLETED)
    expect(notifications[0].message).to.be.equal('msg')
    expect(notifications[0].meta).to.deep.equal({
      linkTitle: 'hello',
      linkUrl: 'https://world.xyz',
    })
    expect(notifications[0].severity).to.be.equal(SEVERITY.WARN)
    redisClientMock.verify()
  })

  it('Test get unread Notifications', async () => {
    const savedNotification = new Notification(
      Reference.createFromPK(User, user1.id),
      NOTIFICATION_ACTION.NODES_REMOVED,
      'test',
      SEVERITY.ERROR,
    )
    await em.persistAndFlush(savedNotification)
    await em.persistAndFlush(
      new Notification(
        Reference.createFromPK(User, user2.id),
        NOTIFICATION_ACTION.NODES_REMOVED,
        'test',
        SEVERITY.ERROR,
      ),
    )

    const unread = await notificationService.getUnreadNotifications(userId)
    expect(unread.length).to.equal(1) // only one despite two saved
    expect(unread[0].id).to.equal(savedNotification.id)
  })

  it('Test update Notification', async () => {
    const savedNotification = new Notification(
      Reference.createFromPK(User, user1.id),
      NOTIFICATION_ACTION.NODES_REMOVED,
      'test',
      SEVERITY.ERROR,
    )
    await em.persistAndFlush(savedNotification)

    await notificationService.updateDeliveredAt(savedNotification.id, new Date())

    const loadedFromDb = await em.findOneOrFail(Notification, savedNotification.id)
    expect(loadedFromDb.deliveredAt).not.to.be.null()
  })

  it('Test update Notification with PermissionError', async () => {
    userCtx = {
      id: user2.id,
    } as UserContext
    notificationService = new NotificationService(em, userCtx)

    const savedNotification = new Notification(
      Reference.createFromPK(User, user1.id),
      NOTIFICATION_ACTION.NODES_REMOVED,
      'test',
      SEVERITY.ERROR,
    )
    await em.persistAndFlush(savedNotification)

    try {
      await notificationService.updateDeliveredAt(savedNotification.id, new Date())
      expect.fail('Validation should have thrown error')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).to.equal('Error: You do have permissions to access this entity')
    }
  })
})
