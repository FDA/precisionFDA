import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { User } from '../../../src/domain'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { database, notification as notifDomain } from '@pfda/https-apps-shared'
import { NOTIFICATION_ACTION, SEVERITY } from '../../../src/enums'
import { NotificationService } from '../../../src/domain/notification'
import { expect } from 'chai'
import { PermissionError } from '../../../src/errors'
import sinon from 'sinon'
import { createClient } from 'redis'
import { NOTIFICATIONS_QUEUE } from "../../../src/services/redis.service";

describe('Notification service tests', () => {
  let em: EntityManager<MySqlDriver>
  let user1: User
  let user2: User
  let notificationService: NotificationService
  const userId = 100
  type RedisClientType = ReturnType<typeof createClient>

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user1 = create.userHelper.create(em, {id: userId})
    user2 = create.userHelper.create(em, {id: 101})
    await em.flush()
    notificationService = new NotificationService(em)
  })

  it('Test create Notification', async() => {
    const redisClient = {
      publish: function(channel: string, message: string) {}
    } as RedisClientType
    const redisClientMock = sinon.mock(redisClient)
    redisClientMock.expects('publish').withArgs(NOTIFICATIONS_QUEUE,
      JSON.stringify({
        id: 1,
        action: NOTIFICATION_ACTION.NODES_REMOVED,
        message: "msg",
        severity: SEVERITY.WARN
      }))
    // @ts-ignore
    notificationService = new NotificationService(em, redisClient)
    await notificationService.createNotification({
      action: NOTIFICATION_ACTION.NODES_REMOVED,
      message: "msg",
      severity: SEVERITY.WARN
    })

    const [notifications, count] = await em.findAndCount(notifDomain.Notification, {})
    expect(count).to.be.equal(1)
    expect(notifications[0].action).to.be.equal(NOTIFICATION_ACTION.NODES_REMOVED)
    expect(notifications[0].message).to.be.equal("msg")
    expect(notifications[0].severity).to.be.equal(SEVERITY.WARN)
    redisClientMock.verify()
  })

  it('Test create Notification with linkTitle and linkUrl', async() => {
    const redisClient = {
      publish: function(channel: string, message: string) {}
    } as RedisClientType
    const redisClientMock = sinon.mock(redisClient)
    redisClientMock.expects('publish').withArgs(NOTIFICATIONS_QUEUE,
      // N.B. ordering of keys seem to matter here
      JSON.stringify({
        id: 1,
        action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_COMPLETED,
        message: "msg",
        severity: SEVERITY.WARN,
        meta: {
          linkTitle: 'hello',
          linkUrl: 'https://world.xyz',
        },
      }))
    // @ts-ignore
    notificationService = new NotificationService(em, redisClient)
    await notificationService.createNotification({
      action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_COMPLETED,
      message: "msg",
      meta: {
        linkTitle: 'hello',
        linkUrl: 'https://world.xyz',
      },
      severity: SEVERITY.WARN,
    })

    const [notifications, count] = await em.findAndCount(notifDomain.Notification, {})
    expect(count).to.be.equal(1)
    expect(notifications[0].action).to.be.equal(NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_COMPLETED)
    expect(notifications[0].message).to.be.equal("msg")
    expect(notifications[0].meta).to.deep.equal({
      linkTitle: 'hello',
      linkUrl: 'https://world.xyz',
    })
    expect(notifications[0].severity).to.be.equal(SEVERITY.WARN)
    redisClientMock.verify()
  })

  it('Test get unread Notifications', async() => {
    const savedNotification = new notifDomain.Notification(
      user1, NOTIFICATION_ACTION.NODES_REMOVED, "test", SEVERITY.ERROR
    )
    await em.persistAndFlush(savedNotification)
    await em.persistAndFlush(new notifDomain.Notification(
      user2, NOTIFICATION_ACTION.NODES_REMOVED, "test", SEVERITY.ERROR
    ))

    const unread = await notificationService.getUnreadNotifications(userId)
    expect(unread.length).to.equal(1) // only one despite two saved
    expect(unread[0].id).to.equal(savedNotification.id)
  })

  it('Test update Notification', async() => {
    const savedNotification = new notifDomain.Notification(
      user1, NOTIFICATION_ACTION.NODES_REMOVED, "test", SEVERITY.ERROR
    )
    await em.persistAndFlush(savedNotification)

    await notificationService.updateDeliveredAt(savedNotification.id, new Date(), userId)

    const loadedFromDb = await em.findOneOrFail(notifDomain.Notification, savedNotification.id)
    expect(loadedFromDb.deliveredAt).not.to.be.null()
  })

  it('Test update Notification with PermissionError', async() => {
    const savedNotification = new notifDomain.Notification(
      user1, NOTIFICATION_ACTION.NODES_REMOVED, "test", SEVERITY.ERROR
    )
    await em.persistAndFlush(savedNotification)

    try {
      await notificationService.updateDeliveredAt(savedNotification.id, new Date(), 101)
      expect.fail("Validation should have thrown error")
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).to.equal('Error: You do have permissions to access this entity')
    }
  })
})
