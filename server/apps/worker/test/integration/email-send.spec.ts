import { EntityManager } from '@mikro-orm/core'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { User } from '@shared/domain/user/user.entity'
import { getMainQueue } from '@shared/queue'
import { TASK_TYPE } from '@shared/queue/task.input'
import type { SendEmailJob } from '@shared/queue/task.input'
import { expect } from 'chai'
import { create, db } from '@shared/test'
import { mocksReset } from '@shared/test/mocks'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { fakes as queueFakes, mocksReset as queueMocksReset } from '../utils/mocks'

const createSendEmailTask = async (
  payload: SendEmailJob['payload'],
  user: SendEmailJob['user'],
) => {
  const defaultTestQueue = getMainQueue()
  // .add() is stubbed by default
  await defaultTestQueue.add(TASK_TYPE.SEND_EMAIL, {
    type: TASK_TYPE.SEND_EMAIL,
    payload,
    user,
  })
}
describe('TASK: email-send', () => {
  let em: EntityManager
  let user: User
  let app: App

  beforeEach(async () => {
    // probably not needed
    // await emptyDefaultQueue()
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.createAdmin(em)
    app = create.appHelper.createHTTPS(em, { user })
    await em.flush()
    // reset fakes
    mocksReset()
    queueMocksReset()
  })

  it('processes a queue task - calls the queue handlers', async () => {
    const payload = {
      emailType: EMAIL_TYPES.newContentAdded,
      to: 'no-reply@dnanexus.com',
      subject: 'Some subject',
      body: 'Some body',
    }
    await createSendEmailTask(payload, {
      id: user.id,
      accessToken: 'fake-token',
      dxuser: user.dxuser,
    })
    expect(queueFakes.addToQueueStub.calledOnce).to.be.true()

    const call = queueFakes.addToQueueStub.getCall(0)
    expect(call.args[1].type).to.equal('send_email')
    expect(call.args[1].payload).to.equal(payload)
    expect(call.args[1].user.dxuser).to.equal(user.dxuser)
  })

  // TODO: Add more tests
})
