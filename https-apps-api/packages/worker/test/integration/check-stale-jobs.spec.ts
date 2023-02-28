import { wrap, EntityManager } from '@mikro-orm/core'
import { database, queue } from '@pfda/https-apps-shared'
import { App, User } from '@pfda/https-apps-shared/src/domain'
import { expect } from 'chai'
import { create, generate, db } from '@pfda/https-apps-shared/src/test'
import { fakes, mocksReset } from '@pfda/https-apps-shared/src/test/mocks'
import type { CheckStaleJobsJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { fakes as queueFakes, mocksReset as queueMocksReset } from '../utils/mocks'
import { JobOptions } from 'bull'
import { JOB_STATE } from 'shared/src/domain/job/job.enum'

const createCheckStaleJobsTask = async (
  user: CheckStaleJobsJob['user'],
) => {
  const options: JobOptions = { jobId: `${queue.types.TASK_TYPE.CHECK_STALE_JOBS}` }
  const defaultTestQueue = queue.getStatusQueue()
  // .add() is stubbed by default
  await defaultTestQueue.add({
    type: queue.types.TASK_TYPE.CHECK_STALE_JOBS,
    user,
  }, options)
}

describe('TASK: check-stale-jobs', () => {
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
    await createCheckStaleJobsTask({
      id: user.id, accessToken: 'fake-token', dxuser: user.dxuser,
    })
    expect(queueFakes.addToQueueStub.calledOnce).to.be.true()
  })

  it('sends email if there are running or stale jobs', async () => {
    const runningJob = create.jobHelper.create(em, { user, app }, {
      ...generate.job.simple,
      state: JOB_STATE.RUNNING,
    })

    const staleJob = create.jobHelper.create(em, { user, app }, {
      ...generate.job.simple,
      state: JOB_STATE.RUNNING,
      createdAt: new Date(2020, 1, 1),
    })
    await em.flush()

    await createCheckStaleJobsTask({
      id: user.id, accessToken: 'fake-token', dxuser: user.dxuser,
    })
    expect(queueFakes.addToQueueStub.callCount).to.equal(1)

    const firstCall = queueFakes.addToQueueStub.getCall(0)
    expect(firstCall.args[0].type).to.equal('check_stale_jobs')
    expect(firstCall.args[1].jobId).to.equal('check_stale_jobs')

    expect(fakes.queue.createEmailSendTaskFake.calledTwice).to.be.true()
    const [email, userCtx] = fakes.queue.createEmailSendTaskFake.getCall(0).args
    expect(email).to.have.property('to', user.email)
    expect(email).to.have.property('subject', 'Stale jobs report')

    const [secondEmail] = fakes.queue.createEmailSendTaskFake.getCall(1).args
    expect(secondEmail).to.have.property('to', 'precisionfda-no-reply@dnanexus.com')
  })
})
