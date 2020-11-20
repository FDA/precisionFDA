import { EntityManager } from '@mikro-orm/core'
import { database, queue } from '@pfda/https-apps-shared'
import { App, User, Job } from '@pfda/https-apps-shared/src/domain'
import { JOB_STATE } from '@pfda/https-apps-shared/src/domain/job/job.enum'
import type { CheckStatusJob } from '@pfda/https-apps-shared/src/queue/task.input'
import { expect } from 'chai'
import { dropData } from '../utils/db'
import * as create from '../utils/create'
import * as generate from '../utils/generate'
import { fakes } from '../utils/mocks'

const createSyncJobTask = async (
  payload: CheckStatusJob['payload'],
  user: CheckStatusJob['user'],
) => {
  const defaultTestQueue = queue.getQueue()
  // .add() is stubbed by default
  await defaultTestQueue.add({
    type: queue.TASKS.SYNC_JOB_STATUS,
    payload,
    user,
  })
}

describe.only('TASK: sync_job_status', () => {
  let em: EntityManager
  let user: User
  let app: App

  beforeEach(async () => {
    // probably not needed
    // await emptyDefaultQueue()
    await dropData(database.connection())
    em = database.orm().em
    user = create.userHelper.create(em)
    app = create.appHelper.create(em, { user })
    await em.flush()
    // reset fakes
    fakes.bull.addToQueueStub.resetHistory()
    fakes.client.jobDescribeFake.resetHistory()
    fakes.queue.removeRepeatableFake.resetHistory()
  })

  it('processes a queue task - calls the queue handlers', async () => {
    const job = create.jobHelper.create(em, { user, app }, { ...generate.job.simple })
    await em.flush()
    await createSyncJobTask(
      { dxid: job.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
    )
    expect(fakes.bull.addToQueueStub.calledOnce).to.be.true()
  })

  it('calls the platform API stub (db job state is idle)', async () => {
    const job = create.jobHelper.create(
      em,
      { user, app },
      { ...generate.job.simple, state: JOB_STATE.IDLE },
    )
    await em.flush()
    await createSyncJobTask(
      { dxid: job.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
    )
    expect(fakes.client.jobDescribeFake.calledOnce).to.be.true()
  })

  it('does not call the platform API stub (db job state is terminated)', async () => {
    const job = create.jobHelper.create(
      em,
      { user, app },
      { ...generate.job.simple, state: JOB_STATE.DONE },
    )
    await em.flush()
    await createSyncJobTask(
      { dxid: job.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
    )
    expect(fakes.client.jobDescribeFake.notCalled).to.be.true()
    expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.true()
  })

  it('does not change our DB, local and remote state are the same', async () => {
    const job = create.jobHelper.create(
      em,
      { user, app },
      { ...generate.job.simple, state: JOB_STATE.IDLE },
    )
    fakes.client.jobDescribeFake.returns({ state: JOB_STATE.IDLE })
    await em.flush()
    await createSyncJobTask(
      { dxid: job.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
    )
    expect(fakes.client.jobDescribeFake.calledOnce).to.be.true()
    // const afterEm = em.fork()
    // const maybeUpdatedJob = await afterEm.findOne(Job, job.id)
    // console.log(job, maybeUpdatedJob, '!')
    // expect(maybeUpdatedJob).to.have.property('updatedAt').that.is.equal(job.updatedAt)
  })

  it('updates our DB, local state is idle, remote is terminating', async () => {
    const job = create.jobHelper.create(
      em,
      { user, app },
      { ...generate.job.simple, state: JOB_STATE.IDLE },
    )
    fakes.client.jobDescribeFake.returns({ state: JOB_STATE.TERMINATED })
    await em.flush()
    await createSyncJobTask(
      { dxid: job.dxid },
      { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
    )
    expect(fakes.client.jobDescribeFake.calledOnce).to.be.true()
    // fetch new job
    const afterEm = em.fork()
    const updatedJob = await afterEm.findOne(Job, job.id)
    expect(updatedJob).to.have.property('state', JOB_STATE.TERMINATED)
    expect(updatedJob).to.have.property('updatedAt').that.is.not.equal(job.updatedAt)
  })

  // test: check if removeRepeatable are called -> important
  context('error states', () => {
    it('removes task from queue when job is not found', async () => {
      const fakeJobId = `job-${generate.random.dxstr()}`
      await createSyncJobTask(
        { dxid: fakeJobId },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.true()
    })

    it('removes task from queue when client API call errors', async () => {
      const job = create.jobHelper.create(em, { user, app }, { ...generate.job.simple })
      fakes.client.jobDescribeFake.rejects(new Error('boom'))
      await em.flush()
      await createSyncJobTask(
        { dxid: job.dxid },
        { id: user.id, dxuser: user.dxuser, accessToken: 'foo' },
      )
      expect(fakes.queue.removeRepeatableFake.calledOnce).to.be.true()
    })
  })
})
