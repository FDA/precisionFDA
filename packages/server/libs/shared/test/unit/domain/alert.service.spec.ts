//TODO - actually write tests
import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { Alert } from '@shared/domain/alert/entity/alert.entity'
import { AlertService } from '@shared/domain/alert/services/alert.service'
import { User } from '@shared/domain/user/user.entity'
import { create, db } from '../../../src/test'
import { expect } from 'chai'

describe('AlertService tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let userCtx: UserCtx
  let alertService: AlertService

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>
    user = create.userHelper.createAdmin(em)
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }
    alertService = new AlertService(em)
  })

  it('create alert', async () => {
    const now = new Date()
    const startTime = new Date(now.getTime())
    const endTime = new Date(now.getTime())
    startTime.setDate(now.getDate() + 1)
    endTime.setDate(now.getDate() + 3)

    const alert = await alertService.create({
      title: 'system alert',
      content: 'system will be down in 1 day for maintenance',
      type: 'danger',
      startTime: startTime,
      endTime: endTime,
    })

    expect(alert.id).eq(1)
    expect(alert.title).eq('system alert')
    expect(alert.content).eq('system will be down in 1 day for maintenance')
    expect(alert.type).eq('danger')
    expect(alert.startTime.toString()).eq(startTime.toString())
    expect(alert.endTime.toString()).eq(endTime.toString())
  })

  it('update alert', async () => {
    const alert = create.alertHelper.createFuture(em)
    await em.flush()
    const now = new Date()
    const updatedAlert = await alertService.update(alert.id, {
      title: 'system alert - updated',
      content: 'system will be down NOW for maintenance',
      type: 'danger',
      startTime: now,
      endTime: alert.endTime,
    })

    expect(updatedAlert.id).eq(alert.id)
    expect(updatedAlert.title).eq('system alert - updated')
    expect(updatedAlert.content).eq('system will be down NOW for maintenance')
    expect(updatedAlert.type).eq('danger')
    expect(updatedAlert.startTime.toString()).eq(now.toString())
    expect(updatedAlert.endTime.toString()).eq(alert.endTime.toString())
  })

  it('delete alert', async () => {
    create.alertHelper.createFuture(em)
    const alert2 = create.alertHelper.createExpired(em)
    await em.flush()
    await alertService.delete(alert2.id)
    const foundAlert = await em.findOne(Alert, { id: alert2.id })
    const remainingAlerts = await em.find(Alert, {})
    expect(foundAlert).to.be.null()
    expect(remainingAlerts.length).eq(1)
  })

  it('get alerts without filter', async () => {
    create.alertHelper.createFuture(em)
    create.alertHelper.createExpired(em)
    create.alertHelper.createActive(em)
    await em.flush()
    const foundAlerts = await alertService.getAll(undefined)
    expect(foundAlerts.length).eq(3)
  })

  it('get alerts with filter', async () => {
    create.alertHelper.createFuture(em)
    create.alertHelper.createExpired(em)
    create.alertHelper.createActive(em)
    await em.flush()
    const activeAlerts = await alertService.getAll(true)
    expect(activeAlerts.length).eq(1)
    const nonActiveAlerts = await alertService.getAll(false)
    expect(nonActiveAlerts.length).eq(2)
  })
})
