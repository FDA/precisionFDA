import { wrap, EntityManager } from '@mikro-orm/core'
import { database, queue } from '@pfda/https-apps-shared'
import { App, User } from '@pfda/https-apps-shared/src/domain'
import { expect } from 'chai'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { fakes as queueFakes, mocksReset as queueMocksReset } from '../utils/mocks'
import { JobOptions } from 'bull'
import type { BasicUserJob } from '@pfda/https-apps-shared/src/queue/task.input'

const createUserCheckupTask = async (user: BasicUserJob['user']) => {
  const options: JobOptions = { jobId: `${queue.TASKS.USER_CHECKUP}` }
  const defaultTestQueue = queue.getQueue()
  // .add() is stubbed by default
  await defaultTestQueue.add({
    type: queue.TASKS.USER_CHECKUP,
    user,
  }, options)
}

describe('TASK: user-checkup', () => {
  let em: EntityManager
  let user: User
  let app: App

  beforeEach(async () => {
    // probably not needed
    // await emptyDefaultQueue()
    await db.dropData(database.connection())
    em = database.orm().em
    em.clear()
    user = create.userHelper.createAdmin(em)
    app = create.appHelper.create(em, { user })
    await em.flush()
    // reset fakes
    mocksReset()
    queueMocksReset()
  })

  it('processes a queue task - calls the queue handlers', async () => {
    const job = create.jobHelper.create(em, { user, app }, { ...generate.job.simple })
    await em.flush()

    await createUserCheckupTask({ id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' })
    expect(queueFakes.addToQueueStub.calledOnce).to.be.true()
  })
})
