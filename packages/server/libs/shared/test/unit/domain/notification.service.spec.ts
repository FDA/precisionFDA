import { Reference } from '@mikro-orm/core'
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { createClient } from 'redis'
import { stub } from 'sinon'
import { database } from '@shared/database'
import { Notification } from '@shared/domain/notification/notification.entity'
import { NotificationRepository } from '@shared/domain/notification/notification.repository'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { PermissionError } from '@shared/errors'
import { NOTIFICATIONS_QUEUE } from '@shared/services/redis.service'
import { create, db } from '@shared/test'

describe('Notification service tests', () => {
  let em: EntityManager<MySqlDriver>
  let userCtx: UserContext
  let user1: User
  let user2: User
  let notificationService: NotificationService
  let notificationRepo: NotificationRepository
  const userId = 100
  type RedisClientType = ReturnType<typeof createClient>

  const publishStub = stub()
  const redisClient = {
    publish: publishStub,
  } as unknown as RedisClientType

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user1 = create.userHelper.create(em, { id: userId })
    user2 = create.userHelper.create(em, { id: 101 })
    await em.flush()
    userCtx = {
      id: userId,
    } as UserContext
    notificationRepo = em.getRepository(Notification)
    notificationService = new NotificationService(em, userCtx, notificationRepo)

    publishStub.reset()
    publishStub.resolves()
  })

  it('Test create Notification', async () => {
    notificationService = new NotificationService(em, userCtx, notificationRepo, redisClient)
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
    expect(publishStub.callCount).to.be.equal(1)
    expect(publishStub.firstCall.args[0]).to.equal(NOTIFICATIONS_QUEUE)
    const published = JSON.parse(publishStub.firstCall.args[1])
    expect(published.userId).to.be.equal(1)
    expect(published.notification).to.deep.include({
      id: 1,
      action: NOTIFICATION_ACTION.NODES_REMOVED,
      message: 'msg',
      severity: SEVERITY.WARN,
    })
  })

  it('Test create Notification with linkTitle and linkUrl', async () => {
    notificationService = new NotificationService(em, userCtx, notificationRepo, redisClient)
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
    expect(publishStub.callCount).to.be.equal(1)
    expect(publishStub.firstCall.args[0]).to.equal(NOTIFICATIONS_QUEUE)
    const published = JSON.parse(publishStub.firstCall.args[1])
    expect(published.notification).to.deep.include({
      action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_COMPLETED,
      message: 'msg',
      severity: SEVERITY.WARN,
      meta: {
        linkTitle: 'hello',
        linkUrl: 'https://world.xyz',
      },
    })
  })

  it('Test get and deliver unread Notifications', async () => {
    const savedNotification = new Notification(
      Reference.createFromPK(User, user1.id),
      '1',
      NOTIFICATION_ACTION.NODES_REMOVED,
      'test',
      SEVERITY.ERROR,
    )
    await em.persistAndFlush(savedNotification)
    await em.persistAndFlush(
      new Notification(
        Reference.createFromPK(User, user2.id),
        '2',
        NOTIFICATION_ACTION.NODES_REMOVED,
        'test',
        SEVERITY.ERROR,
      ),
    )

    const unread = await notificationService.fetchAndMarkDelivered()
    expect(unread.length).to.equal(1) // only one despite two saved
    expect(unread[0].id).to.equal(savedNotification.id)
  })

  it('Test update Notification', async () => {
    const savedNotification = new Notification(
      Reference.createFromPK(User, user1.id),
      '1',
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
    notificationService = new NotificationService(em, userCtx, notificationRepo)

    const savedNotification = new Notification(
      Reference.createFromPK(User, user1.id),
      '1',
      NOTIFICATION_ACTION.NODES_REMOVED,
      'test',
      SEVERITY.ERROR,
    )
    await em.persistAndFlush(savedNotification)

    try {
      await notificationService.updateDeliveredAt(savedNotification.id, new Date())
      expect.fail('Validation should have thrown error')
    } catch (error: unknown) {
      if (error instanceof PermissionError) {
        expect(error.name).to.equal('PermissionError')
        expect(error.message).to.equal('Error: You do not have permissions to access this entity')
      }
    }
  })
})
