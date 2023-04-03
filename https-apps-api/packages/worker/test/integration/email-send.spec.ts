import { EntityManager } from '@mikro-orm/core'
import { database, queue } from '@pfda/https-apps-shared'
import { App, User } from '@pfda/https-apps-shared/src/domain'
import type { SendEmailJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { expect } from 'chai'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import { EMAIL_TYPES } from 'shared/src/domain/email/email.config'
import {
  fakes as queueFakes,
  mocksReset as queueMocksReset,
} from '../utils/mocks'

const createSendEmailTask = async (
  payload: SendEmailJob['payload'],
  user: SendEmailJob['user'],
) => {
  const defaultTestQueue = queue.getMainQueue()
  // .add() is stubbed by default
  await defaultTestQueue.add({
    type: queue.types.TASK_TYPE.SEND_EMAIL,
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
    expect(call.args[0].type).to.equal('send_email')
    expect(call.args[0].payload).to.equal(payload)
    expect(call.args[0].user.dxuser).to.equal(user.dxuser)
  })

  // TODO: Add more tests
})
