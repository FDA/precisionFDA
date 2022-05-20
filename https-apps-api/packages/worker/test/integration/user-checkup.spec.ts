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
  const options: JobOptions = { jobId: `${queue.types.TASK_TYPE.USER_CHECKUP}` }
  const defaultTestQueue = queue.getStatusQueue()
  // .add() is stubbed by default
  await defaultTestQueue.add({
    type: queue.types.TASK_TYPE.USER_CHECKUP,
    user,
  }, options)
}

describe('TASK: user-checkup', () => {
  let em: EntityManager
  let user: User

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em
    em.clear()
    user = create.userHelper.createAdmin(em)
    await em.flush()
    // reset fakes
    mocksReset()
    queueMocksReset()
  })

  it('processes a queue task - calls the queue handlers', async () => {
    await createUserCheckupTask({ id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' })
    expect(queueFakes.addToQueueStub.calledOnce).to.be.true()
  })
})
