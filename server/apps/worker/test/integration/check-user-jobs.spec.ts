/* eslint-disable max-len */
/* eslint-disable no-inline-comments */
/* eslint-disable no-undefined */
import type { EntityManager } from '@mikro-orm/core'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { User } from '@shared/domain/user/user.entity'
import { getMainQueue } from '@shared/queue'
import { TASK_TYPE } from '@shared/queue/task.input'
import { expect } from 'chai'
import { create, generate, db } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import type { UserCtx } from '@shared/types'
import { range } from 'ramda'
import { mocksReset as queueMocksReset } from '../utils/mocks'

const createCheckUserJobsTask = async (user: UserCtx) => {
  const defaultTestQueue = getMainQueue()
  await defaultTestQueue.add(TASK_TYPE.CHECK_USER_JOBS, {
    type: TASK_TYPE.CHECK_USER_JOBS,
    payload: undefined,
    user,
  })
}

describe('TASK: check-user-jobs', () => {
  let em: EntityManager
  let user: User
  let userContext: UserCtx
  let httpsApp: App
  let normalApp: App

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()
    user = create.userHelper.createAdmin(em)
    httpsApp = create.appHelper.createHTTPS(em, { user })
    normalApp = create.appHelper.createRegular(em, { user })
    await em.flush()
    userContext = { id: user.id, dxuser: user.dxuser, accessToken: 'fake-token' }
    mocksReset()
    queueMocksReset()
  })

  it('adds the correct missing job sync tasks to the queue', async () => {
    const jobs = [
      create.jobHelper.create(em, { user, app: normalApp }, { state: JOB_STATE.RUNNING }), // Should be ignored
      create.jobHelper.create(em, { user, app: normalApp }, { state: JOB_STATE.FAILED }), // Should be ignored
      create.jobHelper.create(em, { user, app: httpsApp }, { state: JOB_STATE.IDLE }),
      create.jobHelper.create(em, { user, app: httpsApp }, { state: JOB_STATE.IDLE }),
      create.jobHelper.create(em, { user, app: httpsApp }, { state: JOB_STATE.RUNNING }),
      create.jobHelper.create(em, { user, app: httpsApp }, { state: JOB_STATE.RUNNING }),
      create.jobHelper.create(em, { user, app: httpsApp }, { state: JOB_STATE.RUNNING }),
      create.jobHelper.create(em, { user, app: httpsApp }, { state: JOB_STATE.TERMINATING }),
      create.jobHelper.create(em, { user, app: httpsApp }, { state: JOB_STATE.TERMINATING }),
      create.jobHelper.create(em, { user, app: httpsApp }, { state: JOB_STATE.TERMINATING }),
      create.jobHelper.create(em, { user, app: httpsApp }, { state: JOB_STATE.TERMINATED }),
      create.jobHelper.create(em, { user, app: httpsApp }, { state: JOB_STATE.FAILED }),
    ]
    await em.flush()

    const platformStatesAndBullJob = [
      [JOB_STATE.RUNNING, undefined],
      [JOB_STATE.FAILED, undefined],
      [JOB_STATE.IDLE, undefined], // Sync job missing
      [JOB_STATE.IDLE, generate.bullQueueRepeatable.syncJobStatus(jobs[3].dxid)],
      [JOB_STATE.TERMINATED, undefined], // Sync job missing
      [JOB_STATE.RUNNING, generate.bullQueueRepeatable.syncJobStatusOrphaned(jobs[5].dxid)], // Sync job present but orphaned
      [JOB_STATE.RUNNING, generate.bullQueueRepeatable.syncJobStatus(jobs[6].dxid)],
      [JOB_STATE.TERMINATING, generate.bullQueueRepeatable.syncJobStatus(jobs[7].dxid)],
      [JOB_STATE.TERMINATED, undefined], // Sync job missing and platform state is different
      [JOB_STATE.TERMINATING, generate.bullQueueRepeatable.syncJobStatusOrphaned(jobs[9].dxid)], // Sync job present but orphaned
      [JOB_STATE.TERMINATED, undefined],
      [JOB_STATE.FAILED, undefined],
    ]

    expect(jobs.length).to.equal(platformStatesAndBullJob.length)

    let apiCallCounter = 0
    for (const i of range(0, jobs.length)) {
      const job = jobs[i]
      // Normal apps are ignored, hence ignore them
      if (!job.app.getEntity().isHTTPS()) {
        continue
      }

      const stateAndJob = platformStatesAndBullJob[i]
      fakes.client.jobDescribeFake.onCall(apiCallCounter).returns({
        id: job.dxid,
        state: stateAndJob[0],
      })

      fakes.queue.findRepeatableFake.onCall(apiCallCounter).returns(stateAndJob[1])
      apiCallCounter += 1
    }

    await createCheckUserJobsTask(userContext)

    // Expect job sync calls to be made on missing or orphaned jobs
    expect(fakes.queue.createSyncJobStatusTaskFake.callCount).to.equal(6)

    const jobDxids = jobs.map((job) => job.dxid)
    const callArgs = fakes.queue.createSyncJobStatusTaskFake.getCalls().map((call) => call.args[0])
    callArgs.forEach((callArg) => {
      callArg.index = jobDxids.indexOf(callArg.dxid)
    })
    // Useful for debugging:
    // console.log('createSyncJobStatusTaskFake calls:')
    // console.log(callArgs)

    // Expected jobs that should have sync tasks recreated
    const expectedJobIndexes = [0, 3, 4, 7, 8, 9]
    for (const i of range(0, expectedJobIndexes.length)) {
      const payload = callArgs[i]
      expect(payload).to.have.property('dxid', jobs[expectedJobIndexes[i]].dxid)
    }

    // 2 of the jobs have orphaned sync tasks should be removed
    expect(fakes.queue.removeRepeatableJobsFake.callCount).to.equal(2)
  })
})
